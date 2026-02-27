const SUPPORTED_LOCALES = new Set(['ru', 'en', 'kz', 'de', 'zh']);

export default defineNuxtRouteMiddleware(to => {
  // Разрешаем служебные страницы/эндпоинты
  if (to.path.startsWith('/api/')) return;
  if (to.path.startsWith('/_nuxt/')) return;

  const localeParam = (to.params.locale as string | undefined) || undefined;

  // "/" обработает index.vue (редирект на локаль)
  if (!localeParam) return;

  const normalized = localeParam.toLowerCase();
  if (!SUPPORTED_LOCALES.has(normalized)) {
    return navigateTo('/ru', { redirectCode: 302 });
  }

  // Нормализуем регистр в URL
  if (normalized !== localeParam) {
    return navigateTo(`/${normalized}`, { redirectCode: 301 });
  }

  // Сохраняем выбранную локаль (SSR-safe)
  const cookie = useCookie<string>('user-locale', { sameSite: 'lax', path: '/' });
  cookie.value = normalized;
});

