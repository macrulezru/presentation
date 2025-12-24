interface IRaw {
  [key: string]: any
}

export class BaseModel {
  readonly raw: IRaw

  constructor(raw: IRaw) {
    this.raw = raw
  }
}
