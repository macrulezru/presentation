import { ErrorHandler } from './error-handler';
import { ProgressTracker } from './progress-tracker';
import { RequestExecutor } from './request-executor';

import type { PipelineConfig, PipelineResult } from './types';

export class PipelineOrchestrator {
  private progress: ProgressTracker;
  private errorHandler: ErrorHandler;
  private executor: RequestExecutor;
  private sharedData: Record<string, unknown>;

  constructor(
    private config: PipelineConfig,
    httpConfig: import('@/core/rest/types').HttpConfig,
    sharedData: Record<string, unknown> = {},
  ) {
    this.progress = new ProgressTracker(config.stages.length);
    this.errorHandler = new ErrorHandler();
    this.executor = new RequestExecutor(httpConfig);
    this.sharedData = sharedData;
  }

  /**
   * @param onStepPause
   *   Необязательный callback, вызывается после каждого шага (до перехода к следующему).
   *   Позволяет приостановить выполнение, запросить подтверждение пользователя или изменить результат шага.
   *   Должен вернуть (optionally изменённый) результат шага или промис с ним.
   *   Если не передан — пайплайн работает как раньше.
   */
  async run(
    onStepPause?: (
      stepIndex: number,
      stepResult: unknown,
      results: unknown[],
    ) => Promise<unknown> | unknown,
  ): Promise<PipelineResult> {
    const results: unknown[] = [];
    const errors: unknown[] = [];
    let success = true;

    for (let i = 0; i < this.config.stages.length; i++) {
      const stage = this.config.stages[i];
      this.progress.updateStage(i, 'in-progress');

      if (!stage) {
        this.progress.updateStage(i, 'skipped');
        results.push(undefined);
        continue;
      }

      // Проверка условия выполнения этапа
      if (stage.condition && !stage.condition(results[i - 1], results, this.sharedData)) {
        this.progress.updateStage(i, 'skipped');
        results.push(undefined);
        continue;
      }

      try {
        // Можно расширить executor.execute, если нужно использовать sharedData
        const res = await this.executor.execute(
          stage.key,
          undefined,
          stage.retryCount,
          stage.timeoutMs,
        );
        let stepResult: unknown = res.data;

        // --- Пользовательская пауза/подтверждение/изменение результата ---
        if (onStepPause) {
          // Можно показать пользователю результат, дождаться подтверждения или изменить результат
          stepResult = await onStepPause(i, stepResult, results);
        }
        results.push(stepResult);
        this.progress.updateStage(i, 'success');
      } catch (err) {
        let handled;
        if (stage && typeof stage.errorHandler === 'function') {
          handled = stage.errorHandler(err, stage.key, this.sharedData);
        } else if (stage) {
          handled = this.errorHandler.handle(err, stage.key);
        } else {
          handled = this.errorHandler.handle(err, 'unknown');
        }
        // Если локальный обработчик вернул falsy, применяем глобальный
        if (!handled && stage) {
          handled = this.errorHandler.handle(err, stage.key);
        }
        errors.push(handled);
        this.progress.updateStage(i, 'error');
        success = false;
        // Автоматическая отмена следующих этапов при критической ошибке
        break;
      }
    }

    return { results, errors, success };
  }
}
