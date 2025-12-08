import { i18n, loadLocale } from '@/locales'
import { useRouter } from 'vue-router'
import { LocalesEnum, LocalesList, type LocalesEnumType } from '@/enums/locales.enum'
import { useLocaleStore } from '@/stores/use-locale-store'

export const useI18n = () => {
  const { t, tm, locale, availableLocales } = i18n.global
  const router = useRouter()
  const localeStore = useLocaleStore()
  const isLoading = ref(false)

  const changeLocale = async (newLocale: LocalesEnumType, path?: string) => {
    if (!LocalesList.includes(newLocale)) {
      console.warn(`Locale ${newLocale} is not supported`)
      return
    }

    // Если локаль уже загружена, просто меняем
    if (i18n.global.availableLocales.includes(newLocale as any)) {
      locale.value = newLocale as any
      localeStore.setLocale(newLocale)
      updateURL(newLocale, path)
      return
    }

    // Загружаем локаль динамически
    isLoading.value = true
    try {
      await loadLocale(newLocale)
      locale.value = newLocale as any
      localeStore.setLocale(newLocale)
      localStorage.setItem('user-locale', newLocale)
      updateURL(newLocale, path)
    } catch (error) {
      console.error('Failed to change locale:', error)
      // Fallback на русский
      locale.value = LocalesEnum.RU as any
      localeStore.setLocale(LocalesEnum.RU)
    } finally {
      isLoading.value = false
    }
  }

  const updateURL = async (newLocale: LocalesEnumType, path?: string) => {
    const currentRoute = router.currentRoute.value
    const currentSection = currentRoute.params.section as string

    const newPath =
      path || (currentSection ? `/${newLocale}/${currentSection}` : `/${newLocale}`)

    await router.push(newPath)
  }

  // Инициализация локали при загрузке
  const initLocale = async () => {
    const savedLocale = localStorage.getItem('user-locale') as LocalesEnumType | null
    const urlLocale = router.currentRoute.value.params.locale as LocalesEnumType
    const supportedLocales = LocalesList

    // Приоритет: URL > localStorage > дефолтная (ru)
    const targetLocale = (urlLocale || savedLocale || LocalesEnum.RU) as LocalesEnumType

    if (!supportedLocales.includes(targetLocale)) {
      locale.value = LocalesEnum.RU as any
      localeStore.setLocale(LocalesEnum.RU)
      return
    }

    // Если локаль не русская, загружаем её
    if (
      targetLocale !== LocalesEnum.RU &&
      !i18n.global.availableLocales.includes(targetLocale as any)
    ) {
      try {
        await loadLocale(targetLocale)
      } catch (error) {
        console.error(`Failed to load initial locale ${targetLocale}:`, error)
        locale.value = LocalesEnum.RU as any
        localeStore.setLocale(LocalesEnum.RU)
        return
      }
    }

    locale.value = targetLocale as any
    localeStore.setLocale(targetLocale)

    // Синхронизируем URL если нужно
    if (!urlLocale && router.currentRoute.value.name === 'home') {
      await router.replace(`/${targetLocale}`)
    }
  }

  return {
    t,
    tm,
    locale: locale as ComputedRef<LocalesEnumType>,
    availableLocales,
    changeLocale,
    initLocale,
    isLoading: readonly(isLoading),
  }
}
