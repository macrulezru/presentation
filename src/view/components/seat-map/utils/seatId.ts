/**
 * Единственное место, где формируется составной идентификатор места.
 * Место идентифицируется в рамках рейса и сегмента — без этих двух
 * компонентов номер ряда + буква могут совпасть у мест на разных
 * сегментах/рейсах.
 */
export function generateSeatId(
  flightId: string,
  segmentId: string,
  rowNumber: number,
  letter: string,
): string {
  return `${flightId}:${segmentId}:${rowNumber}:${letter}`;
}

export interface ParsedSeatId {
  flightId: string;
  segmentId: string;
  rowNumber: number;
  letter: string;
}

/** Обратная операция к generateSeatId — тот же единственный источник истины про формат ID */
export function parseSeatId(seatId: string): ParsedSeatId {
  const [flightId, segmentId, rowNumber, letter] = seatId.split(':');
  return { flightId, segmentId, rowNumber: Number(rowNumber), letter };
}
