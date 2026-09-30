/**
 * Конфигурация драйвера: как создать Worker, который его выполняет.
 * `new URL('./file.ts', import.meta.url)` должен остаться статическим
 * литералом прямо внутри `createWorker` — это требование Vite для
 * корректной сборки воркера в отдельный чанк.
 */
export interface DriverConfig {
  clientId: string
  createWorker: () => Worker
}

/**
 * Единый реестр драйверов.
 * Добавление нового драйвера требует лишь добавления записи в этот объект
 * (плюс самого файла драйвера и *.worker.ts).
 */
export const DRIVER_CONFIGS: Record<string, DriverConfig> = {
  AK1: {
    clientId: 'AK1',
    createWorker: () => new Worker(new URL('./ak1.worker.ts', import.meta.url), { type: 'module' }),
  },
  AK2: {
    clientId: 'AK2',
    createWorker: () => new Worker(new URL('./ak2.worker.ts', import.meta.url), { type: 'module' }),
  },
  AK3: {
    clientId: 'AK3',
    createWorker: () => new Worker(new URL('./ak3.worker.ts', import.meta.url), { type: 'module' }),
  },
}

/**
 * Получить конфигурацию драйвера по clientId
 */
export function getDriverConfig(clientId: string): DriverConfig {
  const config = DRIVER_CONFIGS[clientId]
  if (!config) {
    throw new Error(`Unknown client ID: ${clientId}`)
  }
  return config
}

/**
 * Проверить, существует ли драйвер в реестре
 */
export function hasDriver(clientId: string): boolean {
  return clientId in DRIVER_CONFIGS
}

/**
 * Получить список всех зарегистрированных clientId
 */
export function getRegisteredClientIds(): string[] {
  return Object.keys(DRIVER_CONFIGS)
}
