import { i18n, loadLocale } from '@/locales'
import { useRouter } from 'vue-router'
import { LocalesEnum, LocalesList, type LocalesEnumType } from '@/enums/locales.enum'
import { useLocaleStore } from '@/stores/use-locale-store'

export const useI18n = () => {
  const { t, locale, availableLocales } = i18n.global
  const tm = i18n.global.tm as (key: string) => any
  const router = useRouter()
  const localeStore = useLocaleStore()
  const isLoading = ref(false)

  // Изменяем changeLocale для предзагрузки следующей локали
  const changeLocale = async (newLocale: LocalesEnumType, path?: string) => {
    if (!LocalesList.includes(newLocale)) {
      console.warn(`Locale ${newLocale} is not supported`)
      return
    }

    // Предзагружаем локаль если еще не загружена
    if (!i18n.global.availableLocales.includes(newLocale as any)) {
      isLoading.value = true
      try {
        await loadLocale(newLocale)
      } catch (error) {
        console.error('Failed to change locale:', error)
        locale.value = LocalesEnum.RU as any
        localeStore.setLocale(LocalesEnum.RU)
        isLoading.value = false
        return
      } finally {
        isLoading.value = false
      }
    }

    locale.value = newLocale as any
    localeStore.setLocale(newLocale)
    localStorage.setItem('user-locale', newLocale)
    updateURL(newLocale, path)
  }

  const updateURL = async (newLocale: LocalesEnumType, path?: string) => {
    const currentRoute = router.currentRoute.value
    const currentSection = currentRoute.params.section as string

    const newPath =
      path || (currentSection ? `/${newLocale}/${currentSection}` : `/${newLocale}`)

    await router.push(newPath)
  }

  // Инициализация локали при загрузке с оптимизацией
  const initLocale = async () => {
    const urlLocale = router.currentRoute.value.params.locale as LocalesEnumType
    const savedLocale = localStorage.getItem('user-locale') as LocalesEnumType | null

    // Определяем целевую локаль
    const targetLocale = (urlLocale || savedLocale || LocalesEnum.RU) as LocalesEnumType

    // Если локаль не поддерживается - fallback на RU
    if (!LocalesList.includes(targetLocale)) {
      locale.value = LocalesEnum.RU as any
      localeStore.setLocale(LocalesEnum.RU)
      return
    }

    // Сначала устанавливаем целевую локаль до загрузки
    locale.value = targetLocale as any
    localeStore.setLocale(targetLocale)

    // Если локаль не русская и не загружена, загружаем её
    if (
      targetLocale !== LocalesEnum.RU &&
      !i18n.global.availableLocales.includes(targetLocale as any)
    ) {
      try {
        await loadLocale(targetLocale)
        // После загрузки подтверждаем установку локали
        locale.value = targetLocale as any
      } catch (error) {
        console.error(`Failed to load initial locale ${targetLocale}:`, error)
        locale.value = LocalesEnum.RU as any
        localeStore.setLocale(LocalesEnum.RU)
        return
      }
    } else if (targetLocale === LocalesEnum.RU) {
      // Для русской локали убедимся, что она загружена
      if (!i18n.global.availableLocales.includes(LocalesEnum.RU as any)) {
        await loadLocale(LocalesEnum.RU)
      }
    }

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
