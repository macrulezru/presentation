import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type CancelTokenSource,
} from 'axios';

import type {
  HttpConfig,
  ApiError,
  ApiResponse,
  RetryConfig,
  RestRequestConfig,
} from './types';

type RestClient = ReturnType<typeof createRestClient>;

const defaultRetryConfig: RetryConfig = {
  attempts: 0,
  delayMs: 300,
  backoffMultiplier: 2,
  retriableStatus: [429, 500, 502, 503, 504],
};

/**
 * Нормализация ошибок в единый формат ApiError
 */
export function toApiError(error: unknown): ApiError {
  if (axios.isCancel(error)) {
    return {
      message: 'Запрос был отменен',
      code: 'REQUEST_CANCELLED',
    };
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error;
    return {
      message: axiosError.message,
      code: axiosError.code,
      status: axiosError.response?.status,
      timestamp: new Date(),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      timestamp: new Date(),
    };
  }

  return {
    message: 'Произошла неизвестная ошибка',
    timestamp: new Date(),
  };
}

export function isApiError(error: unknown): error is ApiError {
  return Boolean(error) && typeof (error as ApiError).message === 'string';
}

function shouldRetry(error: ApiError, retry: RetryConfig): boolean {
  if (error.code === 'REQUEST_CANCELLED') return false;
  if (!retry.attempts) return false;

  // Сетевые ошибки без статуса и таймауты
  if (!error.status) return true;
  if (error.code === 'ECONNABORTED') return true;

  return retry.retriableStatus?.includes(error.status) ?? false;
}

