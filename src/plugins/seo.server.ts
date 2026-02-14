import { defineNuxtPlugin, useRequestURL } from 'nuxt/app';

import { LocalesList, LocalesEnum, type LocalesEnumType } from '@/enums/locales.enum';
import { loadLocale } from '@/locales';
import { useSeoHead } from '@/view/composables/use-seo-head';

export default defineNuxtPlugin(async () => {
  // Ensure the correct locale is loaded on the server before generating head
  const url = useRequestURL();
  const segment = url.pathname.split('/').filter(Boolean)[0] || '';
  const initialLocale: LocalesEnumType = LocalesList.includes(segment as LocalesEnumType)
    ? (segment as LocalesEnumType)
    : LocalesEnum.RU;

  await loadLocale(initialLocale);

  // Now generate SEO head with translations available
  useSeoHead();
});
