import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/view/styles/reset.css'
import '@/view/styles/variables.css'
import '@/view/styles/main.css'

import App from '@/view/pages/App.vue'
import router from '@/router'
import i18nPlugin from '@/plugins/i18n'
import { loadLocale } from '@/locales'
import { LocalesEnum, LocalesList, type LocalesEnumType } from '@/enums/locales.enum'

// Функция для определения начальной локали
function getInitialLocale(): LocalesEnumType {
  const hash = window.location.hash

  if (hash) {
    const pathWithoutHash = hash.slice(1)
    const segments = pathWithoutHash.split('/').filter(Boolean)

    const [firstSegment] = segments

    if (firstSegment) {
      const possibleLocale = firstSegment.toUpperCase() as LocalesEnumType
      if (LocalesList.includes(possibleLocale)) {
        return possibleLocale
      }
    }
  }

  const savedLocale = localStorage.getItem('user-locale') as LocalesEnumType | null
  if (savedLocale && LocalesList.includes(savedLocale)) {
    return savedLocale
  }

  return LocalesEnum.RU
}

// Асинхронная функция для инициализации приложения
async function initializeApp() {
  const initialLocale = getInitialLocale()

  // Загружаем только нужную локаль
  if (initialLocale !== LocalesEnum.RU) {
    try {
      await loadLocale(initialLocale)
    } catch (error) {
      console.error(`Failed to load locale ${initialLocale}:`, error)

      await loadLocale(LocalesEnum.RU)
    }
  } else {
    await loadLocale(LocalesEnum.RU)
  }

  const app = createApp(App)

  app.use(createPinia()).use(router).use(i18nPlugin)

  app.mount('#app')
}

initializeApp().catch(error => {
  console.error('Failed to initialize app:', error)
})
