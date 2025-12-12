import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNavigationStore } from '@/stores/use-navigation-store.ts'
import { PageSectionsEnum } from '@/enums/page-sections.enum'
import { useResponsive } from '@/view/composables/use-responsive'

const SCROLL_DEBOUNCE_TIME = 10
const SCROLL_ANIMATION_DURATION = 800
const HEADER_HEIGHT = 60
const HEADER_MOBILE_HEIGHT = 50
const SPLASH_SCROLL_THRESHOLD = 100

export function useScrollRouting() {
  const router = useRouter()
  const route = useRoute()
  const navigationStore = useNavigationStore()

  const { isTablet } = useResponsive()

  const scrollTimeout = ref<NodeJS.Timeout | null>(null)

  const sectionNames = Object.values(PageSectionsEnum)

  const headerHeight = computed(() => {
    return isTablet.value ? HEADER_MOBILE_HEIGHT : HEADER_HEIGHT
  })

  // Вспомогательная функция для проверки splash секции
  const isSplashSection = (sectionName: string): boolean =>
    sectionName === PageSectionsEnum.SPLASH

  // Инициализация секций
  const initSections = () => {
    const sections = sectionNames
      .map(sectionName => {
        const element = document.getElementById(sectionName)
        return element ? { id: sectionName, name: sectionName, element } : null
      })
      .filter((section): section is NonNullable<typeof section> => section !== null)

    navigationStore.setSections(sections)
  }

  // Получение текущей активной секции
  const getCurrentSection = (): string => {
    // Если прокрутка в самом верху - это splash секция
    if (window.pageYOffset < SPLASH_SCROLL_THRESHOLD) {
      return PageSectionsEnum.SPLASH
    }

    const { pageYOffset, innerHeight } = window
    const scrollPosition = pageYOffset + innerHeight / 4

    for (const section of navigationStore.sections) {
      if (section.element) {
        const elementTop = section.element.offsetTop - headerHeight.value
        const elementBottom = elementTop + section.element.offsetHeight

        if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
          return section.name
        }
      }
    }

    return PageSectionsEnum.SPLASH
  }

  // Обновление URL при скролле
  const updateUrl = (sectionName: string) => {
    if (sectionName !== navigationStore.currentSection && !navigationStore.isScrolling) {
      navigationStore.setCurrentSection(sectionName)
      const currentLocale = (route.params.locale as string) || 'ru'

      // Для секции splash используем корневой URL, для остальных - с секцией
      const newPath = isSplashSection(sectionName)
        ? `/${currentLocale}`
        : `/${currentLocale}/${sectionName}`

      // Обновляем URL без триггера навигации
      window.history.replaceState({}, '', `/#${newPath}`)
    }
  }

  // Дебаунс обработчика скролла
  const debouncedScrollHandler = () => {
    if (navigationStore.isScrolling) return

    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }

    scrollTimeout.value = setTimeout(() => {
      const section = getCurrentSection()
      updateUrl(section)
    }, SCROLL_DEBOUNCE_TIME)
  }

  // Прокрутка к секции
  const scrollToSection = (sectionName: string) => {
    const section = navigationStore.getSectionById(sectionName)
    if (section?.element) {
      navigationStore.setIsScrolling(true)

      const elementPosition = section.element.offsetTop
      const offsetPosition = elementPosition - headerHeight.value

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      // Сбрасываем флаг после завершения анимации
      setTimeout(() => {
        navigationStore.setIsScrolling(false)
      }, SCROLL_ANIMATION_DURATION)
    }
  }

  // Навигация к секции
  const navigateToSection = (sectionName: string) => {
    const currentLocale = (route.params.locale as string) || 'ru'
    const path = isSplashSection(sectionName)
      ? `/${currentLocale}`
      : `/${currentLocale}/${sectionName}`

    router.push(path)
    scrollToSection(sectionName)
  }

  // Получить текущую активную секцию
  const getActiveSection = () => {
    return navigationStore.currentSection
  }

  // Следим за изменениями маршрута для обновления активного пункта
  watch(
    () => route.params.section,
    (newSection, oldSection) => {
      // Обновляем currentSection при изменении секции
      if (newSection !== oldSection) {
        const sectionName = (newSection as string) || PageSectionsEnum.SPLASH
        navigationStore.setCurrentSection(sectionName)

        setTimeout(() => {
          scrollToSection(sectionName)
        }, SPLASH_SCROLL_THRESHOLD)
      }
    },
    { immediate: true },
  )

  // Инициализация
  const init = () => {
    initSections()
    window.addEventListener('scroll', debouncedScrollHandler, { passive: true })

    // Инициализируем текущую секцию из URL
    const initialSection = (route.params.section as string) || PageSectionsEnum.SPLASH
    navigationStore.setCurrentSection(initialSection)
  }

  // Очистка
  const destroy = () => {
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
      scrollTimeout.value = null
    }
    window.removeEventListener('scroll', debouncedScrollHandler)
  }

  return {
    sections: navigationStore.sections,
    currentSection: navigationStore.currentSection,
    scrollToSection,
    navigateToSection,
    getCurrentSection,
    getActiveSection,
    init,
    destroy,
  }
}
