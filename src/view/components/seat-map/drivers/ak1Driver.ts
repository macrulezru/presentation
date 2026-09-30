import { InvalidInputError } from '../models/errors';

import { deriveRowLevelFeaturesForRows } from './rowFeatures';

import type { SeatMapDriver } from './types';
import type {
  UniversalSeatMap,
  FlightWithDirection,
  Flight,
  Segment,
  Deck,
  Cabin,
  Door,
  Row,
  Cell,
  SeatCell,
  EmptyCell,
  AisleCell,
  SeatAvailability,
  SeatFeature,
  Direction,
} from '../types/seatmap.types';

// ----------------------------- Входные типы (AK1) -----------------------------
interface AK1Cell {
  letter: string;
  type: 'S' | 'E';
  props: string;
  service_id: string;
  freetext: string;
  available: 'Y' | 'N';
  restriction: string;
  price: string;
  currency: string;
}

interface AK1Row {
  number: string;
  cells: AK1Cell[];
}

interface AK1Cabin {
  service_class: string;
  seat_labels: string;
  deck: string;
  available: string;
  width: number;
  height: number;
  rows: AK1Row[];
  /** Основные двери/входы салона (не привязаны к конкретному ряду) */
  doors?: Door[];
}

interface AK1Segment {
  segment_id: string;
  segment_key: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_datetime?: string;
  arrival_datetime?: string;
  equipment: string;
  passenger_id: string;
  cabins: AK1Cabin[];
}

interface AK1Flight {
  flight_id: string;
  flight_type?: string;
  segments: AK1Segment[];
}

interface AK1Data {
  flights?: AK1Flight[];
  segments?: AK1Segment[];
}

// ----------------------------- Утилиты -----------------------------
function parseProps(props: string): string[] {
  if (!props) return [];
  return props
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);
}

function mapStatus(available: 'Y' | 'N', restriction: string): SeatAvailability {
  if (available === 'Y') return 'available';
  if (restriction === 'N') return 'occupied';
  return 'blocked';
}

function parseSegmentKey(key: string): {
  flightNumber?: string;
  departureDateTime?: string;
} {
  const parts = key.split(' ');
  if (parts.length >= 2) {
    const flightNumber = parts[0];
    const date = parts.slice(1).join(' ');
    return { flightNumber, departureDateTime: date };
  }
  return { flightNumber: key, departureDateTime: undefined };
}

function buildSegmentFromAK1(ak1Segment: AK1Segment): Segment {
  const cabinData = ak1Segment.cabins[0];
  const deckName = cabinData.deck || 'Maindeck';
  const { flightNumber, departureDateTime } = parseSegmentKey(ak1Segment.segment_key);

  const rows: Row[] = cabinData.rows.map(row => {
    const rowNumber = parseFloat(row.number);

    const cells: Cell[] = row.cells.map(cell => {
      const propsList = parseProps(cell.props);

      // Определяем тип ячейки
      if (cell.type === 'S') {
        // Это место
        const availability = mapStatus(cell.available, cell.restriction);
        const features: SeatFeature[] = propsList;
        const price = cell.price ? parseFloat(cell.price) : undefined;
        const currency = cell.currency || undefined;

        return {
          kind: 'seat',
          letter: cell.letter,
          availability,
          features,
          price,
          currency,
          serviceId: cell.service_id || undefined,
          restrictions: cell.restriction ? [cell.restriction] : [],
          freeText: cell.freetext || undefined,
          props: propsList.length ? propsList : undefined,
        } as SeatCell;
      } else {
        // type === 'E' - пустая ячейка
        if (propsList.includes('Bulkhead') && propsList.includes('NoRow')) {
          // Перегородка с NoRow
          return { kind: 'empty', props: ['Bulkhead', 'NoRow'] } as EmptyCell;
        } else if (propsList.includes('Bulkhead')) {
          // Перегородка без NoRow
          return { kind: 'empty', props: ['Bulkhead'] } as EmptyCell;
        } else if (propsList.includes('NoRow')) {
          // Служебный ряд
          return { kind: 'empty', props: ['NoRow'] } as EmptyCell;
        } else {
          // Проход
          return { kind: 'aisle', width: 1 } as AisleCell;
        }
      }
    });

    // Перегородка определяется по содержимому ряда (в нём нет ни одного
    // настоящего места), а не по номеру — перегородка может стоять и в
    // начале салона, и между любыми двумя рядами
    const isBulkheadRow = cells.every(cell => cell.kind !== 'seat');

    return {
      rowNumber,
      rowProps: isBulkheadRow ? ['Bulkhead', 'NoRow'] : [],
      cells,
    };
  });

  const cabin: Cabin = {
    cabinId: cabinData.service_class,
    cabinClass: cabinData.service_class,
    serviceClass: cabinData.service_class,
    width: cabinData.width,
    height: cabinData.height,
    doors: cabinData.doors,
    rows: deriveRowLevelFeaturesForRows(rows),
  };

  const deck: Deck = {
    deckId: deckName.toLowerCase().replace(/\s+/g, '-'),
    deckName,
    cabins: [cabin],
  };

  return {
    segmentId: ak1Segment.segment_id,
    flightNumber,
    departureAirport: ak1Segment.departure_airport,
    arrivalAirport: ak1Segment.arrival_airport,
    departureDateTime: ak1Segment.departure_datetime || departureDateTime,
    arrivalDateTime: ak1Segment.arrival_datetime,
    aircraftCode: ak1Segment.equipment,
    aircraftType: undefined,
    decks: [deck],
  };
}

