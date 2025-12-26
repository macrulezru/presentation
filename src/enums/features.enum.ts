export enum FeaturesEnum {
  UI_COMPONENTS = 'ui-components',
  PIPELINE = 'pipeline',
  LOCALIZATION = 'localization',
  SEAT_MAP = 'seat-map',
  MULTISYNC = 'multisync',
}

export type FeaturesType = (typeof FeaturesEnum)[keyof typeof FeaturesEnum]
