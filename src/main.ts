import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/view/styles/reset.css'
import '@/view/styles/variables.css'
import '@/view/styles/main.css'

import App from '@/view/pages/App.vue'
import router from '@/router'
import i18nPlugin from '@/plugins/i18n'
import { loadLocale, getInitialLocale } from '@/locales'
import { LocalesEnum } from '@/enums/locales.enum'

// Асинхронная функция для инициализации приложения
async function initializeApp() {
  const initialLocale = getInitialLocale()

  // Загружаем локаль
  try {
    await loadLocale(initialLocale)
  } catch (error) {
    console.error(`Failed to load locale ${initialLocale}:`, error)

    await loadLocale(LocalesEnum.RU)
  }

  const app = createApp(App)

  app.use(createPinia()).use(router).use(i18nPlugin)

  app.mount('#app')
}

initializeApp().catch(error => {
  console.error('Failed to initialize app:', error)
})
