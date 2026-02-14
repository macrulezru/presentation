import { h, Fragment } from 'vue';
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
      return `__VNode:${safeTag}:${finalClass}__${inner}__VNode:${safeTag}__`;
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

export function useVNodeI18n() {
  const { t } = i18n.global;
  function vnodeT(key: string, ...args: unknown[]) {
    let raw;

    if (args.length === 0) {
      raw = t(key);
    } else {
      raw = t(key, args[0] as Record<string, unknown>);
    }

    if (typeof raw === 'string' && raw.includes('__VNode:')) {
      const parts: Array<string | ReturnType<typeof h>> = [];
      const vNodeRegex = /__VNode:([A-Z0-9]+):([a-zA-Z0-9_-]+)__(.*?)__VNode:\1__/gs;
      let lastIndex = 0;
      let match;
      while ((match = vNodeRegex.exec(raw)) !== null) {
        if (match.index > lastIndex) {
          parts.push(raw.slice(lastIndex, match.index));
        }
        const [, tag, cssClass, inner] = match;
        parts.push(h(tag || 'span', { class: cssClass }, String(inner ?? '')));
        ({ lastIndex } = vNodeRegex);
      }
      if (lastIndex < raw.length) {
        parts.push(raw.slice(lastIndex));
      }
      return h(Fragment, {}, parts);
    }
    return raw;
  }

  return { vnodeT };
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

// Автоматизация: если результат содержит __VNode:, возвращаем VNode
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
  const result = restorePlaceholders(rawTranslate(key, ...rest), { classes: options.classes });
  if (typeof result === 'string' && result.includes('__VNode:')) {
    const parts: Array<string | ReturnType<typeof h>> = [];
    const vNodeRegex = /__VNode:([A-Z0-9]+):([a-zA-Z0-9_-]+)__(.*?)__VNode:\1__/gs;
    let lastIndex = 0;
    let match;
    while ((match = vNodeRegex.exec(result)) !== null) {
      if (match.index > lastIndex) {
        parts.push(result.slice(lastIndex, match.index));
      }
      const [, tag, cssClass, inner] = match;
      parts.push(h(tag || 'span', { class: cssClass }, String(inner ?? '')));
      ({ lastIndex } = vNodeRegex);
    }
    if (lastIndex < result.length) {
      parts.push(result.slice(lastIndex));
    }
    return h(Fragment, {}, parts);
  }
  return result;
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
  const path =
    window.location.hash && window.location.hash.startsWith('#/')
      ? window.location.hash.slice(1)
      : window.location.pathname;

  if (path) {
    const segments = path.split('/').filter(Boolean);

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
