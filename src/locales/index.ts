import { createI18n } from 'vue-i18n';

import { LocalesEnum, type LocalesEnumType, LocalesList } from '@/enums/locales.enum';
import { localeImportMap, preloadLocale } from '@/locales/locale-imports';

const PLACEHOLDER_MAP: Record<string, string> = {
  '__PH:AT__': '@',
};

function restorePlaceholders(value: unknown): unknown {
  if (typeof value === 'string') {
    return Object.entries(PLACEHOLDER_MAP).reduce((acc, [placeholder, char]) => {
      return acc.replace(new RegExp(placeholder, 'g'), char);
    }, value);
  }

  return value;
}

const messages = {};

export const i18n = createI18n({
  legacy: false,
  locale: LocalesEnum.RU,
  fallbackLocale: LocalesEnum.RU,
  messages,
  missingWarn: false,
  fallbackWarn: false,
});

const rawTranslate = i18n.global.t.bind(i18n.global);

i18n.global.t = ((...args: Parameters<typeof rawTranslate>) => {
  const result = rawTranslate(...args);
  return restorePlaceholders(result) as ReturnType<typeof rawTranslate>;
}) as typeof i18n.global.t;

const loadedLocales = new Set<string>();

// Функция для динамической загрузки локалей
export async function loadLocale(locale: LocalesEnumType) {
  if (loadedLocales.has(locale)) {
    return;
  }

  try {
    const loader = localeImportMap[locale];
    const module = await loader();

    i18n.global.setLocaleMessage(locale, module.default);
    loadedLocales.add(locale);
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error);
    throw error;
  }
}

// Функция для определения начальной локали
export function getInitialLocale(): LocalesEnumType {
  const { hash } = window.location;

  if (hash) {
    const pathWithoutHash = hash.slice(1);
    const segments = pathWithoutHash.split('/').filter(Boolean);

    const [firstSegment] = segments;

    if (firstSegment) {
      const possibleLocale = firstSegment.toUpperCase() as LocalesEnumType;
      if (LocalesList.includes(possibleLocale)) {
        return possibleLocale;
      }
    }
  }

  const savedLocale = localStorage.getItem('user-locale') as LocalesEnumType | null;
  if (savedLocale && LocalesList.includes(savedLocale)) {
    return savedLocale;
  }

  return LocalesEnum.RU;
}

// Экспортируем preloadLocale
export { preloadLocale };
