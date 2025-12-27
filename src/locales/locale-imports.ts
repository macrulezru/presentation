import { LocalesEnum, type LocalesEnumType } from '@/enums/locales.enum';

// Экспортируем тип для импортов
export type LocaleImportMap = {
  [K in LocalesEnumType]: () => Promise<{ default: any }>;
};

// Карта импортов
export const localeImportMap: LocaleImportMap = {
  [LocalesEnum.RU]: () => import('./ru.json'),
  [LocalesEnum.EN]: () => import('./en.json'),
  [LocalesEnum.KZ]: () => import('./kz.json'),
  [LocalesEnum.DE]: () => import('./de.json'),
  [LocalesEnum.ZH]: () => import('./zh.json'),
};

// Функция для предварительной загрузки локали
export const preloadLocale = async (locale: LocalesEnumType): Promise<void> => {
  await localeImportMap[locale]();
};
