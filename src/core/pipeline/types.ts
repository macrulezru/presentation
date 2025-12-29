// Типы для конвейерной системы REST API

export type PipelineStageConfig<Input, Output> = {
  key: string;
  request: (input: Input) => Promise<Output>;
  condition?: (
    input: Input,
    prevResults: any,
    sharedData?: Record<string, any>,
  ) => boolean;
  retryCount?: number;
  timeoutMs?: number;
  errorHandler?: (error: any, stageKey: string, sharedData?: Record<string, any>) => any;
};

export type PipelineConfig = {
  stages: PipelineStageConfig<any, any>[];
};

export type PipelineProgress = {
  currentStage: number;
  totalStages: number;
  stageStatuses: Array<'pending' | 'in-progress' | 'success' | 'error' | 'skipped'>;
};

export type PipelineResult = {
  results: any[];
  errors: any[];
  success: boolean;
};
