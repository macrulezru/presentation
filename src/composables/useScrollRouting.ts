import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export interface Section {
  id: string
  name: string
  element: HTMLElement | null
}

// Создаем глобальную реактивную переменную
const currentSection = ref<string>('splash')

export function useScrollRouting() {
  const router = useRouter()
  const route = useRoute()
  const sections = ref<Section[]>([])
  const isScrolling = ref(false)
  const scrollTimeout = ref<NodeJS.Timeout | null>(null)

  // Определяем секции
  const sectionDefinitions = [
    { id: 'splash', name: 'splash' },
    { id: 'about', name: 'about' },
    { id: 'experience', name: 'experience' },
    { id: 'travelshop', name: 'travelshop' },
    { id: 'features', name: 'features' },
    { id: 'remote-workplace', name: 'remote-workplace' },
  ]

  // Инициализация секций
  const initSections = () => {
    sections.value = sectionDefinitions
      .map(section => ({
        ...section,
        element: document.getElementById(section.id),
      }))
      .filter(section => section.element !== null) as Section[]
  }

  // Получение текущей активной секции
  const getCurrentSection = (): string => {
    const scrollPosition = window.pageYOffset + window.innerHeight / 2
    const headerHeight = 60

    // Если прокрутка в самом верху - это splash секция
    if (window.pageYOffset < 100) {
      return 'splash'
    }

    for (const section of sections.value) {
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
    if (sectionName !== currentSection.value && !isScrolling.value) {
      currentSection.value = sectionName
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
    if (isScrolling.value) return

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
    const section = sections.value.find(s => s.name === sectionName)
    if (section?.element) {
      isScrolling.value = true

      const headerHeight = 60
      const elementPosition = section.element.offsetTop
      const offsetPosition = elementPosition - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      // Сбрасываем флаг после завершения анимации
      setTimeout(() => {
        isScrolling.value = false
      }, 800)
    } else if (sectionName === 'splash') {
      // Особый случай для главной страницы - прокрутка наверх
      isScrolling.value = true

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      setTimeout(() => {
        isScrolling.value = false
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

  // Получить текущую активную секцию (для использования в lang-selector)
  const getActiveSection = () => {
    return currentSection.value
  }

  // Следим за изменениями маршрута для обновления активного пункта
  watch(
    () => route.params,
    (newParams, oldParams) => {
      // Обновляем currentSection при изменении секции
      if (newParams.section !== oldParams.section) {
        if (newParams.section) {
          currentSection.value = newParams.section as string
        } else {
          currentSection.value = 'splash'
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
    currentSection.value = initialSection

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
    sections,
    currentSection,
    scrollToSection,
    navigateToSection,
    getCurrentSection,
    getActiveSection, // Добавляем эту функцию
    init,
    destroy,
  }
}
