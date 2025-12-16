// router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import { i18n, loadLocale } from '@/locales'
import { PageSectionsEnum, type PageSectionsType } from '@/enums/page-sections.enum'
import { LocalesList, LocalesEnum, type LocalesEnumType } from '@/enums/locales.enum'

const routes = [
  {
    path: '/:locale?',
    name: 'home',
    component: () => import('@/view/pages/index.vue'),
  },
  {
    path: '/:locale/:section',
    name: 'section',
    component: () => import('@/view/pages/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

const isStaticFile = (path: string): boolean => {
  const staticPatterns = [
    /^\/assets\//,
    /^\/src\//,
    /\.(png|jpe?g|gif|svg|webp|ico|css|js|woff2?|ttf|eot)$/i,
  ]
  return staticPatterns.some(pattern => pattern.test(path))
}

const isSupportedSection = (section: string): section is PageSectionsType => {
  return Object.values(PageSectionsEnum).includes(section as PageSectionsEnum)
}

router.beforeEach(async to => {
  const path = to.path

  if (isStaticFile(path)) {
    return true
  }

  const toLocale = to.params.locale as string
  const toSection = to.params.section as string

  if (!toLocale) {
    const savedLocale = localStorage.getItem('user-locale') || LocalesEnum.RU
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

  if (!LocalesList.includes(toLocale as LocalesEnumType)) {
    // Устанавливаем русскую локаль
    i18n.global.locale.value = LocalesEnum.RU
    localStorage.setItem('user-locale', LocalesEnum.RU)

    if (toSection && isSupportedSection(toSection)) {
      return `/${LocalesEnum.RU}/${toSection}`
    }
    return `/${LocalesEnum.RU}`
  }

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

  if (toSection && !isSupportedSection(toSection)) {
    return `/${toLocale}`
  }

  return true
})

export default router
