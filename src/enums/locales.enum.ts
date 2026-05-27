export const LocalesEnum = {
  RU: 'ru',
  EN: 'en',
  DE: 'de',
  KZ: 'kz',
  ZH: 'zh',
} as const;

export type LocalesEnumType = (typeof LocalesEnum)[keyof typeof LocalesEnum];

export const LocalesToView = {
  RU: 'Русский',
  EN: 'English',
  DE: 'Deutsch',
  KZ: 'Қазақша',
  ZH: '中文',
} as const;

export type LocalesToViewType = (typeof LocalesToView)[keyof typeof LocalesToView];

export const LocalesList = Object.values(LocalesEnum);
