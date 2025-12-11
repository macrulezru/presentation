import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import svgo from 'vite-plugin-svgo'

// https://vite.dev/config/
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
    // Плагин для оптимизации SVG
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
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
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
  },
})