// ----------------------------- Драйвер -----------------------------
export const ak1Driver: SeatMapDriver = {
  clientId: 'AK1',

  async parse(
    rawData: unknown,
    options?: { flightId?: string; segmentId?: string },
  ): Promise<UniversalSeatMap> {
    if (!rawData || typeof rawData !== 'object') {
      throw new InvalidInputError('AK1: Raw data must be an object');
    }

    const data = rawData as AK1Data;

    // Получаем все рейсы
    let flights: AK1Flight[] = [];
    if (data.flights && data.flights.length > 0) {
      flights = data.flights;
    } else if (data.segments && data.segments.length > 0) {
      flights = [
        {
          flight_id: 'unknown',
          flight_type: 'outbound',
          segments: data.segments,
        },
      ];
    } else {
      throw new InvalidInputError('AK1: Missing or invalid flights/segments');
    }

    // Фильтруем по flightId
    if (options?.flightId) {
      const found = flights.find(f => f.flight_id === options.flightId);
      if (!found) {
        throw new InvalidInputError(
          `AK1: Flight with id "${options.flightId}" not found`,
        );
      }
      flights = [found];
    }

    const flightWithDirections: FlightWithDirection[] = flights.map(ak1Flight => {
      let targetSegments = ak1Flight.segments;
      if (options?.segmentId) {
        const found = targetSegments.find(s => s.segment_id === options.segmentId);
        if (!found) {
          throw new InvalidInputError(
            `AK1: Segment with id "${options.segmentId}" not found in flight ${ak1Flight.flight_id}`,
          );
        }
        targetSegments = [found];
      }

      if (targetSegments.length === 0) {
        throw new InvalidInputError(
          `AK1: No segments to process for flight ${ak1Flight.flight_id}`,
        );
      }

      for (const seg of targetSegments) {
        if (!seg.cabins || seg.cabins.length === 0) {
          throw new InvalidInputError(`AK1: Segment ${seg.segment_id} has no cabins`);
        }
      }

      const flightSegments: Segment[] = targetSegments.map(seg =>
        buildSegmentFromAK1(seg),
      );

      const flight: Flight = {
        flightNumber: ak1Flight.flight_id,
        departureAirport: flightSegments[0]?.departureAirport,
        arrivalAirport: flightSegments[flightSegments.length - 1]?.arrivalAirport,
        departureDateTime: flightSegments[0]?.departureDateTime,
        arrivalDateTime: flightSegments[flightSegments.length - 1]?.arrivalDateTime,
        segments: flightSegments,
      };

      const direction: Direction = ak1Flight.flight_type === 'return' ? 'BACK' : 'TO';

      return { direction, flight };
    });

    return {
      formatVersion: '1.0',
      clientId: this.clientId,
      flights: flightWithDirections,
    };
  },
};
