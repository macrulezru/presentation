import { ref, type Ref, onUnmounted } from 'vue';

export interface UseVisibilityOptions {
  rootMargin?: string;
  threshold?: number;
  callOnInitIfHidden?: boolean;
}

export function useVisibility(
  containerRef: Ref<HTMLElement | undefined>,
  options: UseVisibilityOptions = {},
) {
  const { rootMargin = '0px', threshold = 0.01, callOnInitIfHidden = true } = options;

  const isVisible = ref<boolean>(true);
  const intersectionObserver = ref<IntersectionObserver | null>(null);

  const checkInitialVisibility = (): boolean => {
    if (!containerRef.value) return false;

    const rect = containerRef.value.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const vertInView = rect.top <= windowHeight && rect.bottom >= 0;
    const horInView = rect.left <= windowWidth && rect.right >= 0;

    return vertInView && horInView;
  };

  const initVisibilityObserver = (onVisible: () => void, onHidden: () => void) => {
    if (!containerRef.value) return;

    const initialVisibility = checkInitialVisibility();
    isVisible.value = initialVisibility;

    if (!initialVisibility && callOnInitIfHidden) {
      onHidden();
    }

    intersectionObserver.value = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const wasVisible = isVisible.value;
          isVisible.value = entry.isIntersecting;

          if (!wasVisible && entry.isIntersecting) {
            onVisible();
          } else if (wasVisible && !entry.isIntersecting) {
            onHidden();
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    );

    intersectionObserver.value.observe(containerRef.value);
  };

  const cleanup = () => {
    if (intersectionObserver.value && containerRef.value) {
      intersectionObserver.value.unobserve(containerRef.value);
      intersectionObserver.value.disconnect();
      intersectionObserver.value = null;
    }
  };

  const isElementInViewport = (): boolean => {
    return checkInitialVisibility();
  };

  onUnmounted(() => {
    cleanup();
  });

  return {
    isVisible,
    initVisibilityObserver,
    cleanup,
    isElementInViewport,
  };
}
