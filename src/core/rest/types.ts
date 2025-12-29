import { metricsHandlers } from '@/core/metrics/metrics-bus';
import { RestApiEnum } from '@/enums/rest-api.enum';

export interface RetryConfig {
  attempts: number;
  delayMs: number;
  backoffMultiplier: number;
  retriableStatus?: number[];
}

export type RetryOptions = Partial<RetryConfig>;

export interface CacheConfig {
  enabled: boolean;
  ttlMs: number;
}

export interface RateLimitConfig {
  maxConcurrent?: number;
  maxRequestsPerInterval?: number;
  intervalMs?: number;
}

export interface MetricsHandler {
  onRequestStart?: (info: {
    id: string;
    method?: string;
    url?: string;
    timestamp: number;
    requestBody?: unknown;
    requestParams?: unknown;
    requestHeaders?: Record<string, string>;
  }) => void;
  onRequestEnd?: (info: {
    id: string;
    durationMs: number;
    status?: number;
    error?: ApiError;
    bytes?: number;
    responseBody?: unknown;
    responseHeaders?: Record<string, string>;
  }) => void;
}

export interface HttpConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  retry?: RetryOptions;
  cache?: CacheConfig;
  rateLimit?: RateLimitConfig;
  metrics?: MetricsHandler;
}

/**
 * Типизированный ответ от API ошибок
 */
export interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
  timestamp?: Date;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export type RestRequestConfig = import('axios').AxiosRequestConfig & {
  useCache?: boolean;
  cacheTtlMs?: number;
  cacheKey?: string;
  skipRateLimit?: boolean;
  requestId?: string;
};

const defaultRetry: RetryConfig = {
  attempts: 2,
  delayMs: 300,
  backoffMultiplier: 2,
  retriableStatus: [429, 500, 502, 503, 504],
};

export const jokeConfig: HttpConfig = {
  baseURL: RestApiEnum.JOKE,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
  retry: { ...defaultRetry },
  cache: { enabled: false, ttlMs: 60000 },
  rateLimit: { maxConcurrent: 6, maxRequestsPerInterval: 30, intervalMs: 1000 },
  metrics: metricsHandlers,
};

export const personConfig: HttpConfig = {
  baseURL: RestApiEnum.PERSON,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
  retry: { ...defaultRetry },
  cache: { enabled: false, ttlMs: 60000 },
  rateLimit: { maxConcurrent: 6, maxRequestsPerInterval: 30, intervalMs: 1000 },
  metrics: metricsHandlers,
};

export const productConfig: HttpConfig = {
  baseURL: RestApiEnum.PRODUCT,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
  retry: { ...defaultRetry },
  cache: { enabled: false, ttlMs: 60000 },
  rateLimit: { maxConcurrent: 6, maxRequestsPerInterval: 30, intervalMs: 1000 },
  metrics: metricsHandlers,
};

export const healthConfig: HttpConfig = {
  baseURL: RestApiEnum.MY_API,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
  retry: { ...defaultRetry },
  cache: { enabled: false, ttlMs: 30000 },
  rateLimit: { maxConcurrent: 6, maxRequestsPerInterval: 30, intervalMs: 1000 },
  metrics: metricsHandlers,
};
