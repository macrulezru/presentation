import { i18n } from '@/locales'

export const useI18n = () => {
  const { t, tm, locale, availableLocales } = i18n.global

  const changeLocale = (newLocale: string) => {
    // Приводим тип к допустимым значениям
    locale.value = newLocale as 'ru' | 'en'
    localStorage.setItem('user-locale', newLocale)
  }

  return {
    t,
    tm,
    locale: locale,
    availableLocales,
    changeLocale,
  }
}
