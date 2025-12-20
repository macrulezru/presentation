export enum FeanuresEnum {
  UI_COMPONENTS = 'ui-components',
  PIPLINE = 'pipeline',
  LOCALIZATION = 'localization',
  SEAT_MAP = 'seat-map',
  MULTISYNC = 'multisync',

}

export type FeanuresType = (typeof FeanuresEnum)[keyof typeof FeanuresEnum]
