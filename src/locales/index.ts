import { createI18n } from 'vue-i18n'
import en from './en.json'
import ru from './ru.json'
import de from './de.json'
import zh from './zh.json'

const messages = {
  zh,
  de,
  en,
  ru,
}

export const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages,
})
