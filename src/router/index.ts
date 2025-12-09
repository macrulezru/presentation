import { createRouter, createWebHashHistory } from 'vue-router'
import { i18n, loadLocale } from '@/locales' // Импортируем loadLocale
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
router.beforeEach(async to => {
  const toLocale = to.params.locale as string
  const toSection = to.params.section as string

  // Если нет локали, используем сохраненную или русскую по умолчанию
  if (!toLocale) {
    const savedLocale = localStorage.getItem('user-locale') || LocalesEnum.RU
    // Загружаем локаль перед редиректом
    if (savedLocale !== LocalesEnum.RU) {
      try {
        await loadLocale(savedLocale as LocalesEnumType)
      } catch (error) {
        console.error(`Failed to load locale ${savedLocale}:`, error)
        // Fallback на русский
        localStorage.setItem('user-locale', LocalesEnum.RU)
        return `/${LocalesEnum.RU}`
      }
    }
    return `/${savedLocale}`
  }

  // Если локаль не поддерживается, редиректим на русскую
  if (!LocalesList.includes(toLocale as LocalesEnumType)) {
    // Устанавливаем русскую локаль
    i18n.global.locale.value = LocalesEnum.RU
    localStorage.setItem('user-locale', LocalesEnum.RU)

    if (toSection && isSupportedSection(toSection)) {
      return `/${LocalesEnum.RU}/${toSection}`
    }
    return `/${LocalesEnum.RU}`
  }

  // Загружаем локаль из URL перед установкой
  try {
    if (toLocale !== LocalesEnum.RU) {
      await loadLocale(toLocale as LocalesEnumType)
    }
    // Устанавливаем локаль только после успешной загрузки
    i18n.global.locale.value = toLocale
    localStorage.setItem('user-locale', toLocale)
  } catch (error) {
    console.error(`Failed to load locale ${toLocale}:`, error)
    i18n.global.locale.value = LocalesEnum.RU
    localStorage.setItem('user-locale', LocalesEnum.RU)
    return `/${LocalesEnum.RU}${toSection ? '/' + toSection : ''}`
  }

  // Если секция указана но не поддерживается, убираем ее
  if (toSection && !isSupportedSection(toSection)) {
    return `/${toLocale}`
  }

  // Если все параметры валидны, продолжаем навигацию
  return true
})

export default router
