import type { ApiResponse, ApiError } from '@/core/config';
import type { PersonInterface as PersonApiResponse } from '@/core/rest-interface/person';

import { personConfig } from '@/core/config';
import { createRestClient } from '@/core/rest';
import { RestApiCommandEnum } from '@/enums/rest-api.enum';
import { PersonResponseModel } from '@/models/person-response.model';

export class GetRandomPersonCommand {
  private endpoint = `/${RestApiCommandEnum.PERSON}`;
  private httpClient = createRestClient(personConfig);

  async execute(): Promise<PersonResponseModel> {
    try {
      const response: ApiResponse<PersonApiResponse> =
        await this.httpClient.get<PersonApiResponse>(this.endpoint);

      return new PersonResponseModel(
        response.data as unknown as import('@/core/rest-interface/person').PersonInterface<
          import('@/core/rest-interface/person').Person
        >,
      );
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(`Failed to fetch person data: ${apiError.message}`);
    }
  }

  async executeWithCancel(key: string): Promise<PersonResponseModel> {
    const response = await this.httpClient.cancellableRequest<PersonApiResponse>(
      key,
      this.endpoint,
    );
    return new PersonResponseModel(
      response.data as unknown as import('@/core/rest-interface/person').PersonInterface<
        import('@/core/rest-interface/person').Person
      >,
    );
  }
}

export const personCommand = {
  getRandomPerson: () => new GetRandomPersonCommand(),
};
