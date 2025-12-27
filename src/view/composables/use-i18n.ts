import { ref, readonly, type ComputedRef } from 'vue';
import { useRouter } from 'vue-router';

import { LocalesEnum, LocalesList, type LocalesEnumType } from '@/enums/locales.enum';
import { i18n, loadLocale } from '@/locales';
import { useLocaleStore } from '@/stores/use-locale-store';

export const useI18n = () => {
  const { t, locale, availableLocales } = i18n.global;
  const tm = i18n.global.tm as (key: string) => unknown;
  const router = useRouter();
  const localeStore = useLocaleStore();
  const isLoading = ref(false);

  // Храним промис текущей загрузки для защиты от гонок
  const loadingPromise = ref<Promise<void> | null>(null);

  const changeLocale = async (newLocale: LocalesEnumType, path?: string) => {
    if (!LocalesList.includes(newLocale)) {
      console.warn(`Locale ${newLocale} is not supported`);
      return;
    }

    // Если уже загружается, ждем завершения
    if (loadingPromise.value) {
      await loadingPromise.value;
    }

    // Проверяем, не загружена ли уже локаль
    if (i18n.global.availableLocales.includes(newLocale as LocalesEnumType)) {
      locale.value = newLocale as LocalesEnumType;
      localeStore.setLocale(newLocale);
      localStorage.setItem('user-locale', newLocale);
      updateURL(newLocale, path);
      return;
    }

    isLoading.value = true;
    try {
      loadingPromise.value = loadLocale(newLocale);
      await loadingPromise.value;

      locale.value = newLocale as LocalesEnumType;
      localeStore.setLocale(newLocale);
      localStorage.setItem('user-locale', newLocale);
      updateURL(newLocale, path);
    } catch (error) {
      console.error('Failed to change locale:', error);

      if (newLocale !== LocalesEnum.RU) {
        try {
          await loadLocale(LocalesEnum.RU);
          locale.value = LocalesEnum.RU as LocalesEnumType;
          localeStore.setLocale(LocalesEnum.RU);
        } catch (ruError) {
          console.error('Failed to load fallback RU locale:', ruError);
        }
      }
    } finally {
      isLoading.value = false;
      loadingPromise.value = null;
    }
  };

  const updateURL = async (newLocale: LocalesEnumType, path?: string) => {
    const currentRoute = router.currentRoute.value;
    const currentSection = currentRoute.params.section as string;

    const newPath =
      path || (currentSection ? `/${newLocale}/${currentSection}` : `/${newLocale}`);

    await router.push(newPath);
  };

  // Инициализация локали
  const initLocale = async () => {
    const urlLocale = router.currentRoute.value.params.locale as LocalesEnumType;
    const savedLocale = localStorage.getItem('user-locale') as LocalesEnumType | null;

    const targetLocale = (urlLocale || savedLocale || LocalesEnum.RU) as LocalesEnumType;

    if (!LocalesList.includes(targetLocale)) {
      locale.value = LocalesEnum.RU as LocalesEnumType;
      localeStore.setLocale(LocalesEnum.RU);
      return;
    }

    if (!i18n.global.availableLocales.includes(targetLocale as LocalesEnumType)) {
      try {
        await loadLocale(targetLocale);
      } catch (error) {
        console.error(`Failed to load initial locale ${targetLocale}:`, error);
        try {
          await loadLocale(LocalesEnum.RU);
          locale.value = LocalesEnum.RU as LocalesEnumType;
          localeStore.setLocale(LocalesEnum.RU);
        } catch (ruError) {
          console.error('Failed to load RU locale:', ruError);
        }
        return;
      }
    }

    locale.value = targetLocale as LocalesEnumType;
    localeStore.setLocale(targetLocale);

    // Синхронизируем URL если нужно
    if (!urlLocale && router.currentRoute.value.name === 'home') {
      await router.replace(`/${targetLocale}`);
    }
  };

  return {
    t,
    tm,
    locale: locale as ComputedRef<LocalesEnumType>,
    availableLocales,
    changeLocale,
    initLocale,
    isLoading: readonly(isLoading),
  };
};
