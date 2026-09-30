// Worker-обёртка для AK3 драйвера
import { defineWorkerHandler } from 'vue-worker-kit/worker';

import { ak3Driver } from './ak3Driver';

import type { UniversalSeatMap } from '../types/seatmap.types';

interface ParseInput {
  rawDataJson: string;
  options?: { flightId?: string; segmentId?: string };
}

export default defineWorkerHandler(
  async (input: ParseInput): Promise<UniversalSeatMap> => {
    const rawData = JSON.parse(input.rawDataJson);
    return await ak3Driver.parse(rawData, input.options);
  },
);
