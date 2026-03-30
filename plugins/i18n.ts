import { createVueI18nPlugin } from 'vue-i18n-kit';

import { LocalesList } from '@/enums/locales.enum';

export default defineNuxtPlugin(async nuxtApp => {
  const route = useRoute();
  const cookie = useCookie<string>('user-locale', { sameSite: 'lax', path: '/' });

  const localeFromRoute = String(route.params.locale || '');
  const initialLocale = (LocalesList as string[]).includes(localeFromRoute)
    ? localeFromRoute
    : (LocalesList as string[]).includes(cookie.value)
      ? cookie.value
      : 'ru';

  // Предзагружаем начальную локаль синхронно для корректного SSR-рендеринга.
  // Остальные локали используют lazy loaders и загружаются по требованию.
  const loaderMap: Record<string, () => Promise<unknown>> = {
    ru: () => import('../src/locales/ru.json'),
    en: () => import('../src/locales/en.json'),
    kz: () => import('../src/locales/kz.json'),
    de: () => import('../src/locales/de.json'),
    zh: () => import('../src/locales/zh.json'),
  };
  const raw = await (loaderMap[initialLocale] ?? loaderMap['ru']!)();
  const preloadedMessages = (raw as { default?: unknown }).default ?? raw;

  nuxtApp.vueApp.use(
    createVueI18nPlugin({
      defaultLocale: initialLocale,
      fallbackLocale: 'ru',
      persistLocale: false,
      locales: {
        // Ternary нужен, чтобы auto-config видел import() в исходнике для сканирования,
        // а начальная локаль при этом передавалась как уже загруженный объект (без async).
        ru: { messages: initialLocale === 'ru' ? (preloadedMessages as object) : () => import('../src/locales/ru.json'), meta: { display: 'Русский' } },
        en: { messages: initialLocale === 'en' ? (preloadedMessages as object) : () => import('../src/locales/en.json'), meta: { display: 'English' } },
        kz: { messages: initialLocale === 'kz' ? (preloadedMessages as object) : () => import('../src/locales/kz.json'), meta: { display: 'Қазақша' } },
        de: { messages: initialLocale === 'de' ? (preloadedMessages as object) : () => import('../src/locales/de.json'), meta: { display: 'Deutsch' } },
        zh: { messages: initialLocale === 'zh' ? (preloadedMessages as object) : () => import('../src/locales/zh.json'), meta: { display: '中文' } },
      },
    }),
  );
});
