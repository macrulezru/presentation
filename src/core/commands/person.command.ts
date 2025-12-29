import type { Person, PersonInterface } from '@/core/rest-interface/person';

import { BaseCommand } from '@/core/commands/base.command';
import { personConfig } from '@/core/commands/types';
import { getRestClient } from '@/core/rest/rest';
import { RestApiCommandEnum } from '@/enums/rest-api.enum';
import { PersonResponseModel } from '@/models/person-response.model';

type PersonApiResponse = PersonInterface<Person>;

export class GetRandomPersonCommand extends BaseCommand<
  PersonApiResponse,
  PersonResponseModel
> {
  constructor() {
    super(
      `/${RestApiCommandEnum.PERSON}`,
      getRestClient(personConfig),
      data => new PersonResponseModel(data),
      'person',
    );
  }
}

export const personCommand = {
  getRandomPerson: () => new GetRandomPersonCommand(),
};
