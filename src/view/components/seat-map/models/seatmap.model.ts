import type {
  UniversalSeatMap,
  Flight,
  Segment,
  Deck,
  Cabin,
  Door,
  Row,
  Cell,
  SeatCell,
  SeatAvailability,
  SeatFeature,
  Direction,
} from '../types/seatmap.types';

/**
 * Утилитарный класс для работы с данными карты мест.
 * Содержит статические методы для поиска, группировки и т.д.
 */
export class SeatMapUtils {
  /**
   * Поиск места по составному ключу.
   * @param map модель карты мест
   * @param flightId идентификатор рейса
   * @param segmentId идентификатор сегмента
   * @param rowNumber номер ряда
   * @param letter буква места
   * @returns модель места или null
   */
  static findSeat(
    map: SeatMapModel,
    flightId: string,
    segmentId: string,
    rowNumber: number,
    letter: string,
  ): SeatCellModel | null {
    const flight = map.getFlightById(flightId);
    if (!flight) return null;
    const segment = flight.getSegmentById(segmentId);
    if (!segment) return null;

    // 1. Находим палубу, в которой есть ряд с нужным номером
    const deck = segment
      .getDecks()
      .find(d => d.getCabins().some(c => c.getRowByNumber(rowNumber) !== null));
    if (!deck) return null;

    // 2. В найденной палубе ищем салон, содержащий этот ряд
    for (const cabin of deck.getCabins()) {
      const row = cabin.getRowByNumber(rowNumber);
      if (row) {
        return row.getSeatByLetter(letter);
      }
    }
    return null;
  }

  /**
   * Группировка мест по рядам.
   * @param seats массив моделей мест
   * @returns Map<номер_ряда, массив мест>
   */
  static groupByRow(seats: SeatCellModel[]): Map<number, SeatCellModel[]> {
    const groups = new Map<number, SeatCellModel[]>();
    for (const seat of seats) {
      const rowNum = seat.getRow().getNumber();
      if (!groups.has(rowNum)) {
        groups.set(rowNum, []);
      }
      groups.get(rowNum)!.push(seat);
    }
    return groups;
  }

  /**
   * Получение матрицы ячеек для салона.
   * Возвращает двумерный массив сырых ячеек (Cell) для отрисовки.
   * @param cabin модель салона
   * @returns массив строк, каждая строка — массив ячеек
   */
  static getSeatMatrix(cabin: CabinModel): Cell[][] {
    const rows = cabin.getRows();
    return rows.map(row => row.getCells());
  }

  /**
   * Статистика занятости для сегмента.
   */
  static calculateOccupancyStats(segment: SegmentModel): {
    total: number;
    available: number;
    occupied: number;
    blocked: number;
  } {
    const seats = segment.getAllSeats();
    let available = 0,
      occupied = 0,
      blocked = 0;
    for (const seat of seats) {
      const avail = seat.getAvailability();
      if (avail === 'available') available++;
      else if (avail === 'occupied') occupied++;
      else if (avail === 'blocked' || avail === 'unavailable') blocked++;
    }
    return {
      total: seats.length,
      available,
      occupied,
      blocked,
    };
  }
}

// ---------------------------------------------------------------------
// Модель отдельного места (SeatCellModel)
// ---------------------------------------------------------------------

export class SeatCellModel {
  private readonly _row: RowModel;
  private readonly _data: SeatCell;

  constructor(row: RowModel, data: SeatCell) {
    this._row = row;
    this._data = data;
  }

  /** Возвращает родительский ряд */
  getRow(): RowModel {
    return this._row;
  }

  getLetter(): string {
    return this._data.letter;
  }

  getAvailability(): SeatAvailability {
    return this._data.availability;
  }

  getFeatures(): SeatFeature[] {
    return this._data.features;
  }

  getPrice(): number | undefined {
    return this._data.price;
  }

  getCurrency(): string | undefined {
    return this._data.currency;
  }

  getServiceId(): string | undefined {
    return this._data.serviceId;
  }

  getRestrictions(): string[] {
    return this._data.restrictions || [];
  }

  getFreeText(): string {
    return this._data.freeText || '';
  }

