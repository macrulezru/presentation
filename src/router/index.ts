import { createRouter, createWebHashHistory } from 'vue-router'
import { i18n } from '@/locales'
import { PageSectionsEnum, type PageSectionsType } from '@/enums/page-sections.enum'
import { LocalesList, type LocalesEnumType } from '@/enums/locales.enum'

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
  const supportedLocales = LocalesList
  const supportedSections = [
    PageSectionsEnum.SPLASH,
    PageSectionsEnum.ABOUT,
    PageSectionsEnum.EXPERIENCE,
    PageSectionsEnum.TRAVELSHOP,
    PageSectionsEnum.FEATURES,
    PageSectionsEnum.REMOTE_WORKPLACE,
    PageSectionsEnum.CONTACTS,
  ]

  const toLocale = to.params.locale as string
  const toSection = to.params.section as string

  // Если нет локали, используем сохраненную или русскую по умолчанию
  if (!toLocale) {
    const savedLocale = localStorage.getItem('user-locale') || 'ru'
    return `/${savedLocale}`
  }

  // Если локаль не поддерживается, редиректим на русскую
  if (!supportedLocales.includes(toLocale as LocalesEnumType)) {
    const fallbackSection =
      toSection && supportedSections.includes(toSection as PageSectionsType)
        ? `/${toSection}`
        : ''
    return `/ru${fallbackSection}`
  }

  // Если секция указана но не поддерживается, убираем ее
  if (toSection && !supportedSections.includes(toSection as PageSectionsType)) {
    return `/${toLocale}`
  }

  // Устанавливаем локаль
  // @ts-ignore - игнорируем ошибку типов Vue I18n
  i18n.global.locale.value = toLocale
  localStorage.setItem('user-locale', toLocale)
})

export default router
