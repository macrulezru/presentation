import MasonryWall from '@yeger/vue-masonry-wall';
import { VueGradientPlugin } from 'css-magic-gradient';

export default defineNuxtPlugin(nuxtApp => {
  // Клиент-специфичные плагины/функциональность
  nuxtApp.vueApp.use(VueGradientPlugin);
  nuxtApp.vueApp.use(MasonryWall);
});

