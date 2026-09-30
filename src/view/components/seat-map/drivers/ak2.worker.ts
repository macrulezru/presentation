// Worker-обёртка для AK2 драйвера
import { defineWorkerHandler } from 'vue-worker-kit/worker';

import { ak2Driver } from './ak2Driver';

import type { UniversalSeatMap } from '../types/seatmap.types';

interface ParseInput {
  rawDataJson: string;
  options?: { flightId?: string; segmentId?: string };
}

export default defineWorkerHandler(
  async (input: ParseInput): Promise<UniversalSeatMap> => {
    const rawData = JSON.parse(input.rawDataJson);
    return await ak2Driver.parse(rawData, input.options);
  },
);
