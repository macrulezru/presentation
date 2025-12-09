import { createRouter, createWebHashHistory } from 'vue-router'
import { i18n } from '@/locales'
import { PageSectionsEnum, type PageSectionsType } from '@/enums/page-sections.enum'
import { LocalesList, LocalesEnum, type LocalesEnumType } from '@/enums/locales.enum'

const routes = [
  {
    path: '/:locale?',
    name: 'home',
    component: () => import('@/view/pages/App.vue'),
  },
  {
    path: '/:locale/:section',
    name: 'section',
    component: () => import('@/view/pages/App.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

// Проверка на валидность секции
const isSupportedSection = (section: string): section is PageSectionsType => {
  return Object.values(PageSectionsEnum).includes(section as PageSectionsEnum)
}

// Глобальный хук для обработки навигации
router.beforeEach(to => {
  const toLocale = to.params.locale as string
  const toSection = to.params.section as string

  // Устанавливаем локаль в любом случае
  const setLocale = (locale: string) => {
    i18n.global.locale.value = locale
    localStorage.setItem('user-locale', locale)
  }

  // Если нет локали, используем сохраненную или русскую по умолчанию
  if (!toLocale) {
    const savedLocale = localStorage.getItem('user-locale') || LocalesEnum.RU
    setLocale(savedLocale)
    return `/${savedLocale}`
  }

  // Если локаль не поддерживается, редиректим на русскую
  if (!LocalesList.includes(toLocale as LocalesEnumType)) {
    setLocale(LocalesEnum.RU)

    if (toSection && isSupportedSection(toSection)) {
      return `/${LocalesEnum.RU}/${toSection}`
    }
    return `/${LocalesEnum.RU}`
  }

  // Если секция указана но не поддерживается, убираем ее
  if (toSection && !isSupportedSection(toSection)) {
    setLocale(toLocale)
    return `/${toLocale}`
  }

  // Устанавливаем локаль для валидных маршрутов
  setLocale(toLocale)

  // Если все параметры валидны, продолжаем навигацию
  return true
})

export default router
