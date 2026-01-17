import { createI18n } from 'vue-i18n';

import { LocalesEnum, type LocalesEnumType, LocalesList } from '@/enums/locales.enum';
import { localeImportMap, preloadLocale } from '@/locales/locale-imports';

const PLACEHOLDER_MAP: Record<string, string> = {
  '__PH:AT__': '@',
};

function restoreHtmlBlocks(str: string, classesObj?: Record<string, string>): string {
  if (!str) return str;
  return str.replace(
    /__PH:BLOCK:([A-Z0-9]+):([a-zA-Z0-9_-]+)__([\s\S]*?)__PH:BLOCK:\1__/g,
    (_match, tag, cssClass, inner) => {
      let finalClass = cssClass;
      if (classesObj && typeof classesObj[cssClass] === 'string') {
        finalClass = classesObj[cssClass];
      }

      const safeTag = String(tag).replace(/[^a-zA-Z0-9]/g, '');
      return `<${safeTag} class="${finalClass}">${inner}</${safeTag}>`;
    },
  );
}

function restorePlaceholders(
  value: unknown,
  options?: { classes?: Record<string, string> },
): unknown {
  if (typeof value === 'string') {
    let result = Object.entries(PLACEHOLDER_MAP).reduce((acc, [placeholder, char]) => {
      return acc.replace(new RegExp(placeholder, 'g'), char);
    }, value);
    result = restoreHtmlBlocks(result, options?.classes);
    return result;
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

type RawTranslateRest =
  Parameters<typeof rawTranslate> extends [infer _K, ...infer R] ? R : never;

i18n.global.t = function <K extends string>(key: K, ...rest: RawTranslateRest) {
  type TOptions = { [key: string]: unknown; classes?: Record<string, string> };
  let options: TOptions = {};
  if (
    rest.length > 0 &&
    typeof rest[rest.length - 1] === 'object' &&
    !Array.isArray(rest[rest.length - 1])
  ) {
    options = rest[rest.length - 1] as TOptions;
  }
  const result = rawTranslate(key, ...rest);
  return restorePlaceholders(result, { classes: options.classes }) as ReturnType<
    typeof rawTranslate
  >;
} as typeof i18n.global.t;

const loadedLocales = new Set<string>();

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

export { preloadLocale };
