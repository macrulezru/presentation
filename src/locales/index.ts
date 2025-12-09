import { createI18n } from 'vue-i18n'
import { LocalesEnum, type LocalesEnumType } from '@/enums/locales.enum'
import { localeImportMap } from '@/locales/locale-imports'

const messages = {}

export const i18n = createI18n({
  legacy: false,
  locale: LocalesEnum.RU,
  fallbackLocale: LocalesEnum.RU,
  messages,
  missingWarn: false,
  fallbackWarn: false,
})

const loadedLocales = new Set<string>()

// Функция для динамической загрузки локалей
export async function loadLocale(locale: LocalesEnumType) {
  if (loadedLocales.has(locale)) {
    return
  }

  try {
    const loader = localeImportMap[locale]
    const module = await loader()

    i18n.global.setLocaleMessage(locale, module.default)
    loadedLocales.add(locale)
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error)
    throw error
  }
}

export async function loadDefaultLocale() {
  return loadLocale(LocalesEnum.RU)
}
