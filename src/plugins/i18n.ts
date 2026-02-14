import type { NuxtApp } from 'nuxt/app';
import { defineNuxtPlugin, useRequestURL } from 'nuxt/app';
import { LocalesEnum, LocalesList, type LocalesEnumType } from '@/enums/locales.enum';
import { i18n, loadLocale } from '@/locales';
import { useI18n as useI18nComposable } from '@/view/composables/use-i18n';

export default defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
  nuxtApp.vueApp.use(i18n);

  // Локаль из path: /ru, /en — на хосте можно генерировать по локалям
  const url = useRequestURL();
  const segment = url.pathname.split('/').filter(Boolean)[0] || '';
  const initialLocale: LocalesEnumType = LocalesList.includes(segment as LocalesEnumType)
    ? (segment as LocalesEnumType)
    : LocalesEnum.RU;
  await loadLocale(initialLocale);
  i18n.global.locale.value = initialLocale;

  return {
    provide: {
      useI18n: useI18nComposable,
    },
  };
});
