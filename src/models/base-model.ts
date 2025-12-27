interface IRaw {
  [key: string]: unknown;
}

export class BaseModel {
  readonly raw: IRaw;

  constructor(raw: IRaw) {
    this.raw = raw;
  }
}
