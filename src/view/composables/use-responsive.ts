import { computed, onMounted, onUnmounted, reactive } from 'vue'
import {
  ResponsiveConfig,
  type Breakpoint,
  type MediaQueryConfig,
} from '@/enums/responsive.enum'

type ResponsiveState = Record<Breakpoint, boolean>

export function useResponsive() {
  // Создаем реактивное состояние
  const responsiveState = reactive<ResponsiveState>(
    Object.keys(ResponsiveConfig).reduce((acc, key) => {
      acc[key as Breakpoint] = false
      return acc
    }, {} as ResponsiveState),
  )

  // Массив функций для очистки
  const cleanupFunctions: Array<() => void> = []

  onMounted(() => {
    // Приводим тип для TypeScript
    const entries = Object.entries(ResponsiveConfig) as [Breakpoint, MediaQueryConfig][]

    entries.forEach(([key, config]) => {
      const query = window.matchMedia(`(${config.type}: ${config.value}px)`)

      const handler = (e: MediaQueryListEvent) => {
        responsiveState[key] = e.matches
      }

      query.addListener(handler)
      responsiveState[key] = query.matches

      cleanupFunctions.push(() => {
        query.removeListener(handler)
      })
    })
  })

  onUnmounted(() => {
    cleanupFunctions.forEach(cleanup => cleanup())
  })

  const isMobile = computed(() => responsiveState.mobile)
  const isTablet = computed(() => responsiveState.tablet && !responsiveState.mobile)
  const isDesktop = computed(() => responsiveState.desktop)

  return {
    isMobile,
    isTablet,
    isDesktop,
  }
}
