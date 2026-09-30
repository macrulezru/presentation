import { UniversalValidationError } from './errors';

import type {
  UniversalSeatMap,
  FlightWithDirection,
  Direction,
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
} from '../types/seatmap.types';

/**
 * Проверяет, что значение является строкой и не пусто.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Проверяет, что значение является числом.
 */
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Проверяет, что значение является массивом.
 */
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Проверяет, что значение является объектом (не null).
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Валидирует направление.
 */
function validateDirection(value: unknown): asserts value is Direction {
  if (value !== 'TO' && value !== 'BACK') {
    throw new UniversalValidationError(
      `Недопустимое значение direction: "${value}". Допустимо: "TO" или "BACK"`,
    );
  }
}

/**
 * Валидирует статус доступности места.
 */
function validateSeatAvailability(value: unknown): asserts value is SeatAvailability {
  const valid: SeatAvailability[] = ['available', 'occupied', 'blocked', 'unavailable'];
  if (!valid.includes(value as SeatAvailability)) {
    throw new UniversalValidationError(
      `Недопустимый статус места: "${value}". Допустимо: ${valid.join(', ')}`,
    );
  }
}

/**
 * Валидирует ячейку.
 */
function validateCell(cell: unknown): asserts cell is Cell {
  if (!isObject(cell)) {
    throw new UniversalValidationError('Ячейка должна быть объектом');
  }

  const { kind } = cell;
  if (typeof kind !== 'string') {
    throw new UniversalValidationError('Поле kind в ячейке должно быть строкой');
  }

  switch (kind) {
    case 'seat': {
      const seat = cell as unknown as SeatCell;
      if (!isNonEmptyString(seat.letter)) {
        throw new UniversalValidationError(
          'У места (seat) должно быть поле letter (непустая строка)',
        );
      }
      if (seat.availability === undefined) {
        throw new UniversalValidationError(
          'У места (seat) должно быть поле availability',
        );
      }
      validateSeatAvailability(seat.availability);
      if (!isArray(seat.features)) {
        throw new UniversalValidationError(
          'У места (seat) поле features должно быть массивом',
        );
      }
      for (const feat of seat.features) {
        if (typeof feat !== 'string') {
          throw new UniversalValidationError('Элементы features должны быть строками');
        }
      }
      if (seat.price !== undefined && !isNumber(seat.price)) {
        throw new UniversalValidationError('price должен быть числом');
      }
      if (seat.currency !== undefined && !isNonEmptyString(seat.currency)) {
        throw new UniversalValidationError('currency должна быть непустой строкой');
      }
      if (seat.serviceId !== undefined && !isNonEmptyString(seat.serviceId)) {
        throw new UniversalValidationError('serviceId должен быть непустой строкой');
      }
      if (seat.restrictions !== undefined) {
        if (!isArray(seat.restrictions)) {
          throw new UniversalValidationError('restrictions должен быть массивом');
        }
        for (const r of seat.restrictions) {
          if (typeof r !== 'string') {
            throw new UniversalValidationError(
              'Элементы restrictions должны быть строками',
            );
          }
        }
      }
      if (seat.freeText !== undefined && !isNonEmptyString(seat.freeText)) {
        throw new UniversalValidationError('freeText должен быть непустой строкой');
      }
      if (seat.props !== undefined) {
        if (!isArray(seat.props)) {
          throw new UniversalValidationError('props должен быть массивом');
        }
        for (const p of seat.props) {
          if (typeof p !== 'string') {
            throw new UniversalValidationError('Элементы props должны быть строками');
          }
        }
      }
      break;
    }
    case 'empty': {
      const empty = cell as unknown as EmptyCell;
      if (empty.props !== undefined) {
        if (!isArray(empty.props)) {
          throw new UniversalValidationError('props у empty должен быть массивом');
        }
        for (const p of empty.props) {
          if (typeof p !== 'string') {
            throw new UniversalValidationError('Элементы props должны быть строками');
          }
        }
      }
      break;
    }
    case 'aisle': {
      const aisle = cell as unknown as AisleCell;
      if (aisle.width !== undefined && !isNumber(aisle.width)) {
        throw new UniversalValidationError('width у aisle должен быть числом');
      }
      if (aisle.props !== undefined) {
        if (!isArray(aisle.props)) {
          throw new UniversalValidationError('props у aisle должен быть массивом');
        }
        for (const p of aisle.props) {
          if (typeof p !== 'string') {
            throw new UniversalValidationError('Элементы props должны быть строками');
          }
        }
      }
      break;
    }
    default:
      throw new UniversalValidationError(`Неизвестный тип ячейки: "${kind}"`);
  }
}

/**
 * Валидирует ряд.
 */
