export interface ApiInfo {
  baseUrl: string;
  endpoint: string;
  method: string;
  fullUrl: string;
}

export interface Props {
  apiInfo: ApiInfo;
  loading: boolean;
  error: string | null;
}
