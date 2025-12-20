import { createRestClient } from '@/core/rest'
import { RestApiCommandEnum } from '@/enums/rest-api.enum'
import { PersonResponseModel } from '@/models/person-response.model'
import type { ApiResponse, ApiError } from '@/core/config'
import { personConfig } from '@/core/config'
import type { PersonInterface as PersonApiResponse } from '@/core/rest-interface/person'

export class GetRandomPersonCommand {
  private endpoint = `/${RestApiCommandEnum.PERSON}`
  private httpClient = createRestClient(personConfig)

  async execute(): Promise<PersonResponseModel> {
    try {
      const response: ApiResponse<PersonApiResponse> =
        await this.httpClient.get<PersonApiResponse>(this.endpoint)

      return new PersonResponseModel(response.data)
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to fetch person data: ${apiError.message}`)
    }
  }

  async executeWithCancel(key: string): Promise<PersonResponseModel> {
    const response = await this.httpClient.cancellableRequest<PersonApiResponse>(
      key,
      this.endpoint,
    )
    return new PersonResponseModel(response.data)
  }
}

export const personCommand = {
  getRandomPerson: () => new GetRandomPersonCommand(),
}
