// Пример конфигурации и запуска конвейера
import { PipelineOrchestrator } from './pipeline-orchestrator';

import type { PipelineConfig } from './types';

import { jokeConfig } from '@/core/commands/types';

const pipelineConfig: PipelineConfig = {
  stages: [
    {
      key: '/random',
      request: async () => {}, // не используется напрямую, executor вызывает rest
      retryCount: 2,
      timeoutMs: 5000,
    },
    {
      key: '/categories',
      request: async () => {},
      condition: prev => !!prev,
      retryCount: 1,
      timeoutMs: 3000,
    },
  ],
};

const orchestrator = new PipelineOrchestrator(pipelineConfig, jokeConfig);

orchestrator.run().then(result => {
  console.log('Pipeline result:', result);
});
