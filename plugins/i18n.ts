import i18nPlugin from '@/plugins/i18n';
import { i18n, loadLocale } from '@/locales';

const SUPPORTED_LOCALES = new Set(['ru', 'en', 'kz', 'de', 'zh']);

export default defineNuxtPlugin(async nuxtApp => {
  nuxtApp.vueApp.use(i18nPlugin as any);

  const route = useRoute();
  const cookie = useCookie<string>('user-locale', { sameSite: 'lax', path: '/' });

  const paramLocale = typeof route.params.locale === 'string' ? route.params.locale : undefined;
  const candidate = (paramLocale || cookie.value || 'ru').toLowerCase();
  const target = SUPPORTED_LOCALES.has(candidate) ? candidate : 'ru';

  try {
    await loadLocale(target as any);
  } catch {
    await loadLocale('ru' as any);
  }

  i18n.global.locale.value = (target === 'ru' ? 'ru' : target) as any;
});

