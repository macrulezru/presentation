import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';

import { LocalesEnum } from '../src/enums/locales.enum';
import { i18n } from '../src/locales';
import ru from '../src/locales/ru.json';

import type { Preview } from '@storybook/vue3';

import '../src/view/styles/reset.scss';
import '../src/view/styles/variables.scss';
import '../src/view/styles/main.scss';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'centered',
  },
  setup(app) {
    // Предзагружаем русскую локаль для Stories
    i18n.global.setLocaleMessage(LocalesEnum.RU, ru);
    i18n.global.locale.value = LocalesEnum.RU;

    // Подключаем i18n напрямую, чтобы useI18n возвращал t
    app.use(i18n);

    // Минимальный router для composables, которые вызывают useRouter
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:locale?', name: 'home', component: { template: '<div />' } }],
    });
    // Устанавливаем базовый путь, чтобы initLocale не падал
    void router.push(`/${LocalesEnum.RU.toLowerCase()}`);

    // Pinia для стора локали
    const pinia = createPinia();

    app.use(pinia);
    app.use(router);
  },
};

export default preview;
