import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import svgo from 'vite-plugin-svgo'

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
    vueDevTools(),
    AutoImport({
      imports: [
        'vue',
        {
          '@/view/composables/use-i18n': ['useI18n'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
    svgo({
      multipass: true,
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
              cleanupIds: {
                remove: false,
                minify: true,
              },
              removeTitle: false,
            },
          },
        },
        'removeDimensions',
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/view/styles/mixins/layout.scss" as *;
          @use "@/view/styles/mixins/media.scss" as *;
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('locales') && /\.json$/.test(id)) {
            const localeCode = id.match(/(ru|en|kz|de|zh)\.json$/i)?.[1]?.toLowerCase()
            if (localeCode) {
              return `locale-${localeCode}`
            }
          }
        },
        assetFileNames: assetInfo => {
          if (assetInfo.name && /\.(svg)$/.test(assetInfo.name)) {
            return 'assets/images/icons/[name]-[hash][extname]'
          }
          if (assetInfo.name && /\.(jpg|png)$/.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    target: 'esnext',
    minify: 'esbuild',
    assetsInlineLimit: 0,
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  server: {
    port: 3000,
    open: true,

    hmr: {
      overlay: true,
    },
  },
})
