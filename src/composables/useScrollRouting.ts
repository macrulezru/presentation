import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNavigationStore } from '@/stores/navigation'

export function useScrollRouting() {
  const router = useRouter()
  const route = useRoute()
  const navigationStore = useNavigationStore()

  const scrollTimeout = ref<NodeJS.Timeout | null>(null)

  // Определяем секции
  const sectionDefinitions = [
    { id: 'splash', name: 'splash' },
    { id: 'about', name: 'about' },
    { id: 'experience', name: 'experience' },
    { id: 'travelshop', name: 'travelshop' },
    { id: 'features', name: 'features' },
    { id: 'remote-workplace', name: 'remote-workplace' },
    { id: 'contacts', name: 'contacts' },
  ]

  // Инициализация секций
  const initSections = () => {
    const sections = sectionDefinitions
      .map(section => ({
        ...section,
        element: document.getElementById(section.id),
      }))
      .filter(section => section.element !== null)

    navigationStore.setSections(sections)
  }

  // Получение текущей активной секции
  const getCurrentSection = (): string => {
    const scrollPosition = window.pageYOffset + window.innerHeight / 2
    const headerHeight = 60

    // Если прокрутка в самом верху - это splash секция
    if (window.pageYOffset < 100) {
      return 'splash'
    }

    for (const section of navigationStore.sections) {
      if (section.element) {
        const elementTop = section.element.offsetTop - headerHeight
        const elementBottom = elementTop + section.element.offsetHeight

        if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
          return section.name
        }
      }
    }

    return 'splash'
  }

  // Обновление URL при скролле
  const updateUrl = (sectionName: string) => {
    if (sectionName !== navigationStore.currentSection && !navigationStore.isScrolling) {
      navigationStore.setCurrentSection(sectionName)
      const currentLocale = (route.params.locale as string) || 'ru'

      // Для секции splash используем корневой URL, для остальных - с секцией
      const newPath =
        sectionName === 'splash'
          ? `/${currentLocale}`
          : `/${currentLocale}/${sectionName}`

      // Обновляем URL без триггера навигации
      window.history.replaceState({}, '', `/#${newPath}`)
    }
  }

  // Обработчик скролла
  const handleScroll = () => {
    if (navigationStore.isScrolling) return

    // Дебаунс скролла для производительности
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }

    scrollTimeout.value = setTimeout(() => {
      const section = getCurrentSection()
      updateUrl(section)
    }, 100)
  }

  // Прокрутка к секции
  const scrollToSection = (sectionName: string) => {
    const section = navigationStore.getSectionById(sectionName)
    if (section?.element) {
      navigationStore.setIsScrolling(true)

      const headerHeight = 60
      const elementPosition = section.element.offsetTop
      const offsetPosition = elementPosition - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      // Сбрасываем флаг после завершения анимации
      setTimeout(() => {
        navigationStore.setIsScrolling(false)
      }, 800)
    } else if (sectionName === 'splash') {
      // Особый случай для главной страницы - прокрутка наверх
      navigationStore.setIsScrolling(true)

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      setTimeout(() => {
        navigationStore.setIsScrolling(false)
      }, 800)
    }
  }

  // Навигация к секции
  const navigateToSection = (sectionName: string) => {
    const currentLocale = (route.params.locale as string) || 'ru'
    const path =
      sectionName === 'splash' ? `/${currentLocale}` : `/${currentLocale}/${sectionName}`

    router.push(path)
  }

  // Получить текущую активную секцию
  const getActiveSection = () => {
    return navigationStore.currentSection
  }

  // Следим за изменениями маршрута для обновления активного пункта
  watch(
    () => route.params,
    (newParams, oldParams) => {
      // Обновляем currentSection при изменении секции
      if (newParams.section !== oldParams.section) {
        if (newParams.section) {
          navigationStore.setCurrentSection(newParams.section as string)
        } else {
          navigationStore.setCurrentSection('splash')
        }
      }
    },
  )

  // Инициализация
  const init = () => {
    initSections()
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Инициализируем текущую секцию из URL
    const initialSection = (route.params.section as string) || 'splash'
    navigationStore.setCurrentSection(initialSection)

    // Прокручиваем к секции из URL при загрузке
    if (initialSection !== 'splash') {
      setTimeout(() => {
        scrollToSection(initialSection)
      }, 300)
    }
  }

  // Очистка
  const destroy = () => {
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }
    window.removeEventListener('scroll', handleScroll)
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
