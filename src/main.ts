import MasonryWall from '@yeger/vue-masonry-wall';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import '@/view/styles/reset.scss';
import '@/view/styles/variables.scss';
import '@/view/styles/main.scss';

import { LocalesEnum } from '@/enums/locales.enum';
import { i18n, loadLocale, getInitialLocale } from '@/locales';
import i18nPlugin from '@/plugins/i18n';
import router from '@/router';
import App from '@/view/pages/index.vue';

// Асинхронная функция для инициализации приложения
async function initializeApp() {
  const initialLocale = getInitialLocale();

  i18n.global.locale.value = initialLocale;

  // Загружаем локаль и ждем завершения
  try {
    await loadLocale(initialLocale);
  } catch (error) {
    console.error(`Failed to load locale ${initialLocale}:`, error);
    // Пытаемся загрузить резервную локаль
    try {
      await loadLocale(LocalesEnum.RU);
      i18n.global.locale.value = LocalesEnum.RU;
    } catch (fallbackError) {
      console.error('Failed to load fallback locale:', fallbackError);
    }
  }

  const app = createApp(App);

  app.use(createPinia()).use(router).use(i18nPlugin).use(MasonryWall);

  // Добавляем обработчик ошибок загрузки переводов
  app.config.errorHandler = (err, _instance, info) => {
    console.error('Vue error:', err, info);
  };

  app.mount('#app');
}

initializeApp().catch(error => {
  console.error('Failed to initialize app:', error);
});
