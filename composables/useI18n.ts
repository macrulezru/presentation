import { useT, useLocale } from 'vue-i18n-kit';
import { useI18n as useVueI18n } from 'vue-i18n';

import type { LocalesEnumType } from '@/enums/locales.enum';

export function useI18n() {
  const { t } = useT();
  const { locale, setLocale, isLoading } = useLocale();
  // vue-i18n's tm() retrieves raw message values (objects/arrays), which several
  // components rely on. vue-i18n-kit installs vue-i18n internally, so this works.
  const { tm } = useVueI18n();

  const changeLocale = async (newLocale: LocalesEnumType, path?: string) => {
    const cookie = useCookie<string>('user-locale', { sameSite: 'lax', path: '/' });
    cookie.value = newLocale;
    await setLocale(newLocale);
    if (path) {
      await navigateTo(path);
    }
  };

  return { t, tm, locale, changeLocale, isLoading };
}
