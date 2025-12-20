import { BaseModel } from '@/models/base-model';
import { PersonModel } from '@/models/person.model';
import type { ResponseInfo } from '@/core/rest-interface/person';

interface RawPersonResponse {
  results: any[];
  info: ResponseInfo;
}

export class PersonResponseModel extends BaseModel {
  readonly persons: PersonModel[];
  readonly info: ResponseInfo;

  constructor(raw: RawPersonResponse) {
    super(raw);

    this.persons = raw.results.map(result => new PersonModel(result));
    this.info = raw.info;
  }

  get person(): PersonModel | null {
    return this.persons[0] || null;
  }

  get count(): number {
    return this.info.results;
  }

  get seed(): string {
    return this.info.seed;
  }

  get version(): string {
    return this.info.version;
  }

  get page(): number {
    return this.info.page;
  }
}
