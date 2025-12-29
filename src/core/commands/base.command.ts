import type { ApiError } from '@/core/rest/types';

import { getRestClient, toApiError } from '@/core/rest/rest';

export type RestCommandClient = ReturnType<typeof getRestClient>;

/**
 * Базовая команда: унифицирует вызовы API, отмену запросов и обработку ошибок
 */
export abstract class BaseCommand<TResponse, TModel> {
  private _loading = false;
  private _error: ApiError | null = null;
  private loadingListeners: Array<(loading: boolean) => void> = [];
  private errorListeners: Array<(error: ApiError | null) => void> = [];

  protected constructor(
    protected readonly endpoint: string,
    protected readonly httpClient: RestCommandClient,
    private readonly mapToModel: (data: TResponse) => TModel,
    private readonly resourceName?: string,
  ) {}

  async execute(): Promise<TModel> {
    try {
      this.setLoading(true);
      const response = await this.httpClient.get<TResponse>(this.endpoint);
      const model = this.mapToModel(response.data);
      this.setError(null);
      return model;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.setLoading(false);
    }
  }

  async executeWithCancel(key: string): Promise<TModel> {
    try {
      this.setLoading(true);
      const response = await this.httpClient.cancellableRequest<TResponse>(
        key,
        this.endpoint,
      );
      const model = this.mapToModel(response.data);
      this.setError(null);
      return model;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.setLoading(false);
    }
  }

  protected handleError(error: unknown): Error {
    const apiError: ApiError = toApiError(error);
    const resource = this.resourceName ?? this.endpoint;
    this.setError(apiError);
    return new Error(`Failed to fetch ${resource}: ${apiError.message}`);
  }

  get loading(): boolean {
    return this._loading;
  }

  get error(): ApiError | null {
    return this._error;
  }

  onLoading(listener: (loading: boolean) => void): () => void {
    this.loadingListeners.push(listener);
    return () => this.offLoading(listener);
  }

  onError(listener: (error: ApiError | null) => void): () => void {
    this.errorListeners.push(listener);
    return () => this.offError(listener);
  }

  private offLoading(listener: (loading: boolean) => void): void {
    this.loadingListeners = this.loadingListeners.filter(l => l !== listener);
  }

  private offError(listener: (error: ApiError | null) => void): void {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  private setLoading(val: boolean): void {
    if (this._loading !== val) {
      this._loading = val;
      this.loadingListeners.forEach(l => l(val));
    }
  }

  private setError(err: ApiError | null): void {
    this._error = err;
    this.errorListeners.forEach(l => l(err));
  }
}
