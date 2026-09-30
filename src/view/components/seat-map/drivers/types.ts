import type { UniversalSeatMap } from '../types/seatmap.types';

export interface SeatMapDriver {
  readonly clientId: string;
  parse(
    rawData: unknown,
    options?: { flightId?: string; segmentId?: string },
  ): Promise<UniversalSeatMap>;
}
