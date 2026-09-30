import { useWorker } from 'vue-worker-kit';

import { getDriverConfig, hasDriver, getRegisteredClientIds } from './driver-loaders';

import type { SeatMapDriver } from './types';
import type { UniversalSeatMap } from '../types/seatmap.types';
import type { WorkerHandlerModule } from 'vue-worker-kit/worker';

interface ParseWorkerInput {
  rawDataJson: string;
  options?: { flightId?: string; segmentId?: string };
}

// Все ak*.worker.ts объявляют defineWorkerHandler с одной и той же сигнатурой
// (см. ParseInput/UniversalSeatMap в каждом из них), но конкретный воркер
// выбирается динамически по clientId, а не статическим `typeof import('./x.worker')` —
// поэтому вместо реального модуля отдаём useWorker() структурно эквивалентную
// заглушку, у которой WorkerModuleInput/WorkerModuleOutput читают те же типы.
type ParseWorkerModule = {
  default: WorkerHandlerModule<ParseWorkerInput, UniversalSeatMap>;
};

/**
 * Прокси-обёртка для драйвера, работающего в Web Worker
 * Предоставляет тот же интерфейс SeatMapDriver, но выполняет parse() в worker
 */
class WorkerDriverProxy implements SeatMapDriver {
  readonly clientId: string;
  private runFn: (input: ParseWorkerInput) => Promise<UniversalSeatMap>;

  constructor(clientId: string, workerFactory: () => Worker) {
    const config = getDriverConfig(clientId);
    this.clientId = config.clientId;

    const { run } = useWorker<ParseWorkerModule>(workerFactory, { idleTimeout: 60000 });
    this.runFn = run;
  }

  async parse(
    rawData: unknown,
    options?: { flightId?: string; segmentId?: string },
  ): Promise<UniversalSeatMap> {
    try {
      // Сериализуем rawData в JSON строку для безопасной передачи в worker
      const rawDataJson = JSON.stringify(rawData);
      const result = await this.runFn({ rawDataJson, options });
      return result;
    } catch (error) {
      // Пробрасываем ошибки из worker как обычные исключения
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Worker error: ${String(error)}`);
    }
  }
}

/**
 * Реестр драйверов с поддержкой Web Workers
 * Драйверы загружаются лениво при первом обращении
 */
export class DriverRegistry {
  private loadedDrivers: Map<string, SeatMapDriver> = new Map();
  private loadingPromises: Map<string, Promise<SeatMapDriver>> = new Map();

  /**
   * Получить драйвер по clientId.
   * Если драйвер ещё не загружен, выполняется ленивая загрузка через Web Worker.
   * Возвращает прокси-объект с тем же интерфейсом, что и обычный драйвер.
   */
  async getDriver(clientId: string): Promise<SeatMapDriver> {
    // Проверяем, есть ли уже загруженный драйвер
    const cached = this.loadedDrivers.get(clientId);
    if (cached) {
      return cached;
    }

    // Проверяем, есть ли активная загрузка для этого clientId
    const existingPromise = this.loadingPromises.get(clientId);
    if (existingPromise) {
      return existingPromise;
    }

    // Создаём promise для загрузки драйвера через Web Worker
    const loadPromise = this.loadDriverWithWorker(clientId);
    this.loadingPromises.set(clientId, loadPromise);

    try {
      const driver = await loadPromise;
      this.loadedDrivers.set(clientId, driver);
      return driver;
    } finally {
      // Очищаем promise после завершения загрузки
      this.loadingPromises.delete(clientId);
    }
  }

  /**
   * Загружает драйвер через Web Worker используя vue-worker-kit.
   * Фабрика воркера берётся из единого реестра DRIVER_CONFIGS —
   * это единственное место, которое нужно менять при добавлении драйвера.
   */
  private async loadDriverWithWorker(clientId: string): Promise<SeatMapDriver> {
    try {
      const config = getDriverConfig(clientId);
      return new WorkerDriverProxy(clientId, config.createWorker);
    } catch (error) {
      throw new Error(
        `Failed to load driver for ${clientId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Проверить, загружен ли драйвер в кэш
   */
  isDriverLoaded(clientId: string): boolean {
    return this.loadedDrivers.has(clientId);
  }

  /**
   * Проверить, существует ли драйвер в реестре
   */
  hasDriver(clientId: string): boolean {
    return hasDriver(clientId);
  }

  /**
   * Получить список всех зарегистрированных clientId
   */
  getRegisteredClientIds(): string[] {
    return getRegisteredClientIds();
  }

  /**
   * Зарегистрировать драйвер вручную (для обратной совместимости)
   */
  register(driver: SeatMapDriver): void {
    this.loadedDrivers.set(driver.clientId, driver);
  }

  /**
   * Очистить кэш загруженных драйверов
   */
  clearCache(): void {
    this.loadedDrivers.clear();
    this.loadingPromises.clear();
  }
}

export const driverRegistry = new DriverRegistry();