function validateRow(row: unknown): asserts row is Row {
  if (!isObject(row)) {
    throw new UniversalValidationError('Ряд должен быть объектом');
  }

  const r = row as unknown as Row;
  if (!isNumber(r.rowNumber)) {
    throw new UniversalValidationError('Поле rowNumber должно быть числом');
  }
  if (r.rowProps !== undefined) {
    if (!isArray(r.rowProps)) {
      throw new UniversalValidationError('rowProps должен быть массивом');
    }
    for (const prop of r.rowProps) {
      if (typeof prop !== 'string') {
        throw new UniversalValidationError('Элементы rowProps должны быть строками');
      }
    }
  }
  if (!isArray(r.cells)) {
    throw new UniversalValidationError('Поле cells должно быть массивом');
  }
  if (r.cells.length === 0) {
    throw new UniversalValidationError('В ряду должна быть хотя бы одна ячейка');
  }
  const letters = new Set<string>();
  for (const cell of r.cells) {
    validateCell(cell);
    if (cell.kind === 'seat') {
      const seat = cell as SeatCell;
      if (letters.has(seat.letter)) {
        throw new UniversalValidationError(
          `В ряду ${r.rowNumber} обнаружена дублирующаяся буква места: ${seat.letter}`,
        );
      }
      letters.add(seat.letter);
    }
  }
}

/**
 * Валидирует салон (кабину).
 */
const VALID_DOOR_POSITIONS: Door['position'][] = ['front', 'rear', 'mid'];
const VALID_DOOR_SIDES: Door['side'][] = ['left', 'right', 'both'];

/**
 * Валидирует дверь салона.
 */
function validateDoor(door: unknown): asserts door is Door {
  if (!isObject(door)) {
    throw new UniversalValidationError('Дверь салона должна быть объектом');
  }

  const d = door as unknown as Door;
  if (!VALID_DOOR_POSITIONS.includes(d.position)) {
    throw new UniversalValidationError(
      `Недопустимое значение position у двери: "${d.position}". Допустимо: ${VALID_DOOR_POSITIONS.join(', ')}`,
    );
  }
  if (!VALID_DOOR_SIDES.includes(d.side)) {
    throw new UniversalValidationError(
      `Недопустимое значение side у двери: "${d.side}". Допустимо: ${VALID_DOOR_SIDES.join(', ')}`,
    );
  }
}

function validateCabin(cabin: unknown): asserts cabin is Cabin {
  if (!isObject(cabin)) {
    throw new UniversalValidationError('Салон должен быть объектом');
  }

  const c = cabin as unknown as Cabin;
  if (!isNonEmptyString(c.cabinId)) {
    throw new UniversalValidationError('Поле cabinId должно быть непустой строкой');
  }
  if (c.cabinClass !== undefined && !isNonEmptyString(c.cabinClass)) {
    throw new UniversalValidationError('cabinClass должен быть непустой строкой');
  }
  if (c.serviceClass !== undefined && !isNonEmptyString(c.serviceClass)) {
    throw new UniversalValidationError('serviceClass должен быть непустой строкой');
  }
  if (c.width !== undefined && !isNumber(c.width)) {
    throw new UniversalValidationError('width должен быть числом');
  }
  if (c.height !== undefined && !isNumber(c.height)) {
    throw new UniversalValidationError('height должен быть числом');
  }
  if (c.doors !== undefined) {
    if (!isArray(c.doors)) {
      throw new UniversalValidationError('Поле doors должно быть массивом');
    }
    for (const door of c.doors) {
      validateDoor(door);
    }
  }
  if (!isArray(c.rows)) {
    throw new UniversalValidationError('Поле rows должно быть массивом');
  }
  if (c.rows.length === 0) {
    throw new UniversalValidationError('В салоне должна быть хотя бы один ряд');
  }
  for (const row of c.rows) {
    validateRow(row);
  }
}

/**
 * Валидирует палубу.
 */
function validateDeck(deck: unknown): asserts deck is Deck {
  if (!isObject(deck)) {
    throw new UniversalValidationError('Палуба должна быть объектом');
  }

  const d = deck as unknown as Deck;
  if (!isNonEmptyString(d.deckId)) {
    throw new UniversalValidationError('Поле deckId должно быть непустой строкой');
  }
  if (d.deckName !== undefined && !isNonEmptyString(d.deckName)) {
    throw new UniversalValidationError('deckName должен быть непустой строкой');
  }
  if (!isArray(d.cabins)) {
    throw new UniversalValidationError('Поле cabins должно быть массивом');
  }
  if (d.cabins.length === 0) {
    throw new UniversalValidationError('На палубе должна быть хотя бы одна кабина');
  }
  for (const cabin of d.cabins) {
    validateCabin(cabin);
  }
}

/**
 * Валидирует сегмент.
 */
