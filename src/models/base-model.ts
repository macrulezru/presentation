export class BaseModel<T = unknown> {
  readonly raw: T;

  constructor(raw: T) {
    this.raw = raw;
  }
}
