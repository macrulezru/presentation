import { driverRegistry } from './drivers/registry';
import { validateUniversalSeatMap } from './models/validation';

import type { UniversalSeatMap } from './types/seatmap.types';
import type { SeatMapInput } from './types/types';

export interface ParseOptions {
  flightId?: string;
  segmentId?: string;
}

export async function parseSeatMap(
  input: SeatMapInput,
  options?: ParseOptions,
): Promise<UniversalSeatMap> {
  if (!input.clientId || typeof input.clientId !== 'string') {
    throw new Error('clientId должен быть непустой строкой');
  }

  const driver = await driverRegistry.getDriver(input.clientId);
  const universalModel = await driver.parse(input.data, options);

  validateUniversalSeatMap(universalModel);

  return universalModel;
}

export { driverRegistry } from './drivers';
export { validateUniversalSeatMap } from './models/validation';
export type { UniversalSeatMap } from './types/seatmap.types';
export type { SeatMapDriver } from './drivers/types';
export type { SeatMapInput } from './types/types';
