import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ResponsiveBreakpoints } from '@/enums/responsive.enum'

export function useResponsive() {
  const width = ref(window.innerWidth)

  // Обновляем ширину при изменении размера окна
  const updateWidth = () => {
    width.value = window.innerWidth
  }

  // Определяем брейкпоинты на основе ширины
  const isMobile = computed(() => width.value <= ResponsiveBreakpoints.mobile)
  const isTablet = computed(
    () =>
      width.value > ResponsiveBreakpoints.mobile &&
      width.value <= ResponsiveBreakpoints.tablet,
  )
  const isDesktop = computed(() => width.value > ResponsiveBreakpoints.tablet)

  // Текущий брейкпоинт
  const currentBreakpoint = computed(() => {
    if (isMobile.value) return 'mobile'
    if (isTablet.value) return 'tablet'
    return 'desktop'
  })

  onMounted(() => {
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  return {
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
  }
}
