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
  SeatAvailability,
  SeatFeature,
  Direction,
} from '../types/seatmap.types';

// ----------------------------- Входные типы (AK3) -----------------------------
interface AK3Segment {
  segment_id: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_datetime?: string;
  arrival_datetime?: string;
  decks?: Array<{
    deck_id: string;
    cabins: Array<{
      cabin_id: string;
      service_class: string;
      seat_grid: Array<Array<string | null>>;
      row_numbers: Array<number>;
      seat_metadata: Record<
        string,
        {
          availability: 'free' | 'occupied' | 'blocked';
          features?: string[];
          price?: number;
          currency?: string;
          service_id?: string;
        }
      >;
      /** Основные двери/входы салона (не привязаны к конкретному ряду) */
      doors?: Door[];
    }>;
  }>;
}

interface AK3Flight {
  flight_id: string;
  flight_type?: string;
  segments: AK3Segment[];
}

interface AK3RawData {
  flights?: AK3Flight[];
  aircraft_code?: string;
}

interface AK3WrapperData {
  clientId?: string;
  data?: AK3RawData;
}

// ----------------------------- Утилиты -----------------------------
function isAK3Data(data: unknown): data is AK3RawData | AK3WrapperData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object' && 'flights' in obj.data) {
    return true;
  }
  if ('flights' in obj) {
    return true;
  }
  return false;
}

function getAK3CoreData(data: AK3RawData | AK3WrapperData): AK3RawData {
  if ('data' in data && data.data) {
    return data.data;
  }
  return data as AK3RawData;
}

function mapAvailability(
  availability: 'free' | 'occupied' | 'blocked',
): SeatAvailability {
  if (availability === 'free') return 'available';
  if (availability === 'occupied') return 'occupied';
  return 'blocked';
}

function buildSegmentFromAK3(
  ak3Segment: AK3Segment,
  deckData: NonNullable<AK3Segment['decks']>[0],
  cabinData: NonNullable<AK3Segment['decks']>[0]['cabins'][0],
  aircraftCode?: string,
): Segment {
  const rows: Row[] = cabinData.seat_grid.map((gridRow, rowIndex) => {
    const rowNumber = cabinData.row_numbers[rowIndex] ?? rowIndex + 1;

    // Проверяем, является ли этот ряд перегородкой
    // Ряд считается перегородкой, если все места (не проходы) имеют статус 'blocked'
    const isBulkheadRow = gridRow.every(item => {
      if (item === '|') return true; // проходы игнорируем при проверке
      if (item === null) {
        // null в ряду перегородки - это перегородка
        return true;
      }
      // Это место - проверяем его статус
      const seatKey = `${rowNumber}${item}`;
      const meta = cabinData.seat_metadata[seatKey];
      return meta?.availability === 'blocked';
    });

    const cells: Cell[] = [];

    gridRow.forEach(item => {
      if (item === '|') {
        // Это проход
        cells.push({ kind: 'aisle', width: 1 });
        return;
      }

      if (item === null) {
        // Это либо перегородка, либо проход в ряду перегородки
        // Определяем по контексту: если ряд перегородка, то это перегородка
        if (isBulkheadRow) {
          cells.push({
            kind: 'empty',
            props: ['Bulkhead', 'NoRow'],
          } as EmptyCell);
        } else {
          // В обычном ряду null быть не должно, но на всякий случай делаем проход
          cells.push({ kind: 'aisle', width: 1 });
        }
        return;
      }

      // Это место
      const seatKey = `${rowNumber}${item}`;
      const meta = cabinData.seat_metadata[seatKey];

      // Проверяем, не является ли это место заблокированным (перегородка в обычном ряду)
      if (meta?.availability === 'blocked') {
        cells.push({
          kind: 'empty',
          props: ['Bulkhead', 'NoRow'],
        } as EmptyCell);
        return;
      }

      if (!meta) {
        cells.push({
          kind: 'seat',
          letter: item,
          availability: 'unavailable',
          features: [],
          freeText: seatKey,
        } as SeatCell);
        return;
      }

      const availability = mapAvailability(meta.availability);
      const features: SeatFeature[] = meta.features || [];

      cells.push({
        kind: 'seat',
        letter: item,
        availability,
        features,
        price: meta.price,
        currency: meta.currency,
        serviceId:
          meta.service_id && meta.service_id.trim() !== '' ? meta.service_id : undefined,
        restrictions: [],
        freeText: seatKey,
        props: features.length ? features : undefined,
      } as SeatCell);
    });

    // ✅ Добавляем rowProps для перегородки
    return {
      rowNumber,
      rowProps: isBulkheadRow ? ['Bulkhead', 'NoRow'] : [],
      cells,
    };
  });

  const cabin: Cabin = {
    cabinId: cabinData.cabin_id,
    cabinClass: cabinData.service_class,
    serviceClass: cabinData.service_class,
    doors: cabinData.doors,
    rows: deriveRowLevelFeaturesForRows(rows),
  };

  const deck: Deck = {
    deckId: deckData.deck_id,
    deckName: deckData.deck_id,
    cabins: [cabin],
  };

  return {
    segmentId: ak3Segment.segment_id,
    flightNumber: undefined,
    departureAirport: ak3Segment.departure_airport,
    arrivalAirport: ak3Segment.arrival_airport,
    departureDateTime: ak3Segment.departure_datetime,
    arrivalDateTime: ak3Segment.arrival_datetime,
    aircraftCode,
    aircraftType: undefined,
    decks: [deck],
  };
}

