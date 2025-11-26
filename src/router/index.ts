// router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import { i18n } from '@/locales'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:locale?',
      name: 'home',
      component: () => import('@/App.vue'),
      beforeEnter: to => {
        const supportedLocales = ['ru', 'en', 'de', 'zh']
        const locale = (to.params.locale as string) || 'ru'

        // Если локаль не поддерживается, редиректим на русскую
        if (!supportedLocales.includes(locale)) {
          return '/ru'
        }

        // Устанавливаем локаль
        i18n.global.locale.value = locale as 'ru' | 'en' | 'de' | 'zh'
        localStorage.setItem('user-locale', locale)
      },
    },
  ],
})

// Глобальный хук для обработки смены локали
router.beforeEach(to => {
  const supportedLocales = ['ru', 'en', 'de', 'zh']
  const toLocale = to.params.locale as string

  // Если в пути нет локали, добавляем текущую
  if (!toLocale && to.name === 'home') {
    const currentLocale = i18n.global.locale.value
    return `/${currentLocale}`
  }

  // Если локаль не поддерживается, редиректим на русскую
  if (toLocale && !supportedLocales.includes(toLocale)) {
    return '/ru'
  }
})

export default router
