import type { Person, PersonInterface, ResponseInfo } from '@/core/rest-interface/person';

import { BaseModel } from '@/models/base-model';
import { PersonModel } from '@/models/person.model';

export class PersonResponseModel extends BaseModel {
  readonly persons: PersonModel[];
  readonly info: ResponseInfo;

  constructor(raw: PersonInterface<Person>) {
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