function validateSegment(segment: unknown): asserts segment is Segment {
  if (!isObject(segment)) {
    throw new UniversalValidationError('Сегмент должен быть объектом');
  }

  const s = segment as unknown as Segment;
  if (!isNonEmptyString(s.segmentId)) {
    throw new UniversalValidationError('Поле segmentId должно быть непустой строкой');
  }
  if (s.flightNumber !== undefined && !isNonEmptyString(s.flightNumber)) {
    throw new UniversalValidationError('flightNumber должен быть непустой строкой');
  }
  if (s.departureAirport !== undefined && !isNonEmptyString(s.departureAirport)) {
    throw new UniversalValidationError('departureAirport должен быть непустой строкой');
  }
  if (s.arrivalAirport !== undefined && !isNonEmptyString(s.arrivalAirport)) {
    throw new UniversalValidationError('arrivalAirport должен быть непустой строкой');
  }
  if (s.departureDateTime !== undefined && !isNonEmptyString(s.departureDateTime)) {
    throw new UniversalValidationError('departureDateTime должен быть непустой строкой');
  }
  if (s.arrivalDateTime !== undefined && !isNonEmptyString(s.arrivalDateTime)) {
    throw new UniversalValidationError('arrivalDateTime должен быть непустой строкой');
  }
  if (s.aircraftCode !== undefined && !isNonEmptyString(s.aircraftCode)) {
    throw new UniversalValidationError('aircraftCode должен быть непустой строкой');
  }
  if (s.aircraftType !== undefined && !isNonEmptyString(s.aircraftType)) {
    throw new UniversalValidationError('aircraftType должен быть непустой строкой');
  }
  if (!isArray(s.decks)) {
    throw new UniversalValidationError('Поле decks должно быть массивом');
  }
  if (s.decks.length === 0) {
    throw new UniversalValidationError('В сегменте должна быть хотя бы одна палуба');
  }
  for (const deck of s.decks) {
    validateDeck(deck);
  }
}

/**
 * Валидирует рейс.
 */
function validateFlight(flight: unknown): asserts flight is Flight {
  if (!isObject(flight)) {
    throw new UniversalValidationError('Рейс должен быть объектом');
  }

  const f = flight as unknown as Flight;
  if (f.flightNumber !== undefined && !isNonEmptyString(f.flightNumber)) {
    throw new UniversalValidationError('flightNumber должен быть непустой строкой');
  }
  if (f.departureAirport !== undefined && !isNonEmptyString(f.departureAirport)) {
    throw new UniversalValidationError('departureAirport должен быть непустой строкой');
  }
  if (f.arrivalAirport !== undefined && !isNonEmptyString(f.arrivalAirport)) {
    throw new UniversalValidationError('arrivalAirport должен быть непустой строкой');
  }
  if (f.departureDateTime !== undefined && !isNonEmptyString(f.departureDateTime)) {
    throw new UniversalValidationError('departureDateTime должен быть непустой строкой');
  }
  if (f.arrivalDateTime !== undefined && !isNonEmptyString(f.arrivalDateTime)) {
    throw new UniversalValidationError('arrivalDateTime должен быть непустой строкой');
  }
  if (!isArray(f.segments)) {
    throw new UniversalValidationError('Поле segments должно быть массивом');
  }
  if (f.segments.length === 0) {
    throw new UniversalValidationError('В рейсе должен быть хотя бы один сегмент');
  }
  for (const segment of f.segments) {
    validateSegment(segment);
  }
}

/**
 * Валидирует элемент массива flights (direction + flight).
 */
function validateFlightWithDirection(item: unknown): asserts item is FlightWithDirection {
  if (!isObject(item)) {
    throw new UniversalValidationError('Элемент flights должен быть объектом');
  }
  const obj = item as Record<string, unknown>;
  if (obj.direction === undefined) {
    throw new UniversalValidationError('В элементе flights отсутствует поле direction');
  }
  validateDirection(obj.direction);
  if (obj.flight === undefined) {
    throw new UniversalValidationError('В элементе flights отсутствует поле flight');
  }
  validateFlight(obj.flight);
}

/**
 * Основная функция валидации универсальной модели карты мест.
 * Проверяет, что переданный объект соответствует структуре UniversalSeatMap.
 */
export function validateUniversalSeatMap(
  model: unknown,
): asserts model is UniversalSeatMap {
  if (!isObject(model)) {
    throw new UniversalValidationError('Модель должна быть объектом');
  }

  const m = model as Record<string, unknown>;
  if (m.formatVersion !== '1.0') {
    throw new UniversalValidationError('Поле formatVersion должно быть равно "1.0"');
  }
  if (m.clientId !== undefined && !isNonEmptyString(m.clientId)) {
    throw new UniversalValidationError('clientId должен быть непустой строкой');
  }
  if (!isArray(m.flights)) {
    throw new UniversalValidationError('Поле flights должно быть массивом');
  }
  if (m.flights.length === 0) {
    throw new UniversalValidationError('Массив flights не может быть пустым');
  }
  for (const item of m.flights) {
    validateFlightWithDirection(item);
  }
}
