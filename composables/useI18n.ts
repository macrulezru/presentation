import { ref, readonly, type ComputedRef } from 'vue';
import { useRouter } from 'vue-router';

import { LocalesEnum, LocalesList, type LocalesEnumType } from '@/enums/locales.enum';
import { i18n, loadLocale } from '@/locales';
import { useLocaleStore } from '@/stores/use-locale-store';

const LOCALE_COOKIE_NAME = 'user-locale';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 год

export const useI18n = () => {
  const { t, locale, availableLocales } = i18n.global;
  const tm = i18n.global.tm as (key: string) => unknown;
  const router = useRouter();
  const localeStore = useLocaleStore();
  const isLoading = ref(false);

  // Cookie — источник истины для SSR-редиректа на "/" (см. middleware/locale.global.ts)
  const localeCookie = useCookie<string>(LOCALE_COOKIE_NAME, {
    sameSite: 'lax',
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });

  // Храним промис текущей загрузки для защиты от гонок
  const loadingPromise = ref<Promise<void> | null>(null);

  /**
   * Синхронизация выбранной локали во всех хранилищах.
   * ВАЖНО: вызывать ДО router.push, иначе middleware на "/" прочитает
   * старую cookie и отправит пользователя обратно.
   */
  const persist = (value: LocalesEnumType) => {
    localeCookie.value = value;
    // localStorage оставлен как дубль для обратной совместимости.
    // Если нигде больше не читается — можно удалить.
    if (import.meta.client) {
      try {
        localStorage.setItem(LOCALE_COOKIE_NAME, value);
      } catch {
        // localStorage может быть недоступен (private mode, отключён)
      }
    }
  };

  const updateURL = async (newLocale: LocalesEnumType, path?: string) => {
    const targetPath = path ?? (newLocale === LocalesEnum.RU ? '/' : `/${newLocale}`);
    await router.push(targetPath);
  };

  const changeLocale = async (newLocale: LocalesEnumType, path?: string) => {
    if (!LocalesList.includes(newLocale)) {
      console.warn(`Locale ${newLocale} is not supported`);
      return;
    }

    // Если уже загружается — ждём завершения
    if (loadingPromise.value) {
      await loadingPromise.value;
    }

    // Локаль уже загружена — просто переключаемся
    if (i18n.global.availableLocales.includes(newLocale as LocalesEnumType)) {
      locale.value = newLocale as LocalesEnumType;
      localeStore.setLocale(newLocale);
      persist(newLocale);
      await updateURL(newLocale, path);
      return;
    }

    isLoading.value = true;
    try {
      loadingPromise.value = loadLocale(newLocale);
      await loadingPromise.value;

      locale.value = newLocale as LocalesEnumType;
      localeStore.setLocale(newLocale);
      persist(newLocale);
      await updateURL(newLocale, path);
    } catch (error) {
      console.error('Failed to change locale:', error);

      // Фолбэк на RU — обязательно синхронизируем cookie,
      // иначе middleware и UI разъедутся.
      if (newLocale !== LocalesEnum.RU) {
        try {
          await loadLocale(LocalesEnum.RU);
          locale.value = LocalesEnum.RU as LocalesEnumType;
          localeStore.setLocale(LocalesEnum.RU);
          persist(LocalesEnum.RU);
        } catch (ruError) {
          console.error('Failed to load fallback RU locale:', ruError);
        }
      }
    } finally {
      isLoading.value = false;
      loadingPromise.value = null;
    }
  };

  /**
   * Инициализация локали при монтировании.
   * URL без локали = дефолт RU. Cookie-логику разруливает middleware
   * до рендера, здесь её читать не нужно.
   */
  const initLocale = async () => {
    const urlLocale = router.currentRoute.value.params.locale as
      | LocalesEnumType
      | undefined;

    const targetLocale = (urlLocale || LocalesEnum.RU) as LocalesEnumType;

    if (!LocalesList.includes(targetLocale)) {
      locale.value = LocalesEnum.RU;
      localeStore.setLocale(LocalesEnum.RU);
      persist(LocalesEnum.RU);
      return;
    }

    if (!i18n.global.availableLocales.includes(targetLocale)) {
      try {
        await loadLocale(targetLocale);
      } catch (error) {
        console.error(`Failed to load initial locale ${targetLocale}:`, error);
        try {
          await loadLocale(LocalesEnum.RU);
        } catch (ruError) {
          console.error('Failed to load RU locale:', ruError);
        }
        locale.value = LocalesEnum.RU;
        localeStore.setLocale(LocalesEnum.RU);
        persist(LocalesEnum.RU);
        return;
      }
    }

    locale.value = targetLocale;
    localeStore.setLocale(targetLocale);
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
