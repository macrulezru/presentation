import type { ProductInterface } from '@/core/rest-interface/product';

import { BaseCommand } from '@/core/commands/base.command';
import { productConfig } from '@/core/commands/types';
import { getRestClient } from '@/core/rest/rest';
import { RestApiCommandEnum } from '@/enums/rest-api.enum';
import { ProductModel } from '@/models/product.model';

export class GetRandomProductCommand extends BaseCommand<ProductInterface, ProductModel> {
  constructor() {
    super(
      `/${RestApiCommandEnum.PRODUCT}`,
      getRestClient(productConfig),
      data => new ProductModel(data),
      'product',
    );
  }
}

export const productCommand = {
  getRandomProduct: () => new GetRandomProductCommand(),
};
