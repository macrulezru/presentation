import type { RouterConfig } from '@nuxt/schema';
import MainPage from '~/view/pages/index.vue';
import { LocalesEnum } from '@/enums/locales.enum';

// Локаль в path (/ru, /en) — для SSR и генерации по локалям. Разделы — в hash (#section, #features--id).
export default {
  // Скролл к якорю только при смене path (открытие страницы, переход) — не при обновлении hash от скролла
  scrollBehavior(to, from) {
    if (to.hash && (!from || from.path !== to.path)) {
      return { el: to.hash, behavior: 'auto' as const };
    }
    return undefined;
  },
  routes: () => [
    { path: '/', redirect: `/${LocalesEnum.RU}/` },
    {
      path: '/:locale/',
      name: 'locale',
      component: MainPage,
    },
  ],
} satisfies RouterConfig;
