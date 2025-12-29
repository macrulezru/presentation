import type { RetryConfig, HttpConfig } from '@/core/rest/types';

import { metricsHandlers } from '@/core/metrics/metrics-bus';
import { RestApiEnum } from '@/enums/rest-api.enum';

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
