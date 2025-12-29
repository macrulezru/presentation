import type { HealthInterface } from '@/core/rest-interface/health';

import { BaseCommand } from '@/core/commands/base.command';
import { healthConfig } from '@/core/commands/types';
import { getRestClient } from '@/core/rest/rest';
import { RestApiCommandEnum } from '@/enums/rest-api.enum';
import { HealthModel } from '@/models/health.model';

export class GetHealthCommand extends BaseCommand<HealthInterface, HealthModel> {
  constructor() {
    super(
      `/${RestApiCommandEnum.HEALTH}`,
      getRestClient(healthConfig),
      data => new HealthModel(data),
      'health',
    );
  }
}

export const healthCommand = {
  getHealth: () => new GetHealthCommand(),
};
