export const LocalesEnum = {
  RU: 'ru',
  EN: 'en',
  KZ: 'kz',
  DE: 'de',
  ZH: 'zh',
  GOP: 'gop',
  LITERAL: 'literal',
} as const

export type LocalesEnumType = (typeof LocalesEnum)[keyof typeof LocalesEnum]

export const LocalesToView = {
  RU: 'Русский',
  EN: 'English',
  KZ: 'Қазақша',
  DE: 'Deutsch',
  ZH: '中文',
  GOP: 'По пацански',
  LITERAL: 'Душевно',
} as const

export type LocalesToViewType = (typeof LocalesToView)[keyof typeof LocalesToView]

export const LocalesList = Object.values(LocalesEnum)
