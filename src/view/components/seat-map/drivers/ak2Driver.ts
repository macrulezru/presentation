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

// ----------------------------- Входные типы (AK2) -----------------------------
interface AK2SeatPrice {
  price: number;
  currency: string;
  props: string;
}

interface AK2Cabin {
  cabin_class: string;
  row_templates?: string[];
  first_row_number?: number;
  aisle_symbol?: string;
  seat_statuses?: Record<string, string>;
  seat_prices?: Record<string, AK2SeatPrice>;
  /** Основные двери/входы салона (не привязаны к конкретному ряду) */
  doors?: Door[];
  rows?: Array<{
    number: string;
    cells: Array<{
      letter: string;
      type: string;
      props: string;
      service_id: string;
      freetext: string;
      available: string;
      restriction: string;
      price: string;
      currency: string;
    }>;
  }>;
}

interface AK2Segment {
  segment_id: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_datetime?: string;
  arrival_datetime?: string;
  equipment?: string;
  cabins?: AK2Cabin[];
}

interface AK2Flight {
  flight_id: string;
  flight_type?: string;
  segments: AK2Segment[];
}

interface AK2Data {
  clientId?: string;
  data?: {
    flights?: AK2Flight[];
  };
  flights?: AK2Flight[];
}

// ----------------------------- Утилиты -----------------------------
function parsePropsStr(props: string): string[] {
  if (!props) return [];
  return props
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);
}

function mapStatusFromString(statusStr: string): SeatAvailability {
  if (statusStr === 'available') return 'available';
  if (statusStr === 'occupied') return 'occupied';
  return 'unavailable';
}

function buildSegmentFromAK2(
  ak2Segment: AK2Segment,
  cabinData: AK2Cabin,
  deckName: string,
): Segment {
  let rows: Row[] = [];

  // Построение рядов из row_templates или из rows
  if (cabinData.row_templates && cabinData.seat_statuses) {
    const firstRow = cabinData.first_row_number || 1;
    const aisleSymbol = cabinData.aisle_symbol || '|';
    const seatPrices = cabinData.seat_prices || {};

    // Реальным рядам номер присваивается последовательно, перегородки
    // (шаблоны без единой буквы места) номер не занимают — так что позиция
    // перегородки в списке шаблонов не важна: она может быть первым
    // шаблоном (перед рядом 1) или стоять между любыми двумя рядами
    let nextRowNumber = firstRow;

    for (const template of cabinData.row_templates) {
      const parts = template.split(/\s+/).filter(p => p.trim());
      const hasSeatLetters = parts.some(p => p !== aisleSymbol && !/^_+$/.test(p));

      if (!hasSeatLetters) {
        const bulkheadCells: Cell[] = parts.map(part =>
          part === aisleSymbol
            ? ({ kind: 'aisle', width: 1 } as AisleCell)
            : ({ kind: 'empty', props: ['Bulkhead', 'NoRow'] } as EmptyCell),
        );
        if (bulkheadCells.length > 0) {
          rows.push({
            rowNumber: nextRowNumber - 0.5,
            rowProps: ['Bulkhead', 'NoRow'],
            cells: bulkheadCells,
          });
        }
        continue;
      }

      const rowNumber = nextRowNumber;
      nextRowNumber += 1;

      const cells: Cell[] = parts.map(part => {
        if (part === aisleSymbol) {
          return { kind: 'aisle', width: 1 } as AisleCell;
        }

        // Отдельное заблокированное место внутри обычного ряда (не целая перегородка)
        if (/^_+$/.test(part)) {
          return { kind: 'empty', props: ['Bulkhead', 'NoRow'] } as EmptyCell;
        }

        const letter = part;
        const seatKey = `${rowNumber}${letter}`;
        const statusStr = cabinData.seat_statuses?.[seatKey] || 'unavailable';
        const priceInfo = seatPrices[seatKey];

        const availability = mapStatusFromString(statusStr);
        const features: SeatFeature[] = priceInfo?.props
          ? parsePropsStr(priceInfo.props)
          : [];

        return {
          kind: 'seat',
          letter,
          availability,
          features,
          price: priceInfo?.price,
          currency: priceInfo?.currency,
          serviceId: undefined,
          restrictions: [],
          freeText: seatKey,
          props: features.length ? features : undefined,
        } as SeatCell;
      });

      rows.push({ rowNumber, rowProps: [], cells });
    }
  } else if (cabinData.rows && cabinData.rows.length > 0) {
    // Строим ячейки для каждого ряда как есть, в исходном порядке — перегородка
    // определяется ПОСЛЕ по содержимому ряда (нет ни одного настоящего места),
    // а не по номеру, поэтому может стоять где угодно (в начале салона, между
    // рядами, и их может быть несколько)
    rows = cabinData.rows.map(row => {
      const rowNumber = parseFloat(row.number);
      const cells: Cell[] = row.cells.map(cell => {
        const propsList = parsePropsStr(cell.props);
        if (cell.type === 'E' || cell.letter === '') {
          if (propsList.includes('Bulkhead')) {
            return { kind: 'empty', props: ['Bulkhead'] } as EmptyCell;
          } else if (propsList.includes('NoRow')) {
            return { kind: 'empty', props: ['NoRow'] } as EmptyCell;
          } else {
            return { kind: 'aisle', width: 1 } as AisleCell;
          }
        } else {
          const availability = cell.available === 'Y' ? 'available' : 'occupied';
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
            props: features.length ? features : undefined,
          } as SeatCell;
        }
      });

      const isBulkheadRow = cells.every(cell => cell.kind !== 'seat');

      return {
        rowNumber,
        rowProps: isBulkheadRow ? ['Bulkhead', 'NoRow'] : [],
        cells,
      };
    });
  } else {
    throw new InvalidInputError('AK2: No valid row data found in cabin');
  }

  const cabin: Cabin = {
    cabinId: cabinData.cabin_class,
    cabinClass: cabinData.cabin_class,
    serviceClass: cabinData.cabin_class,
    doors: cabinData.doors,
    rows: deriveRowLevelFeaturesForRows(rows),
  };

  const deck: Deck = {
    deckId: deckName.toLowerCase().replace(/\s+/g, '-'),
    deckName,
    cabins: [cabin],
  };

  return {
    segmentId: ak2Segment.segment_id,
    flightNumber: ak2Segment.equipment,
    departureAirport: ak2Segment.departure_airport,
    arrivalAirport: ak2Segment.arrival_airport,
    departureDateTime: ak2Segment.departure_datetime,
    arrivalDateTime: ak2Segment.arrival_datetime,
    aircraftCode: ak2Segment.equipment,
    aircraftType: undefined,
    decks: [deck],
  };
}

