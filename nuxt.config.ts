// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-02-14',
  devtools: { enabled: true },

  ssr: true,

  srcDir: 'src',

  alias: {
    '@assets': './src/view/assets',
  },

  css: [
    '~/view/styles/reset.scss',
    '~/view/styles/variables.scss',
    '~/view/styles/main.scss',
  ],

  postcss: {
    plugins: {
      'postcss-import': {},
      'postcss-combine-duplicated-selectors': { removeDuplicatedProperties: true },
      'postcss-combine-media-query': {},
      autoprefixer: {},
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/view/styles/mixins/layout.scss" as *;
            @use "~/view/styles/mixins/media.scss" as *;
            @use "~/view/styles/mixins/element.scss" as *;
          `,
        },
      },
    },
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    },
  },

  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  experimental: {
    // Prevent inlining component CSS into the HTML during SSR.
    // This produces external CSS files that are linked instead.
    inlineSSRStyles: false,
  },

  modules: ['@pinia/nuxt'],

  runtimeConfig: {
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'https://macrulez.ru',
    },
  },
});
