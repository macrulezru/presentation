import { fileURLToPath, URL } from 'node:url';

import { mergeConfig } from 'vite';

import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public', { from: './public', to: '/' }],
  viteFinal: async baseConfig => {
    baseConfig.plugins = (baseConfig.plugins || []).filter(
      plugin =>
        plugin?.name !== 'vite-plugin-vue-devtools' &&
        plugin?.name !== 'vite-plugin-inspect' &&
        plugin?.name !== 'vite-plugin-vue-inspect',
    );

    return mergeConfig(baseConfig, {
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('../src', import.meta.url)),
          '@assets': fileURLToPath(new URL('../src/view/assets', import.meta.url)),
          'vue-i18n': fileURLToPath(new URL('../node_modules/vue-i18n', import.meta.url)),
        },
        dedupe: ['vue', 'vue-i18n', 'vue-router', 'pinia'],
      },
      optimizeDeps: {
        include: ['vue', 'vue-i18n', 'vue-router', 'pinia'],
      },
      ssr: {
        noExternal: ['vue-i18n'],
      },
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `
              @use "@/view/styles/mixins/layout.scss" as *;
              @use "@/view/styles/mixins/media.scss" as *;
              @use "@/view/styles/mixins/element.scss" as *;
            `,
          },
        },
      },
    });
  },
};

export default config;
