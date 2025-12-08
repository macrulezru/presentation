import { createRouter, createWebHashHistory } from 'vue-router'
import { i18n } from '@/locales'
import { pageSectionsEnum, type pageSectionsType } from '@/enums/page-sections'

const routes = [
  {
    path: '/:locale?',
    name: 'home',
    component: () => import('@/App.vue'),
  },
  {
    path: '/:locale/:section',
    name: 'section',
    component: () => import('@/App.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

// Глобальный хук для обработки навигации
router.beforeEach(to => {
  const supportedLocales = ['ru', 'en', 'de', 'zh']
  const supportedSections = [
    pageSectionsEnum.SPLASH,
    pageSectionsEnum.ABOUT,
    pageSectionsEnum.EXPERIENCE,
    pageSectionsEnum.TRAVELSHOP,
    pageSectionsEnum.FEATURES,
    pageSectionsEnum.REMOTE_WORKPLACE,
    pageSectionsEnum.CONTACTS,
  ]

  const toLocale = to.params.locale as string
  const toSection = to.params.section as string

  // Если нет локали, используем сохраненную или русскую по умолчанию
  if (!toLocale) {
    const savedLocale = localStorage.getItem('user-locale') || 'ru'
    return `/${savedLocale}`
  }

  // Если локаль не поддерживается, редиректим на русскую
  if (!supportedLocales.includes(toLocale)) {
    const fallbackSection =
      toSection && supportedSections.includes(toSection as pageSectionsType)
        ? `/${toSection}`
        : ''
    return `/ru${fallbackSection}`
  }

  // Если секция указана но не поддерживается, убираем ее
  if (toSection && !supportedSections.includes(toSection as pageSectionsType)) {
    return `/${toLocale}`
  }

  // Устанавливаем локаль
  // @ts-ignore - игнорируем ошибку типов Vue I18n
  i18n.global.locale.value = toLocale
  localStorage.setItem('user-locale', toLocale)
})

export default router
