import type { JokeInterface } from '@/core/rest-interface/joke';

import { BaseCommand } from '@/core/commands/base.command';
import { jokeConfig } from '@/core/config';
import { getRestClient } from '@/core/rest';
import { RestApiCommandEnum } from '@/enums/rest-api.enum';
import { JokeModel } from '@/models/joke.model';

export class GetRandomJokeCommand extends BaseCommand<JokeInterface, JokeModel> {
  constructor() {
    super(
      `/${RestApiCommandEnum.RANDOM_JOKE}`,
      getRestClient(jokeConfig),
      data => new JokeModel(data),
      'joke',
    );
  }
}

export const jokeCommand = {
  getRandomJoke: () => new GetRandomJokeCommand(),
};
