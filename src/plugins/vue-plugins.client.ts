import type { NuxtApp } from 'nuxt/app';
import { defineNuxtPlugin } from 'nuxt/app';
import MasonryWall from '@yeger/vue-masonry-wall';
import { VueGradientPlugin } from 'css-magic-gradient';
import { ResponsivePlugin } from 'responsive-media';

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  nuxtApp.vueApp.use(ResponsivePlugin).use(VueGradientPlugin).use(MasonryWall);
});