  getProps(): string[] | undefined {
    return this._data.props;
  }

  isAvailable(): boolean {
    return this._data.availability === 'available';
  }

  isOccupied(): boolean {
    return this._data.availability === 'occupied';
  }

  isBlocked(): boolean {
    return (
      this._data.availability === 'blocked' || this._data.availability === 'unavailable'
    );
  }

  hasFeature(feature: SeatFeature): boolean {
    return this._data.features.includes(feature);
  }

  /** Получить оригинальный объект данных (для сериализации) */
  toJSON(): SeatCell {
    return this._data;
  }
}

// ---------------------------------------------------------------------
// Модель ряда (RowModel)
// ---------------------------------------------------------------------

export class RowModel {
  private readonly _cabin: CabinModel;
  private readonly _data: Row;
  private readonly _seatCells: SeatCellModel[];
  private readonly _seatByLetter: Map<string, SeatCellModel>;

  constructor(cabin: CabinModel, data: Row) {
    this._cabin = cabin;
    this._data = data;
    this._seatCells = [];
    this._seatByLetter = new Map();

    // Создаём модели для каждого сиденья
    for (const cell of data.cells) {
      if (cell.kind === 'seat') {
        const seat = new SeatCellModel(this, cell);
        this._seatCells.push(seat);
        this._seatByLetter.set(cell.letter, seat);
      }
    }
  }

  getCabin(): CabinModel {
    return this._cabin;
  }

  getNumber(): number {
    return this._data.rowNumber;
  }

  getRowProps(): string[] {
    return this._data.rowProps || [];
  }

  /** Возвращает сырой массив ячеек (для отрисовки) */
  getCells(): Cell[] {
    return this._data.cells;
  }

  /** Возвращает только модели сидений */
  getSeatCells(): SeatCellModel[] {
    return this._seatCells;
  }

  getSeatByLetter(letter: string): SeatCellModel | null {
    return this._seatByLetter.get(letter) || null;
  }

  /**
   * Получить соседние места (слева и справа) для данного места.
   * Возвращает объект с left и right (или null, если нет).
   */
  getNeighbors(seat: SeatCellModel): {
    left: SeatCellModel | null;
    right: SeatCellModel | null;
  } {
    const seats = this._seatCells;
    const index = seats.indexOf(seat);
    if (index === -1) return { left: null, right: null };
    return {
      left: index > 0 ? seats[index - 1] : null,
      right: index < seats.length - 1 ? seats[index + 1] : null,
    };
  }

  toJSON(): Row {
    return this._data;
  }
}

// ---------------------------------------------------------------------
// Модель салона (CabinModel)
// ---------------------------------------------------------------------

export class CabinModel {
  private readonly _deck: DeckModel;
  private readonly _data: Cabin;
  private readonly _rows: RowModel[];
  private readonly _rowsByNumber: Map<number, RowModel>;

  constructor(deck: DeckModel, data: Cabin) {
    this._deck = deck;
    this._data = data;
    this._rows = [];
    this._rowsByNumber = new Map();

    for (const rowData of data.rows) {
      const row = new RowModel(this, rowData);
      this._rows.push(row);
      this._rowsByNumber.set(rowData.rowNumber, row);
    }
  }

  getDeck(): DeckModel {
    return this._deck;
  }

  getId(): string {
    return this._data.cabinId;
  }

  getCabinClass(): string | undefined {
    return this._data.cabinClass;
  }

  getServiceClass(): string | undefined {
    return this._data.serviceClass;
  }

  getWidth(): number | undefined {
    return this._data.width;
  }

  getHeight(): number | undefined {
    return this._data.height;
  }

  /** Основные двери/входы салона (не привязаны к конкретному ряду) */
  getDoors(): Door[] {
    return this._data.doors || [];
  }

  getRows(): RowModel[] {
    return this._rows;
  }

  getRowByNumber(number: number): RowModel | null {
    return this._rowsByNumber.get(number) || null;
  }

  /** Все сиденья в салоне */
  getSeats(): SeatCellModel[] {
    const seats: SeatCellModel[] = [];
    for (const row of this._rows) {
      seats.push(...row.getSeatCells());
    }
    return seats;
  }

