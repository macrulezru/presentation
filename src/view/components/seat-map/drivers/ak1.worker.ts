// Worker-обёртка для AK1 драйвера
import { defineWorkerHandler } from 'vue-worker-kit/worker';

import { ak1Driver } from './ak1Driver';

import type { UniversalSeatMap } from '../types/seatmap.types';

interface ParseInput {
  rawDataJson: string;
  options?: { flightId?: string; segmentId?: string };
}

export default defineWorkerHandler(
  async (input: ParseInput): Promise<UniversalSeatMap> => {
    const rawData = JSON.parse(input.rawDataJson);
    return await ak1Driver.parse(rawData, input.options);
  },
);
