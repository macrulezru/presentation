import { BaseModel } from '@/models/base-model';

export interface SegmentRaw {
  ak: string;
  ak_full_name?: string;
  flight_number: string;
  departure_airport_full_name?: string;
  departure_airport_code?: string;
  arrival_airport_full_name?: string;
  arrival_airport_code?: string;
  departure_city_full_name?: string;
  departure_city_code?: string;
  arrival_city_full_name?: string;
  arrival_city_code?: string;
  departure_time?: string;
  arrival_time?: string;
  [key: string]: any;
}

export interface DirectionRaw {
  date: string;
  flights: any[];
  [key: string]: any;
}

export class DirectionModel {
  readonly date: string;
  readonly flights: FlightModel[];

  constructor(raw: DirectionRaw) {
    this.date = raw.date;
    this.flights = Array.isArray(raw.flights)
      ? raw.flights.map(f => new FlightModel(f))
      : [];
  }
  departure_city_full_name?: string;
  arrival_city_full_name?: string;
  departure_time?: string;
  arrival_time?: string;
  [key: string]: any;
}

export class SegmentModel extends BaseModel<SegmentRaw> {
  isValid(): boolean {
    // Для демо всегда true
    return true;
  }
  readonly ak?: string;
  readonly akFullName?: string;
  readonly flightNumber?: string;
  readonly fromAirport?: string;
  readonly toAirport?: string;
  readonly fromCity?: string;
  readonly toCity?: string;
  readonly depTime?: string;
  readonly arrTime?: string;

  constructor(raw: SegmentRaw) {
    super(raw);
    this.ak = raw.ak;
    this.akFullName = raw.ak_full_name || raw.ak;
    this.flightNumber = raw.flight_number;
    this.fromAirport = raw.departure_airport_full_name || raw.departure_airport_code;
    this.toAirport = raw.arrival_airport_full_name || raw.arrival_airport_code;
    this.fromCity = raw.departure_city_full_name || raw.departure_city_code;
    this.toCity = raw.arrival_city_full_name || raw.arrival_city_code;
    this.depTime = raw.departure_time;
    this.arrTime = raw.arrival_time;
  }

  // Все сегменты считаются валидными для демо
}

export interface FlightRaw {
  segments: SegmentRaw[];
  [key: string]: any;
}

export class FlightModel extends BaseModel<FlightRaw> {
  private _diagnostic?: string;
  readonly segments: SegmentModel[];

  constructor(raw: FlightRaw) {
    super(raw);
    let segments: SegmentRaw[] = [];
    // Проверяем все возможные вложенности
    const { segments: rawSegments, raw: rawRaw } = raw;
    if (Array.isArray(rawSegments) && rawSegments.length) {
      segments = [...rawSegments];
    } else if (rawRaw && Array.isArray(rawRaw.segments) && rawRaw.segments.length) {
      const { segments: nestedSegments } = rawRaw;
      segments = [...nestedSegments];
    } else if (
      rawRaw &&
      rawRaw.raw &&
      Array.isArray(rawRaw.raw.segments) &&
      rawRaw.raw.segments.length
    ) {
      const { segments: deeplyNestedSegments } = rawRaw.raw;
      segments = [...deeplyNestedSegments];
    }
    // Если сегменты лежат во вложенном raw
    if (!segments.length && rawRaw && Array.isArray(rawRaw.segments)) {
      const { segments: fallbackSegments } = rawRaw;
      segments = [...fallbackSegments];
    }
    this.segments = segments.map(seg => new SegmentModel(seg));
    if (!this.segments.length) {
      this._diagnostic = 'no valid segment in flights';
      if (Array.isArray(segments) && segments.length) {
        // Если сегменты есть, но все невалидные — выводим их структуру для отладки
        this._diagnostic += `: ${JSON.stringify(segments[0])}`;
      }
    } else if (!this.segments.some(seg => seg.isValid())) {
      this._diagnostic = `all segments invalid: ${JSON.stringify(segments[0])}`;
    }
  }

  getFirstValidSegment(): SegmentModel | null {
    return this.segments.find(seg => seg.isValid()) || null;
  }

  findSegmentByFlightNumber(flightNumber: string): SegmentModel | undefined {
    return this.segments.find(seg => seg.flightNumber === flightNumber);
  }

  filterSegmentsByAirline(ak: string): SegmentModel[] {
    return this.segments.filter(seg => seg.ak === ak);
  }

  getAirlines(): string[] {
    return Array.from(
      new Set(
        this.segments
          .map(seg => seg.ak)
          .filter((ak): ak is string => typeof ak === 'string'),
      ),
    );
  }

  static findWithValidSegment(
    flights: FlightModel[],
  ): { flight: FlightModel; segment: SegmentModel } | null {
    for (const flight of flights) {
      const seg = flight.getFirstValidSegment();
      if (seg) return { flight, segment: seg };
    }
    return null;
  }
}