  /** Только доступные сиденья */
  getAvailableSeats(): SeatCellModel[] {
    return this.getSeats().filter(s => s.isAvailable());
  }

  /** Сиденья с заданной особенностью */
  getSeatsWithFeature(feature: SeatFeature): SeatCellModel[] {
    return this.getSeats().filter(s => s.hasFeature(feature));
  }

  toJSON(): Cabin {
    return this._data;
  }
}

// ---------------------------------------------------------------------
// Модель палубы (DeckModel)
// ---------------------------------------------------------------------

export class DeckModel {
  private readonly _segment: SegmentModel;
  private readonly _data: Deck;
  private readonly _cabins: CabinModel[];
  private readonly _cabinsById: Map<string, CabinModel>;

  constructor(segment: SegmentModel, data: Deck) {
    this._segment = segment;
    this._data = data;
    this._cabins = [];
    this._cabinsById = new Map();

    for (const cabinData of data.cabins) {
      const cabin = new CabinModel(this, cabinData);
      this._cabins.push(cabin);
      this._cabinsById.set(cabinData.cabinId, cabin);
    }
  }

  getSegment(): SegmentModel {
    return this._segment;
  }

  getId(): string {
    return this._data.deckId;
  }

  getName(): string | undefined {
    return this._data.deckName;
  }

  getCabins(): CabinModel[] {
    return this._cabins;
  }

  getCabinById(id: string): CabinModel | null {
    return this._cabinsById.get(id) || null;
  }

  /** Все сиденья на палубе */
  getAllSeats(): SeatCellModel[] {
    const seats: SeatCellModel[] = [];
    for (const cabin of this._cabins) {
      seats.push(...cabin.getSeats());
    }
    return seats;
  }

  toJSON(): Deck {
    return this._data;
  }
}

// ---------------------------------------------------------------------
// Модель сегмента (SegmentModel)
// ---------------------------------------------------------------------

export class SegmentModel {
  private readonly _flight: FlightModel;
  private readonly _data: Segment;
  private readonly _decks: DeckModel[];
  private readonly _decksById: Map<string, DeckModel>;

  constructor(flight: FlightModel, data: Segment) {
    this._flight = flight;
    this._data = data;
    this._decks = [];
    this._decksById = new Map();

    for (const deckData of data.decks) {
      const deck = new DeckModel(this, deckData);
      this._decks.push(deck);
      this._decksById.set(deckData.deckId, deck);
    }
  }

  getFlight(): FlightModel {
    return this._flight;
  }

  getId(): string {
    return this._data.segmentId;
  }

  getFlightNumber(): string | undefined {
    return this._data.flightNumber;
  }

  getDepartureAirport(): string | undefined {
    return this._data.departureAirport;
  }

  getArrivalAirport(): string | undefined {
    return this._data.arrivalAirport;
  }

  getDepartureDateTime(): string | undefined {
    return this._data.departureDateTime;
  }

  getArrivalDateTime(): string | undefined {
    return this._data.arrivalDateTime;
  }

  getAircraftCode(): string | undefined {
    return this._data.aircraftCode;
  }

  getAircraftType(): string | undefined {
    return this._data.aircraftType;
  }

  getDecks(): DeckModel[] {
    return this._decks;
  }

  getDeckById(id: string): DeckModel | null {
    return this._decksById.get(id) || null;
  }

  /** Все сиденья в сегменте */
  getAllSeats(): SeatCellModel[] {
    const seats: SeatCellModel[] = [];
    for (const deck of this._decks) {
      seats.push(...deck.getAllSeats());
    }
    return seats;
  }

  toJSON(): Segment {
    return this._data;
  }
}

// ---------------------------------------------------------------------
// Модель рейса (FlightModel)
// ---------------------------------------------------------------------

export class FlightModel {
  private readonly _map: SeatMapModel;
  private readonly _direction: Direction;
  private readonly _data: Flight;
  private readonly _segments: SegmentModel[];
  private readonly _segmentsById: Map<string, SegmentModel>;
  /** Запасной идентификатор на случай отсутствующего/повторяющегося flightNumber */
  private readonly _fallbackId: string;

