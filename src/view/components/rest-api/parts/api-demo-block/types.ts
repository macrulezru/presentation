export interface ApiInfo {
  baseUrl: string;
  endpoint: string;
  method: string;
  fullUrl: string;
}

export interface Props {
  loading: boolean;
  error: string | null;
  requestInfo: { url: string; method: string };
  rawResponse: unknown;
  apiInfo: ApiInfo;
}

export interface Emits {
  (e: 'fetch'): void;
  (e: 'clear'): void;
}