function backoffDelay(baseDelay: number, multiplier: number, attempt: number): number {
  return Math.round(baseDelay * Math.pow(multiplier, attempt));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function serializePayload(payload: unknown, maxLength = 3000): string | undefined {
  if (payload === undefined) return undefined;
  try {
    const asString =
      typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    if (!asString) return undefined;
    if (asString.length > maxLength) return `${asString.slice(0, maxLength)} ...`; // truncated
    return asString;
  } catch {
    try {
      return String(payload);
    } catch {
      return '[unserializable]';
    }
  }
}

function sanitizeHeaders(
  headers?: AxiosRequestConfig['headers'] | Record<string, unknown>,
): Record<string, string> | undefined {
  if (!headers) return undefined;
  const forbidden = ['authorization', 'cookie', 'set-cookie'];
  const out: Record<string, string> = {};
  Object.entries(headers as Record<string, unknown>).forEach(([key, value]) => {
    if (!key) return;
    if (forbidden.includes(key.toLowerCase())) return;
    if (value === undefined) return;
    out[key] = String(value);
  });
  return Object.keys(out).length ? out : undefined;
}

const restClientCache: Map<string, RestClient> = new Map();

/**
 * Базовый HTTP клиент без привязки к конкретным типам
 */
export function createRestClient(config: HttpConfig) {
  const httpClient: AxiosInstance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: config.headers,
    withCredentials: config.withCredentials,
  });

  const retryConfig: RetryConfig = {
    ...defaultRetryConfig,
    ...(config.retry ?? {}),
  };

  const cancelTokenSources: Map<string, CancelTokenSource> = new Map();

  // Кэш ответов (только для GET по умолчанию)
  const cacheEnabled = Boolean(config.cache?.enabled);
  const defaultTtl = config.cache?.ttlMs ?? 60000;
  const responseCache: Map<string, { expiresAt: number; payload: ApiResponse<any> }> =
    new Map();

  function makeCacheKey(command: string, req: RestRequestConfig | undefined): string {
    const method = (req?.method ?? 'GET').toUpperCase();
    const key = req?.cacheKey;
    if (key) return key;
    return JSON.stringify({ url: command, method, params: req?.params });
  }

  function fromCache<T>(key: string): ApiResponse<T> | null {
    const hit = responseCache.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      responseCache.delete(key);
      return null;
    }
    return hit.payload as ApiResponse<T>;
  }

  function saveCache<T>(key: string, resp: ApiResponse<T>, ttl: number): void {
    responseCache.set(key, { expiresAt: Date.now() + ttl, payload: resp });
  }

  // Ограничение скорости/параллелизма
  const maxConcurrent = config.rateLimit?.maxConcurrent ?? Infinity;
  const queue: Array<() => void> = [];
  let running = 0;

  const maxPerInterval = config.rateLimit?.maxRequestsPerInterval;
  const intervalMs = config.rateLimit?.intervalMs ?? 1000;
  let tokens = typeof maxPerInterval === 'number' ? maxPerInterval : undefined;
  if (typeof maxPerInterval === 'number') {
    setInterval(
      () => {
        tokens = maxPerInterval;
        // Пингуем очередь на всякий случай
        drainQueue();
      },
      Math.max(50, intervalMs),
    );
  }

  function canStart(): boolean {
    const slotFree = running < maxConcurrent;
    const tokenFree = tokens === undefined || (tokens as number) > 0;
    return slotFree && tokenFree;
  }

  function drainQueue(): void {
    while (queue.length && canStart()) {
      const next = queue.shift();
      if (next) next();
    }
  }

  async function schedule<T>(fn: () => Promise<T>, cfg?: RestRequestConfig): Promise<T> {
    if (cfg?.skipRateLimit) {
      return fn();
    }

    await new Promise<void>(resolve => {
      const tryStart = () => {
        if (canStart()) {
          running += 1;
          if (tokens !== undefined) tokens = Math.max(0, (tokens as number) - 1);
          resolve();
        } else {
          queue.push(tryStart);
        }
      };
      tryStart();
    });

    try {
      return await fn();
    } finally {
      running = Math.max(0, running - 1);
      drainQueue();
    }
  }

  // Интерцепторы
  httpClient.interceptors.request.use(
    requestConfig => {
      console.debug(
        `[HTTP] Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`,
      );
      return requestConfig;
    },
    error => Promise.reject(toApiError(error)),
  );

  httpClient.interceptors.response.use(
    response => {
      console.debug(`[HTTP] Response: ${response.status} ${response.statusText}`);
      return response;
    },
    error => Promise.reject(toApiError(error)),
  );

  /**
   * Базовый запрос
   */
  async function request<T = unknown>(
    command: string,
    req?: RestRequestConfig,
  ): Promise<ApiResponse<T>> {
    const reqId = req?.requestId ?? Math.random().toString(36).slice(2);
    const nowFn =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? () => performance.now()
        : () => Date.now();
    const startTs = nowFn();

    const methodUpper = (req?.method ?? 'GET').toUpperCase();
    const willUseCache = (req?.useCache ?? cacheEnabled) && methodUpper === 'GET';
    const cacheKey = willUseCache ? makeCacheKey(command, req) : '';
    if (willUseCache) {
      const cached = fromCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    config.metrics?.onRequestStart?.({
      id: reqId,
      method: methodUpper,
      url: command,
      timestamp: Date.now(),
      requestBody: serializePayload(req?.data),
      requestParams: req?.params,
      requestHeaders: sanitizeHeaders(req?.headers),
    });

    let attempt = 0;
    let lastError: ApiError | null = null;

    while (attempt <= retryConfig.attempts) {
      try {
        const response: AxiosResponse<T> = await schedule(
          () =>
            httpClient.request<T>({
              url: command,
              ...req,
            }),
          req,
        );

        const headers = response.headers as Record<string, string>;
        const contentLengthHeader =
          headers['content-length'] || headers['Content-Length'] || undefined;
        const parsedLength = contentLengthHeader
          ? Number(contentLengthHeader)
          : undefined;
        let responseBytes: number | undefined =
          Number.isFinite(parsedLength) && parsedLength !== 0 ? parsedLength : undefined;
        if (responseBytes === undefined) {
          try {
            const raw = response.data;
            if (typeof raw === 'string') {
              responseBytes = new TextEncoder().encode(raw).length;
            } else if (raw !== undefined) {
              const str = JSON.stringify(raw);
              responseBytes = new TextEncoder().encode(str).length;
            }
          } catch {
            // ignore sizing errors
          }
        }

        const payload: ApiResponse<T> = {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers,
        };
        if (willUseCache) {
          saveCache(cacheKey, payload, req?.cacheTtlMs ?? defaultTtl);
        }

        const endTs = nowFn();
        const duration = endTs - startTs;
        config.metrics?.onRequestEnd?.({
          id: reqId,
          durationMs: duration,
          status: response.status,
          bytes: responseBytes,
          responseBody: serializePayload(response.data),
          responseHeaders: sanitizeHeaders(response.headers),
        });

        return payload;
      } catch (error) {
        const apiError = toApiError(error);
        const responseBody =
          axios.isAxiosError(error) && error.response
            ? serializePayload(error.response.data)
            : undefined;
        const responseHeaders =
          axios.isAxiosError(error) && error.response
            ? sanitizeHeaders(error.response.headers)
            : undefined;
        lastError = apiError;

        if (!shouldRetry(apiError, retryConfig) || attempt === retryConfig.attempts) {
          const endTs = nowFn();
          const duration = endTs - startTs;
          config.metrics?.onRequestEnd?.({
            id: reqId,
            durationMs: duration,
            error: apiError,
            responseBody,
            responseHeaders,
          });
          throw apiError;
        }

        const delay = backoffDelay(
          retryConfig.delayMs,
          retryConfig.backoffMultiplier,
          attempt,
        );
        await sleep(delay);
        attempt += 1;
      }
    }

    throw lastError ?? toApiError(new Error('Неизвестная ошибка запроса'));
  }

  /**
   * Отмена запроса
   */
  function cancelRequest(key: string): void {
    const source = cancelTokenSources.get(key);
    if (source) {
      source.cancel(`Запрос отменен по ключу: ${key}`);
      cancelTokenSources.delete(key);
    }
  }

  /**
   * Отменяемый запрос
   */
  async function cancellableRequest<T = unknown>(
    key: string,
    command: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    cancelRequest(key);

    const source = axios.CancelToken.source();
    cancelTokenSources.set(key, source);

    try {
      return await request<T>(command, {
        ...config,
        cancelToken: source.token,
      });
    } finally {
      cancelTokenSources.delete(key);
    }
  }

  // Публичное API
  return {
    // Основные методы
    request,
    get: <T = unknown>(command: string, config?: Omit<RestRequestConfig, 'method'>) =>
      request<T>(command, { ...config, method: 'GET' }),
    post: <T = unknown>(
      command: string,
      data?: unknown,
      config?: Omit<RestRequestConfig, 'method' | 'data'>,
    ) => request<T>(command, { ...config, method: 'POST', data }),
    put: <T = unknown>(
      command: string,
      data?: unknown,
      config?: Omit<RestRequestConfig, 'method' | 'data'>,
    ) => request<T>(command, { ...config, method: 'PUT', data }),
    delete: <T = unknown>(command: string, config?: Omit<RestRequestConfig, 'method'>) =>
      request<T>(command, { ...config, method: 'DELETE' }),

    // Специальные методы
    cancellableRequest,
    cancelRequest,
  };
}

/**
 * Возвращает singleton REST клиент для переданного конфига
 */
export function getRestClient(config: HttpConfig): RestClient {
  const key = JSON.stringify({
    baseURL: config.baseURL,
    timeout: config.timeout,
    withCredentials: config.withCredentials,
    headers: config.headers ?? {},
    retry: config.retry ?? {},
  });

  const cachedClient = restClientCache.get(key);
  if (cachedClient) return cachedClient;

  const client = createRestClient(config);
  restClientCache.set(key, client);
  return client;
}
