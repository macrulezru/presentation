import type { ApiError, ApiResponse } from '@/core/config'
import { productConfig } from '@/core/config'
import { createRestClient } from '@/core/rest'
import { RestApiCommandEnum } from '@/enums/rest-api.enum'
import { ProductModel } from '@/models/product.model'

export class GetRandomProductCommand {
  private endpoint = `/${RestApiCommandEnum.PRODUCT}`
  private httpClient = createRestClient(productConfig)

  async execute(): Promise<ProductModel> {
    try {
      const response: ApiResponse<ProductModel> = await this.httpClient.get<ProductModel>(
        `${this.endpoint}`,
      )

      return new ProductModel(response.data)
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(`Failed to fetch product: ${apiError.message}`)
    }
  }

  async executeWithCancel(key: string): Promise<ProductModel> {
    const response = await this.httpClient.cancellableRequest<ProductModel>(
      key,
      this.endpoint,
    )
    return response.data
  }
}

export const productCommand = {
  getRandomProduct: () => new GetRandomProductCommand(),
}
