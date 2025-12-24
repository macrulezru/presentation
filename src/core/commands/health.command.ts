import type { ApiError, ApiResponse } from '@/core/config'
import { healthConfig } from '@/core/config'
import { createRestClient } from '@/core/rest'
import { RestApiCommandEnum } from '@/enums/rest-api.enum'
import { HealthModel } from '@/models/health.model'

export class GetHealthCommand {
  private endpoint = `/${RestApiCommandEnum.HEALTH}`
  private httpClient = createRestClient(healthConfig)

  async execute(): Promise<HealthModel> {
    try {
      const response: ApiResponse<HealthModel> = await this.httpClient.get<HealthModel>(
        this.endpoint,
      )

      return new HealthModel(response.data)
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to fetch joke: ${apiError.message}`)
    }
  }

  async executeWithCancel(key: string): Promise<HealthModel> {
    const response = await this.httpClient.cancellableRequest<HealthModel>(
      key,
      this.endpoint,
    )
    return response.data
  }
}

export const healthCommand = {
  getHealth: () => new GetHealthCommand(),
}