  constructor(map: SeatMapModel, direction: Direction, data: Flight, index: number) {
    this._map = map;
    this._direction = direction;
    this._data = data;
    this._segments = [];
    this._segmentsById = new Map();
    this._fallbackId = `flight-${index}`;

    for (const segData of data.segments) {
      const segment = new SegmentModel(this, segData);
      this._segments.push(segment);
      this._segmentsById.set(segData.segmentId, segment);
    }
  }

  getSeatMap(): SeatMapModel {
    return this._map;
  }

  /**
   * Идентификатор рейса в рамках модели. Если flightNumber не задан
   * (или совпадает у нескольких рейсов), используется запасной ключ
   * по индексу — иначе рейсы "затирали" бы друг друга в _flightsById.
   */
  getId(): string {
    return this._data.flightNumber || this._fallbackId;
  }

  getDirection(): Direction {
    return this._direction;
  }

  getFlightNumber(): string | undefined {
    return this._data.flightNumber;
  }

  getDepartureAirport(): string | undefined {
    return this._data.departureAirport;
  }

  getArrivalAirport(): string | undefined {
    return this._data.arrivalAirport;
  }

  getDepartureDateTime(): string | undefined {
    return this._data.departureDateTime;
  }

  getArrivalDateTime(): string | undefined {
    return this._data.arrivalDateTime;
  }

  getSegments(): SegmentModel[] {
    return this._segments;
  }

  getSegmentById(id: string): SegmentModel | null {
    return this._segmentsById.get(id) || null;
  }

  /** Все сиденья на всех сегментах рейса */
  getAllSeats(): SeatCellModel[] {
    const seats: SeatCellModel[] = [];
    for (const seg of this._segments) {
      seats.push(...seg.getAllSeats());
    }
    return seats;
  }

  toJSON(): Flight {
    return this._data;
  }
}

// ---------------------------------------------------------------------
// Корневая модель карты мест (SeatMapModel)
// ---------------------------------------------------------------------

export class SeatMapModel {
  private readonly _raw: UniversalSeatMap;
  private readonly _flights: FlightModel[];
  private readonly _flightsById: Map<string, FlightModel>;
  private readonly _flightsByDirection: Map<Direction, FlightModel[]>;

  constructor(raw: UniversalSeatMap) {
    this._raw = raw;
    this._flights = [];
    this._flightsById = new Map();
    this._flightsByDirection = new Map<Direction, FlightModel[]>([
      ['TO', []],
      ['BACK', []],
    ]);

    raw.flights.forEach((fwd, index) => {
      const flight = new FlightModel(this, fwd.direction, fwd.flight, index);
      this._flights.push(flight);
      this._flightsById.set(flight.getId(), flight);
      this._flightsByDirection.get(fwd.direction)!.push(flight);
    });
  }

  getFormatVersion(): string {
    return this._raw.formatVersion;
  }

  getClientId(): string | undefined {
    return this._raw.clientId;
  }

  /** Возвращает все рейсы */
  getFlights(): FlightModel[] {
    return this._flights;
  }

  /** Поиск рейса по flightNumber */
  getFlightById(id: string): FlightModel | null {
    return this._flightsById.get(id) || null;
  }

  /** Фильтрация по направлению */
  getFlightsByDirection(direction: Direction): FlightModel[] {
    return this._flightsByDirection.get(direction) || [];
  }

  /** Возвращает все сегменты всех рейсов */
  getAllSegments(): SegmentModel[] {
    const segments: SegmentModel[] = [];
    for (const flight of this._flights) {
      segments.push(...flight.getSegments());
    }
    return segments;
  }

  /** Возвращает все места всех рейсов (для аналитики) */
  getAllSeats(): SeatCellModel[] {
    const seats: SeatCellModel[] = [];
    for (const flight of this._flights) {
      seats.push(...flight.getAllSeats());
    }
    return seats;
  }

  /** Возвращает оригинальный объект для сериализации */
  toJSON(): UniversalSeatMap {
    return this._raw;
  }
}
