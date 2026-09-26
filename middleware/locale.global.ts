const SUPPORTED_LOCALES = new Set(['ru', 'en', 'kz', 'de', 'zh']);
const DEFAULT_LOCALE = 'ru';

export default defineNuxtRouteMiddleware(to => {
  // Разрешаем служебные страницы/эндпоинты
  if (to.path.startsWith('/api/')) return;
  if (to.path.startsWith('/_nuxt/')) return;

  const cookie = useCookie<string>('user-locale', {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  const localeParam = (to.params.locale as string | undefined) || undefined;

  // "/" — восстанавливаем локаль из cookie (кроме дефолтной ru)
  if (!localeParam) {
    const saved = (cookie.value || '').toLowerCase();
    if (saved && saved !== DEFAULT_LOCALE && SUPPORTED_LOCALES.has(saved)) {
      return navigateTo(`/${saved}`, { redirectCode: 302, replace: true });
    }
    return;
  }

  const normalized = localeParam.toLowerCase();

  // Неизвестная локаль → на корень (там отрендерится ru)
  if (!SUPPORTED_LOCALES.has(normalized)) {
    return navigateTo('/', { redirectCode: 302, replace: true });
  }

  // Нормализуем регистр в URL
  if (normalized !== localeParam) {
    return navigateTo(`/${normalized}`, { redirectCode: 301 });
  }

  // Синхронизируем cookie с URL, чтобы "/" вёл обратно в ту же локаль
  cookie.value = normalized;
});
