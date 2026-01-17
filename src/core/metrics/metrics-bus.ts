import type { MetricsHandler, ApiError } from 'rest-pipeline-js';

export interface RequestStart {
  id: string;
  method?: string;
  url?: string;
  timestamp: number;
  requestBody?: unknown;
  requestParams?: unknown;
  requestHeaders?: Record<string, string>;
}

export interface RequestEnd {
  id: string;
  durationMs: number;
  status?: number;
  error?: ApiError;
  bytes?: number;
  responseBody?: unknown;
  responseHeaders?: Record<string, string>;
}

export interface RequestRecord {
  id: string;
  method?: string;
  url?: string;
  startAt: number;
  durationMs?: number;
  status?: number;
  error?: ApiError;
  responseBytes?: number;
  requestBody?: unknown;
  requestParams?: unknown;
  requestHeaders?: Record<string, string>;
  responseBody?: unknown;
  responseHeaders?: Record<string, string>;
}

export type MetricsSubscriber = (data: RequestRecord[]) => void;

class MetricsBus {
  private records: Map<string, RequestRecord> = new Map();
  private history: RequestRecord[] = [];
  private subscribers: Set<MetricsSubscriber> = new Set();
  private maxHistory = 200;

  subscribe(cb: MetricsSubscriber): () => void {
    this.subscribers.add(cb);
    // emit current snapshot immediately
    cb(this.getSnapshot());
    return () => this.unsubscribe(cb);
  }

  private unsubscribe(cb: MetricsSubscriber): void {
    this.subscribers.delete(cb);
  }

  publishStart(info: RequestStart): void {
    const rec: RequestRecord = {
      id: info.id,
      method: info.method,
      url: info.url,
      startAt: info.timestamp,
      requestBody: info.requestBody,
      requestParams: info.requestParams,
      requestHeaders: info.requestHeaders,
    };
    this.records.set(info.id, rec);
    this.pushHistory(rec);
    this.emit();
  }

  publishEnd(info: RequestEnd): void {
    const rec = this.records.get(info.id);
    if (rec) {
      rec.durationMs = info.durationMs;
      rec.status = info.status;
      rec.error = info.error;
      rec.responseBytes = info.bytes;
      rec.responseBody = info.responseBody;
      rec.responseHeaders = info.responseHeaders;
      this.emit();
    }
  }

  clear(): void {
    this.records.clear();
    this.history = [];
    this.emit();
  }

  getSnapshot(): RequestRecord[] {
    return [...this.history];
  }

  private pushHistory(rec: RequestRecord): void {
    this.history.unshift(rec);
    if (this.history.length > this.maxHistory) this.history.length = this.maxHistory;
  }

  private emit(): void {
    const snap = this.getSnapshot();
    this.subscribers.forEach(cb => cb(snap));
  }
}

export const metricsBus = new MetricsBus();

export const metricsHandlers: MetricsHandler = {
  onRequestStart: info => metricsBus.publishStart(info),
  onRequestEnd: info => metricsBus.publishEnd(info),
};