// ----------------------------- Драйвер -----------------------------
export const ak3Driver: SeatMapDriver = {
  clientId: 'AK3',

  async parse(
    rawData: unknown,
    options?: { flightId?: string; segmentId?: string },
  ): Promise<UniversalSeatMap> {
    if (!isAK3Data(rawData)) {
      throw new InvalidInputError('AK3: Invalid data structure');
    }

    const coreData = getAK3CoreData(rawData);

    let selectedFlights: AK3Flight[] = [];

    if (coreData.flights && coreData.flights.length > 0) {
      selectedFlights = coreData.flights;
    } else {
      throw new InvalidInputError('AK3: Missing flights');
    }

    // Фильтруем по flightId
    if (options?.flightId) {
      const found = selectedFlights.find(f => f.flight_id === options.flightId);
      if (!found) {
        throw new InvalidInputError(
          `AK3: Flight with id "${options.flightId}" not found`,
        );
      }
      selectedFlights = [found];
    }

    if (selectedFlights.length === 0) {
      throw new InvalidInputError('AK3: No flights to process');
    }

    const flightWithDirections: FlightWithDirection[] = selectedFlights.map(ak3Flight => {
      let targetSegments = ak3Flight.segments;
      if (options?.segmentId) {
        const found = targetSegments.find(s => s.segment_id === options.segmentId);
        if (!found) {
          throw new InvalidInputError(
            `AK3: Segment with id "${options.segmentId}" not found in flight ${ak3Flight.flight_id}`,
          );
        }
        targetSegments = [found];
      }

      if (targetSegments.length === 0) {
        throw new InvalidInputError(
          `AK3: No segments to process for flight ${ak3Flight.flight_id}`,
        );
      }

      // Для каждого сегмента берём его собственную конфигурацию палубы и салона
      const flightSegments: Segment[] = targetSegments.map(seg => {
        if (!seg.decks || seg.decks.length === 0) {
          throw new InvalidInputError(`AK3: Segment ${seg.segment_id} has no decks`);
        }
        const deckData = seg.decks[0];
        if (!deckData.cabins || deckData.cabins.length === 0) {
          throw new InvalidInputError(
            `AK3: Segment ${seg.segment_id} has no cabins in deck`,
          );
        }
        const cabinData = deckData.cabins[0];
        return buildSegmentFromAK3(seg, deckData, cabinData, coreData.aircraft_code);
      });

      const flight: Flight = {
        flightNumber: ak3Flight.flight_id,
        departureAirport: flightSegments[0]?.departureAirport,
        arrivalAirport: flightSegments[flightSegments.length - 1]?.arrivalAirport,
        departureDateTime: flightSegments[0]?.departureDateTime,
        arrivalDateTime: flightSegments[flightSegments.length - 1]?.arrivalDateTime,
        segments: flightSegments,
      };

      const direction: Direction = ak3Flight.flight_type === 'return' ? 'BACK' : 'TO';

      return { direction, flight };
    });

    return {
      formatVersion: '1.0',
      clientId: this.clientId,
      flights: flightWithDirections,
    };
  },
};
