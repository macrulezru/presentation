import { RestApiEnum } from '@/enums/rest-api.enum';

export interface HttpConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export const jokeConfig: HttpConfig = {
  baseURL: RestApiEnum.JOKE,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
};

export const personConfig: HttpConfig = {
  baseURL: RestApiEnum.PERSON,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
};

export const productConfig: HttpConfig = {
  baseURL: RestApiEnum.PRODUCT,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
};

export const healthConfig: HttpConfig = {
  baseURL: RestApiEnum.MY_API,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
};

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
