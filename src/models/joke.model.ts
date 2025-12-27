import type { JokeInterface } from '@/core/rest-interface/joke';

import { BaseModel } from '@/models/base-model';

export class JokeModel extends BaseModel {
  readonly id: number;
  readonly type: string;
  readonly setup: string;
  readonly punchline: string;

  constructor(raw: JokeInterface) {
    super(raw);

    this.id = raw.id;
    this.type = raw.type;
    this.setup = raw.setup;
    this.punchline = raw.punchline;
  }

  get Setup(): string {
    return this.setup;
  }

  get Punchline(): string {
    return this.punchline;
  }
}
