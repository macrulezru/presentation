export const LocalesEnum = {
  RU: 'ru',
  EN: 'en',
  DE: 'de',
  ZH: 'zh',
} as const

export type LocalesEnumType = (typeof LocalesEnum)[keyof typeof LocalesEnum]
