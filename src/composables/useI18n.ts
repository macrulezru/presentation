import { i18n } from '@/locales'
import { useRouter } from 'vue-router'

export const useI18n = () => {
  const { t, tm, locale, availableLocales } = i18n.global
  const router = useRouter()

  const changeLocale = async (newLocale: string) => {
    const supportedLocales = ['ru', 'en', 'de', 'zh']

    if (!supportedLocales.includes(newLocale)) {
      console.warn(`Locale ${newLocale} is not supported`)
      return
    }

    try {
      // Меняем локаль в i18n
      locale.value = newLocale as 'ru' | 'en' | 'de' | 'zh'
      localStorage.setItem('user-locale', newLocale)

      // Обновляем URL через роутер
      await router.push(`/${newLocale}`)
    } catch (error) {
      console.error('Failed to change locale:', error)
    }
  }

  // Инициализация локали при загрузке
  const initLocale = () => {
    const savedLocale = localStorage.getItem('user-locale')
    const urlLocale = router.currentRoute.value.params.locale as string
    const supportedLocales = ['ru', 'en', 'de', 'zh']

    // Приоритет: URL > localStorage > дефолтная (ru)
    const targetLocale = urlLocale || savedLocale || 'ru'

    if (supportedLocales.includes(targetLocale)) {
      locale.value = targetLocale as 'ru' | 'en' | 'de' | 'zh'
    } else {
      locale.value = 'ru'
    }

    // Синхронизируем URL если нужно
    if (!urlLocale && router.currentRoute.value.name === 'home') {
      router.replace(`/${locale.value}`)
    }
  }

  return {
    t,
    tm,
    locale: locale,
    availableLocales,
    changeLocale,
    initLocale,
  }
}
