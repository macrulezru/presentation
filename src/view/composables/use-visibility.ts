import { ref, type Ref, onUnmounted } from 'vue';

/*
Use Visibility

- Purpose: отслеживает видимость DOM-элемента в вьюпорте и предоставляет удобный API для реагирования на появление/скрытие.
- Options: `rootMargin` (string), `threshold` (number), `callOnInitIfHidden` (boolean).
- State: `isVisible`: `Ref<boolean>` — текущее состояние видимости элемента.
- API:
  - `initVisibilityObserver(onVisible?: () => void, onHidden?: () => void)`: запускает наблюдение; колбеки опциональны.
  - `cleanup()`: прекращает наблюдение и снимает слушатели.
  - `isElementInViewport(): boolean`: синхронная проверка текущего положения элемента.
  - `on(event: 'visible' | 'hidden', listener: (e: Event) => void)`: подписка на события видимости; возвращает функцию отписки.
- Поведение: использует `IntersectionObserver` для детекции пересечений, выполняет начальную проверку через `getBoundingClientRect()`.
- Также отслеживает `document.visibilitychange` (скрытие вкладки) и корректно переключает состояние/вызывает колбеки или эмитит события.
- Default: если `onVisible`/`onHidden` не переданы, композиция эмитит события `visible` / `hidden` через внутренний эмиттер;
- это позволяет слушать несколько подписчиков через `on`.
- Пример использования (суть): `const { initVisibilityObserver, on } = useVisibility(containerRef);
- initVisibilityObserver(() => start(), () => stop()); const off = on('hidden', () => console.log('hidden'));`
*/

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
  let visibilityChangeHandler: EventListener | null = null;
  let eventTarget: EventTarget | null = new EventTarget();

  const checkInitialVisibility = (): boolean => {
    if (!containerRef.value) return false;

    const rect = containerRef.value.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const vertInView = rect.top <= windowHeight && rect.bottom >= 0;
    const horInView = rect.left <= windowWidth && rect.right >= 0;

    return vertInView && horInView;
  };

  const initVisibilityObserver = (onVisible?: () => void, onHidden?: () => void) => {
    if (!containerRef.value) return;

    const initialVisibility = checkInitialVisibility();
    isVisible.value = initialVisibility;

    const safeOnVisible =
      onVisible ??
      (() => {
        eventTarget?.dispatchEvent(new CustomEvent('visible'));
      });

    const safeOnHidden =
      onHidden ??
      (() => {
        eventTarget?.dispatchEvent(new CustomEvent('hidden'));
      });

    if (!initialVisibility && callOnInitIfHidden) {
      safeOnHidden();
    }

    intersectionObserver.value = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const wasVisible = isVisible.value;
          isVisible.value = entry.isIntersecting;

          if (!wasVisible && entry.isIntersecting) {
            safeOnVisible();
          } else if (wasVisible && !entry.isIntersecting) {
            safeOnHidden();
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

    visibilityChangeHandler = () => {
      if (document.hidden) {
        const wasVisible = isVisible.value;
        isVisible.value = false;
        if (wasVisible) safeOnHidden();
      } else {
        const currentlyVisible = checkInitialVisibility();
        const wasVisible = isVisible.value;
        isVisible.value = currentlyVisible;
        if (!wasVisible && currentlyVisible) {
          safeOnVisible();
        } else if (wasVisible && !currentlyVisible) {
          safeOnHidden();
        }
      }
    };

    document.addEventListener('visibilitychange', visibilityChangeHandler);
  };

  const cleanup = () => {
    if (intersectionObserver.value && containerRef.value) {
      intersectionObserver.value.unobserve(containerRef.value);
      intersectionObserver.value.disconnect();
      intersectionObserver.value = null;
    }

    if (visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
      visibilityChangeHandler = null;
    }

    eventTarget = null;
  };

  const isElementInViewport = (): boolean => {
    return checkInitialVisibility();
  };

  /**
   * Подписаться на события видимости: `visible` или `hidden`.
   * Возвращает функцию отписки.
   */
  const on = (event: 'visible' | 'hidden', listener: (e: Event) => void) => {
    if (!eventTarget) eventTarget = new EventTarget();
    const wrapped = listener as EventListener;
    eventTarget.addEventListener(event, wrapped);
    return () => {
      eventTarget?.removeEventListener(event, wrapped);
    };
  };

  onUnmounted(() => {
    cleanup();
  });

  return {
    isVisible,
    initVisibilityObserver,
    cleanup,
    isElementInViewport,
    on,
  };
}
