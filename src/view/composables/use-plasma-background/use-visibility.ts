import { ref, type Ref } from 'vue'

export function useVisibility(containerRef: Ref<HTMLElement | undefined>) {
  const intersectionObserver = ref<IntersectionObserver | null>(null)

  const isElementInViewport = (): boolean => {
    if (!containerRef.value) return false

    const rect = containerRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const windowWidth = window.innerWidth || document.documentElement.clientWidth

    const vertInView = rect.top <= windowHeight && rect.bottom >= 0
    const horInView = rect.left <= windowWidth && rect.right >= 0

    return vertInView && horInView
  }

  const initIntersectionObserver = (
    startAnimation: () => void,
    stopAnimation: () => void,
  ) => {
    if (!containerRef.value) return

    intersectionObserver.value = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAnimation()
          } else {
            stopAnimation()
          }
        })
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      },
    )

    intersectionObserver.value.observe(containerRef.value)
  }

  const cleanup = () => {
    if (intersectionObserver.value && containerRef.value) {
      intersectionObserver.value.unobserve(containerRef.value)
      intersectionObserver.value.disconnect()
      intersectionObserver.value = null
    }
  }

  return {
    isElementInViewport,
    initIntersectionObserver,
    cleanup,
  }
}
