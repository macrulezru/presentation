import type { PipelineProgress } from './types';

export class ProgressTracker {
  private progress: PipelineProgress;

  constructor(totalStages: number) {
    this.progress = {
      currentStage: 0,
      totalStages,
      stageStatuses: Array(totalStages).fill('pending'),
    };
  }

  updateStage(stage: number, status: PipelineProgress['stageStatuses'][number]) {
    this.progress.stageStatuses[stage] = status;
    this.progress.currentStage = stage;
  }

  getProgress() {
    return this.progress;
  }
}
