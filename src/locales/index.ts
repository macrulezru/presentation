import { createI18n } from 'vue-i18n'
import ru from './ru.json'
import { LocalesEnum, type LocalesEnumType } from '@/enums/locales.enum'
import { localeImportMap } from '@/locales/locale-imports'

const messages = {
  [LocalesEnum.RU]: ru,
}

export const i18n = createI18n({
  legacy: false,
  locale: LocalesEnum.RU,
  fallbackLocale: LocalesEnum.RU,
  messages,
})

// Функция для динамической загрузки локалей
export async function loadLocale(locale: LocalesEnumType) {
  if (locale === LocalesEnum.RU) {
    return // Русская локаль уже загружена
  }

  try {
    const loader = localeImportMap[locale]
    const module = await loader()
    i18n.global.setLocaleMessage(locale, module.default)
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error)
    throw error
  }
}