// ----------------------------- Драйвер -----------------------------
export const ak2Driver: SeatMapDriver = {
  clientId: 'AK2',

  async parse(
    rawData: unknown,
    options?: { flightId?: string; segmentId?: string },
  ): Promise<UniversalSeatMap> {
    if (!rawData || typeof rawData !== 'object') {
      throw new InvalidInputError('AK2: Raw data must be an object');
    }

    const data = rawData as AK2Data;

    // Извлекаем список рейсов
    let selectedFlights: AK2Flight[] = [];

    if (data.data?.flights && data.data.flights.length > 0) {
      selectedFlights = data.data.flights;
    } else if (data.flights && data.flights.length > 0) {
      selectedFlights = data.flights;
    } else {
      throw new InvalidInputError('AK2: Missing flights');
    }

    // Фильтруем по flightId
    if (options?.flightId) {
      const found = selectedFlights.find(f => f.flight_id === options.flightId);
      if (!found) {
        throw new InvalidInputError(
          `AK2: Flight with id "${options.flightId}" not found`,
        );
      }
      selectedFlights = [found];
    }

    if (selectedFlights.length === 0) {
      throw new InvalidInputError('AK2: No flights to process');
    }

    const flightWithDirections: FlightWithDirection[] = selectedFlights.map(ak2Flight => {
      let targetSegments = ak2Flight.segments;
      if (options?.segmentId) {
        const found = targetSegments.find(s => s.segment_id === options.segmentId);
        if (!found) {
          throw new InvalidInputError(
            `AK2: Segment with id "${options.segmentId}" not found in flight ${ak2Flight.flight_id}`,
          );
        }
        targetSegments = [found];
      }

      if (targetSegments.length === 0) {
        throw new InvalidInputError(
          `AK2: No segments to process for flight ${ak2Flight.flight_id}`,
        );
      }

      // Для каждого сегмента берём его собственную конфигурацию салона
      const flightSegments: Segment[] = targetSegments.map(seg => {
        if (!seg.cabins || seg.cabins.length === 0) {
          throw new InvalidInputError(`AK2: Segment ${seg.segment_id} has no cabins`);
        }
        const cabinData = seg.cabins[0];
        const deckName = 'Main Deck';
        return buildSegmentFromAK2(seg, cabinData, deckName);
      });

      const flight: Flight = {
        flightNumber: ak2Flight.flight_id,
        departureAirport: flightSegments[0]?.departureAirport,
        arrivalAirport: flightSegments[flightSegments.length - 1]?.arrivalAirport,
        departureDateTime: flightSegments[0]?.departureDateTime,
        arrivalDateTime: flightSegments[flightSegments.length - 1]?.arrivalDateTime,
        segments: flightSegments,
      };

      const direction: Direction = ak2Flight.flight_type === 'return' ? 'BACK' : 'TO';

      return { direction, flight };
    });

    return {
      formatVersion: '1.0',
      clientId: this.clientId,
      flights: flightWithDirections,
    };
  },
};
