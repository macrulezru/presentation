import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type CancelTokenSource,
} from 'axios';

import type { HttpConfig, ApiError, ApiResponse } from './config';

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

  const cancelTokenSources: Map<string, CancelTokenSource> = new Map();

  // Интерцепторы
  httpClient.interceptors.request.use(
    requestConfig => {
      console.debug(
        `[HTTP] Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`,
      );
      return requestConfig;
    },
    error => Promise.reject(normalizeError(error)),
  );

  httpClient.interceptors.response.use(
    response => {
      console.debug(`[HTTP] Response: ${response.status} ${response.statusText}`);
      return response;
    },
    error => Promise.reject(normalizeError(error)),
  );

  /**
   * Базовый запрос
   */
  async function request<T = unknown>(
    command: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await httpClient.request<T>({
        url: command,
        ...config,
      });

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Нормализация ошибок
   */
  function normalizeError(error: unknown): ApiError {
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
    get: <T = unknown>(command: string, config?: Omit<AxiosRequestConfig, 'method'>) =>
      request<T>(command, { ...config, method: 'GET' }),
    post: <T = unknown>(
      command: string,
      data?: unknown,
      config?: Omit<AxiosRequestConfig, 'method' | 'data'>,
    ) => request<T>(command, { ...config, method: 'POST', data }),
    put: <T = unknown>(
      command: string,
      data?: unknown,
      config?: Omit<AxiosRequestConfig, 'method' | 'data'>,
    ) => request<T>(command, { ...config, method: 'PUT', data }),
    delete: <T = unknown>(command: string, config?: Omit<AxiosRequestConfig, 'method'>) =>
      request<T>(command, { ...config, method: 'DELETE' }),

    // Специальные методы
    cancellableRequest,
    cancelRequest,
  };
}
