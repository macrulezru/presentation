import type { HealthInterface } from '@/core/rest-interface/health';

import { BaseModel } from '@/models/base-model';

export class HealthModel extends BaseModel {
  readonly status: string;
  readonly timestamp: string;

  constructor(raw: HealthInterface) {
    super(raw);

    this.status = raw.status;
    this.timestamp = raw.timestamp;
  }

  get State(): string {
    return this.status;
  }

  get Timestamp(): string {
    return this.timestamp;
  }
}
