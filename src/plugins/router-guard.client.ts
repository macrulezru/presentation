import type { RouteLocationNormalized } from 'vue-router';
import { defineNuxtPlugin, useRouter } from 'nuxt/app';
import { LocalesList, LocalesEnum, type LocalesEnumType } from '@/enums/locales.enum';
import { i18n, loadLocale } from '@/locales';

const isStaticFile = (path: string): boolean => {
  const staticPatterns = [
    /^\/assets\//,
    /^\/src\//,
    /\.(png|jpe?g|gif|svg|webp|ico|css|js|woff2?|ttf|eot)$/i,
  ];
  return staticPatterns.some(pattern => pattern.test(path));
};

export default defineNuxtPlugin(() => {
  const router = useRouter();

  router.beforeEach(async (to: RouteLocationNormalized) => {
    const { path } = to;

    if (isStaticFile(path)) {
      return true;
    }

    const toLocale = to.params.locale as string;

    if (!toLocale) {
      const savedLocale = localStorage.getItem('user-locale') || LocalesEnum.RU;
      return { path: `/${savedLocale}/`, hash: to.hash || '' };
    }

    if (!LocalesList.includes(toLocale as LocalesEnumType)) {
      i18n.global.locale.value = LocalesEnum.RU;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('user-locale', LocalesEnum.RU);
      }
      return { path: `/${LocalesEnum.RU}/`, hash: to.hash || '' };
    }

    try {
      await loadLocale(toLocale as LocalesEnumType);
      i18n.global.locale.value = toLocale;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('user-locale', toLocale);
      }
    } catch (error) {
      console.error(`Failed to load locale ${toLocale}:`, error);
      i18n.global.locale.value = LocalesEnum.RU;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('user-locale', LocalesEnum.RU);
      }
      return { path: `/${LocalesEnum.RU}/`, hash: to.hash || '' };
    }

    return true;
  });
});
