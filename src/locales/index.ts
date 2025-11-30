// locales/index.ts
import { createI18n } from 'vue-i18n'
import ru from './ru.json'

// Статически импортируем только русскую локаль
const messages = {
  ru,
}

export const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'ru',
  messages,
})

// Функция для динамической загрузки локалей
export async function loadLocale(locale: string) {
  if (locale === 'ru') {
    return // Русская локаль уже загружена
  }

  try {
    // Явный перечень импортов вместо шаблонной строки
    let module: { default: any }
    switch (locale) {
      case 'en':
        module = await import('./en.json')
        break
      case 'de':
        module = await import('./de.json')
        break
      case 'zh':
        module = await import('./zh.json')
        break
      default:
        throw new Error(`Unsupported locale: ${locale}`)
    }

    i18n.global.setLocaleMessage(locale, module.default)
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error)
    throw error
  }
}
