import { LocalesEnum, type LocalesEnumType } from '@/enums/locales.enum'

// Экспортируем тип для импортов
export type LocaleImportMap = {
  [K in LocalesEnumType]: () => Promise<{ default: any }>
}

// Карта импортов
export const localeImportMap: LocaleImportMap = {
  [LocalesEnum.RU]: () => Promise.resolve({ default: {} }),
  [LocalesEnum.EN]: () => import('./en.json'),
  [LocalesEnum.DE]: () => import('./de.json'),
  [LocalesEnum.ZH]: () => import('./zh.json'),
}
