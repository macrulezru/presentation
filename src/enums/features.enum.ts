export enum FeaturesEnum {
  UI_COMPONENTS = 'ui-components',
  PIPELINE = 'pipeline',
  LOCALIZATION = 'localization',
  SEAT_MAP = 'seat-map',
  MULTISYNC = 'multisync',
  REST_MONITORING = 'rest-monitoring',
  DEPLOY_PLATFORM = 'deploy-platform',
}

export type FeaturesType = (typeof FeaturesEnum)[keyof typeof FeaturesEnum];
