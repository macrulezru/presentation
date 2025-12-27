import type { ApiResponse, ApiError } from '@/core/config';

import { jokeConfig } from '@/core/config';
import { createRestClient } from '@/core/rest';
import { RestApiCommandEnum } from '@/enums/rest-api.enum';
import { JokeModel } from '@/models/joke.model';

export class GetRandomJokeCommand {
  private endpoint = `/${RestApiCommandEnum.RANDOM_JOKE}`;
  private httpClient = createRestClient(jokeConfig);

  async execute(): Promise<JokeModel> {
    try {
      const response: ApiResponse<JokeModel> = await this.httpClient.get<JokeModel>(
        this.endpoint,
      );

      return new JokeModel(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(`Failed to fetch joke: ${apiError.message}`);
    }
  }

  async executeWithCancel(key: string): Promise<JokeModel> {
    const response = await this.httpClient.cancellableRequest<JokeModel>(
      key,
      this.endpoint,
    );
    return response.data;
  }
}

export const jokeCommand = {
  getRandomJoke: () => new GetRandomJokeCommand(),
};
