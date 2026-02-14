import { type ComputedRef } from 'vue';
import { useRouter } from 'vue-router';

import { LocalesEnum, LocalesList, type LocalesEnumType } from '@/enums/locales.enum';
import { i18n, loadLocale } from '@/locales';
import { useLocaleStore } from '@/stores/use-locale-store';

export const useI18n = () => {
  const { t, locale, availableLocales } = i18n.global;
  const tm = i18n.global.tm as (key: string) => unknown;
  const router = useRouter();
  const localeStore = useLocaleStore();

  /** Редирект на URL нужной локали с сохранением хеша (полная перезагрузка страницы) */
  const redirectToLocale = (newLocale: LocalesEnumType) => {
    if (!LocalesList.includes(newLocale)) {
      console.warn(`Locale ${newLocale} is not supported`);
      return;
    }
    if (import.meta.client) {
      const hash = window.location.hash || '';
      window.location.href = `/${newLocale}/` + hash;
    }
  };

  // Инициализация локали (SSR-safe: localStorage только на клиенте)
  const initLocale = async () => {
    const urlLocale = router.currentRoute.value.params.locale as LocalesEnumType;
    const savedLocale =
      typeof localStorage !== 'undefined' ? (localStorage.getItem('user-locale') as LocalesEnumType | null) : null;

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

    // Синхронизируем URL если нужно (например редирект с / на /ru)
    const currentRoute = router.currentRoute.value;
    if (!urlLocale && currentRoute.name === 'locale') {
      await router.replace({ path: `/${targetLocale}/`, hash: currentRoute.hash || '' });
    }
  };

  return {
    t,
    tm,
    locale: locale as ComputedRef<LocalesEnumType>,
    availableLocales,
    redirectToLocale,
    initLocale,
  };
};
