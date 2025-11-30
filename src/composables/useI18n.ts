// composables/useI18n.ts
import { i18n, loadLocale } from '@/locales'
import { useRouter } from 'vue-router'

export const useI18n = () => {
  const { t, tm, locale, availableLocales } = i18n.global
  const router = useRouter()
  const isLoading = ref(false)

  const changeLocale = async (newLocale: string, path?: string) => {
    const supportedLocales = ['ru', 'en', 'de', 'zh']

    if (!supportedLocales.includes(newLocale)) {
      console.warn(`Locale ${newLocale} is not supported`)
      return
    }

    // Если локаль уже загружена, просто меняем
    if (
      i18n.global.availableLocales.includes((newLocale as 'ru') || 'en' || 'de' || 'zh')
    ) {
      // @ts-ignore - игнорируем ошибку типов Vue I18n
      locale.value = newLocale
      updateURL(newLocale, path)
      return
    }

    // Загружаем локаль динамически
    isLoading.value = true
    try {
      await loadLocale(newLocale)
      // @ts-ignore - игнорируем ошибку типов Vue I18n
      locale.value = newLocale
      localStorage.setItem('user-locale', newLocale)
      updateURL(newLocale, path)
    } catch (error) {
      console.error('Failed to change locale:', error)
      // Fallback на русский
      // @ts-ignore - игнорируем ошибку типов Vue I18n
      locale.value = 'ru'
    } finally {
      isLoading.value = false
    }
  }

  const updateURL = async (newLocale: string, path?: string) => {
    const currentRoute = router.currentRoute.value
    const currentSection = currentRoute.params.section as string

    const newPath =
      path || (currentSection ? `/${newLocale}/${currentSection}` : `/${newLocale}`)

    await router.push(newPath)
  }

  // Инициализация локали при загрузке
  const initLocale = async () => {
    const savedLocale = localStorage.getItem('user-locale')
    const urlLocale = router.currentRoute.value.params.locale as string
    const supportedLocales = ['ru', 'en', 'de', 'zh']

    // Приоритет: URL > localStorage > дефолтная (ru)
    const targetLocale = urlLocale || savedLocale || 'ru'

    if (!supportedLocales.includes(targetLocale)) {
      // @ts-ignore - игнорируем ошибку типов Vue I18n
      locale.value = 'ru'
      return
    }

    // Если локаль не русская, загружаем её
    if (
      targetLocale !== 'ru' &&
      !i18n.global.availableLocales.includes(
        (targetLocale as 'ru') || 'en' || 'de' || 'zh',
      )
    ) {
      try {
        await loadLocale(targetLocale)
      } catch (error) {
        console.error(`Failed to load initial locale ${targetLocale}:`, error)
        // @ts-ignore - игнорируем ошибку типов Vue I18n
        locale.value = 'ru'
        return
      }
    }

    // @ts-ignore - игнорируем ошибку типов Vue I18n
    locale.value = targetLocale

    // Синхронизируем URL если нужно
    if (!urlLocale && router.currentRoute.value.name === 'home') {
      await router.replace(`/${locale.value}`)
    }
  }

  return {
    t,
    tm,
    locale: locale,
    availableLocales,
    changeLocale,
    initLocale,
    isLoading: readonly(isLoading),
  }
}
