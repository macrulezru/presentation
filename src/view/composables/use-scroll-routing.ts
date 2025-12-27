import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { PageSectionsEnum } from '@/enums/page-sections.enum';
import { useNavigationStore } from '@/stores/use-navigation-store.ts';
import { useResponsive } from '@/view/composables/use-responsive';

const HEADER_HEIGHT = 60;
const HEADER_MOBILE_HEIGHT = 50;
const SPLASH_SCROLL_THRESHOLD = 100;
const SCROLL_END_THRESHOLD = 50;
const SCROLL_TIMEOUT = 2000;

export function useScrollRouting() {
  const router = useRouter();
  const route = useRoute();
  const navigationStore = useNavigationStore();

  const { isTablet, isMobile } = useResponsive();

  // Таймеры и состояния
  const scrollTimeout = ref<NodeJS.Timeout | null>(null);
  const scrollEndTimeout = ref<NodeJS.Timeout | null>(null);
  const isProcessingNavigation = ref(false);
  const isProgrammaticScroll = ref(false);
  const pendingNavigation = ref<string | null>(null);
  const lastScrollTime = ref<number>(0);
  const lastUrlUpdateTime = ref<number>(0);
  const ignoreNextRouteChange = ref(false);
  const targetSectionAfterScroll = ref<string | null>(null);

  // RAF оптимизация
  const rafId = ref<number | null>(null);
  const isUserScrolling = ref<boolean>(false);
  const lastScrollPosition = ref<number>(0);

  const sectionNames = Object.values(PageSectionsEnum);

  // Высота хедера в зависимости от устройства
  const headerHeight = computed(() => {
    return isTablet.value || isMobile.value ? HEADER_MOBILE_HEIGHT : HEADER_HEIGHT;
  });

  // Проверка является ли секция Splash
  const isSplashSection = (sectionName: string): boolean =>
    sectionName === PageSectionsEnum.SPLASH;

  // Инициализация DOM элементов секций
  const initSections = () => {
    const sections = sectionNames
      .map(sectionName => {
        const element = document.getElementById(sectionName);
        return element ? { id: sectionName, name: sectionName, element } : null;
      })
      .filter((section): section is NonNullable<typeof section> => section !== null);

    if (sections.length === 0) {
      console.warn('No sections found in DOM');
      return;
    }

    navigationStore.setSections(sections);
  };

  // Определение текущей активной секции на основе позиции скролла
  const getCurrentSection = (scrollY: number): string => {
    if (navigationStore.isScrolling || isProcessingNavigation.value) {
      return navigationStore.currentSection;
    }

    if (scrollY < SPLASH_SCROLL_THRESHOLD) {
      return PageSectionsEnum.SPLASH;
    }

    const { innerHeight } = window;
    const scrollPosition = scrollY + innerHeight / 4;

    // Находим секцию, которая находится в фокусе
    let activeSection = PageSectionsEnum.SPLASH;
    let minDistance = Infinity;

    for (const section of navigationStore.sections) {
      if (section.element) {
        const elementTop = section.element.offsetTop - headerHeight.value;
        const elementBottom = elementTop + section.element.offsetHeight;

        // Центр элемента
        const elementCenter = elementTop + (elementBottom - elementTop) / 2;

        // Расстояние от центра элемента до текущей позиции скролла
        const distance = Math.abs(scrollPosition - elementCenter);

        // Если секция видима и ближе к центру экрана
        if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
          if (distance < minDistance) {
            minDistance = distance;
            activeSection = section.name as PageSectionsEnum;
          }
        }
      }
    }

    return activeSection;
  };

  // Ожидание завершения скролла (анимации)
  const waitForScrollEnd = async (targetPosition: number): Promise<void> => {
    return new Promise(resolve => {
      let isResolved = false;
      let lastPosition = window.pageYOffset;
      let stationaryTime = 0;
      const stationaryThreshold = 100;
      const checkInterval = 16;

      const checkScrollEnd = () => {
        const currentPosition = window.pageYOffset;

        const distanceToTarget = Math.abs(currentPosition - targetPosition);
        if (distanceToTarget < SCROLL_END_THRESHOLD) {
          if (!isResolved) {
            isResolved = true;
            resolve();
          }
          return;
        }

        if (Math.abs(currentPosition - lastPosition) < 1) {
          stationaryTime += checkInterval;
          if (stationaryTime >= stationaryThreshold) {
            if (!isResolved) {
              isResolved = true;
              resolve();
            }
            return;
          }
        } else {
          stationaryTime = 0;
          lastPosition = currentPosition;
        }

        if (!isResolved) {
          requestAnimationFrame(checkScrollEnd);
        }
      };

      if (scrollEndTimeout.value) {
        clearTimeout(scrollEndTimeout.value);
      }
      scrollEndTimeout.value = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      }, SCROLL_TIMEOUT);

      requestAnimationFrame(checkScrollEnd);
    });
  };

  // Обновление URL при ручном скролле пользователя
  const updateUrl = (sectionName: string) => {
    // Игнорируем если скролл программный или навигация в процессе
    if (isProgrammaticScroll.value || isProcessingNavigation.value) {
      return;
    }

    const now = Date.now();
    if (now - lastUrlUpdateTime.value < 300) {
      return;
    }

    if (sectionName !== navigationStore.currentSection) {
      navigationStore.setCurrentSection(sectionName);
      const currentLocale = (route.params.locale as string) || 'ru';

      const newPath = isSplashSection(sectionName)
        ? `/${currentLocale}`
        : `/${currentLocale}/${sectionName}`;

      if (window.location.hash !== `#${newPath}`) {
        window.history.replaceState({}, '', `/#${newPath}`);
        lastUrlUpdateTime.value = now;
      }
    }
  };

  // Оптимизированный обработчик скролла с RAF
  const handleScroll = () => {
    const currentScrollY = window.pageYOffset;

    // Определяем, изменилась ли позиция скролла
    if (currentScrollY === lastScrollPosition.value) {
      return;
    }

    lastScrollPosition.value = currentScrollY;
    isUserScrolling.value = true;

    // Отменяем предыдущий запланированный кадр
    if (rafId.value) {
      cancelAnimationFrame(rafId.value);
    }

    // Запланировать обработку в следующем кадре анимации
    rafId.value = requestAnimationFrame(() => {
      if (isProgrammaticScroll.value || isProcessingNavigation.value) {
        return;
      }

      // Дебаунсим вызовы (раз в 50 мс)
      const now = Date.now();
      if (now - lastScrollTime.value < 50) {
        return;
      }

      lastScrollTime.value = now;

      const section = getCurrentSection(currentScrollY);
      updateUrl(section);

      // Сбрасываем флаг скролла после небольшой задержки
      setTimeout(() => {
        isUserScrolling.value = false;
      }, 50);
    });
  };

  // Плавный скролл к указанной секции
  const scrollToSection = async (sectionName: string, immediate = false) => {
    // Если уже в процессе, ставим в очередь
    if (isProcessingNavigation.value) {
      pendingNavigation.value = sectionName;
      return;
    }

    const section = navigationStore.getSectionById(sectionName);
    if (!section?.element) {
      console.warn(`Section ${sectionName} not found`);
      return;
    }

    const elementPosition = section.element.offsetTop;
    const offsetPosition = elementPosition - headerHeight.value;
    const currentPosition = window.pageYOffset;

    // Если уже близко к цели, просто обновляем состояние
    if (Math.abs(currentPosition - offsetPosition) < 10) {
      navigationStore.setCurrentSection(sectionName);
      targetSectionAfterScroll.value = null;
      return;
    }

    // Устанавливаем флаги программного скролла
    isProcessingNavigation.value = true;
    isProgrammaticScroll.value = true;
    navigationStore.setIsScrolling(true);
    targetSectionAfterScroll.value = sectionName;

    try {
      // Выполняем скролл
      window.scrollTo({
        top: offsetPosition,
        behavior: immediate ? 'auto' : 'smooth',
      });

      // Ждем завершения анимации скролла
      await waitForScrollEnd(offsetPosition);

      // Обновляем состояние после успешного скролла
      navigationStore.setCurrentSection(sectionName);
      targetSectionAfterScroll.value = null;

      // Даем время на "устаканивание" состояния
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Scroll error:', error);
    } finally {
      // Сбрасываем флаги
      navigationStore.setIsScrolling(false);
      isProcessingNavigation.value = false;

      // Откладываем сброс флага программного скролла
      setTimeout(() => {
        isProgrammaticScroll.value = false;
      }, 300);

      // Обрабатываем ожидающую навигацию из очереди
      if (pendingNavigation.value && pendingNavigation.value !== sectionName) {
        const nextSection = pendingNavigation.value;
        pendingNavigation.value = null;
        setTimeout(() => scrollToSection(nextSection), 100);
      }
    }
  };

  // Основная функция навигации по секциям (клики в меню)
  const navigateToSection = async (sectionName: string) => {
    // Если навигация уже в процессе, ставим в очередь
    if (isProcessingNavigation.value) {
      pendingNavigation.value = sectionName;
      return;
    }

    try {
      const currentLocale = (route.params.locale as string) || 'ru';
      const path = isSplashSection(sectionName)
        ? `/${currentLocale}`
        : `/${currentLocale}/${sectionName}`;

      const currentSection = (route.params.section as string) || PageSectionsEnum.SPLASH;

      // Если уже на нужной секции, только скроллим
      if (currentSection === sectionName) {
        await scrollToSection(sectionName);
        return;
      }

      // Игнорируем следующий автоматический переход от Vue Router
      ignoreNextRouteChange.value = true;

      // Выполняем навигацию через Vue Router
      await router.push(path);

      // Даем время на обновление маршрута
      await new Promise(resolve => setTimeout(resolve, 50));

      // Скроллим к целевой секции
      await scrollToSection(sectionName);
    } catch (error) {
      console.error('Navigation error:', error);
      // Сброс всех флагов при ошибке
      navigationStore.setIsScrolling(false);
      isProcessingNavigation.value = false;
      isProgrammaticScroll.value = false;
      pendingNavigation.value = null;
      ignoreNextRouteChange.value = false;
    }
  };

  // Получение текущей активной секции (геттер)
  const getActiveSection = () => {
    return navigationStore.currentSection;
  };

  // Наблюдатель за изменениями маршрута (параметр section)
  watch(
    () => route.params.section,
    async (newSection, oldSection) => {
      // Игнорируем если это наш собственный навигационный вызов
      if (ignoreNextRouteChange.value) {
        ignoreNextRouteChange.value = false;
        return;
      }

      // Пропускаем если навигация уже обрабатывается
      if (isProcessingNavigation.value) {
        return;
      }

      // Обрабатываем изменение секции в URL
      if (newSection !== oldSection) {
        const sectionName = (newSection as string) || PageSectionsEnum.SPLASH;

        // Обновляем состояние если необходимо
        if (navigationStore.currentSection !== sectionName) {
          navigationStore.setCurrentSection(sectionName);
        }

        // Используем целевую секцию или секцию из URL
        const targetSection = targetSectionAfterScroll.value || sectionName;

        // Выполняем скролл если это не программный скролл
        if (!isProgrammaticScroll.value) {
          await scrollToSection(targetSection);
        }
      }
    },
    { immediate: true },
  );

  // Инициализация композабла
  const init = () => {
    setTimeout(() => {
      initSections();

      if (navigationStore.sections.length === 0) {
        console.warn('No sections initialized, retrying...');
        setTimeout(initSections, 500);
      }

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });

      const initialSection = (route.params.section as string) || PageSectionsEnum.SPLASH;
      if (navigationStore.currentSection !== initialSection) {
        navigationStore.setCurrentSection(initialSection);
      }

      // Инициализируем позицию скролла
      lastScrollPosition.value = window.pageYOffset;
    }, 100);
  };

  // Очистка ресурсов композабла
  const destroy = () => {
    if (rafId.value) {
      cancelAnimationFrame(rafId.value);
      rafId.value = null;
    }

    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value);
      scrollTimeout.value = null;
    }

    if (scrollEndTimeout.value) {
      clearTimeout(scrollEndTimeout.value);
      scrollEndTimeout.value = null;
    }

    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleScroll);

    navigationStore.setIsScrolling(false);
    isProcessingNavigation.value = false;
    isProgrammaticScroll.value = false;
    pendingNavigation.value = null;
    ignoreNextRouteChange.value = false;
    targetSectionAfterScroll.value = null;
    isUserScrolling.value = false;
  };

  return {
    sections: computed(() => navigationStore.sections),
    currentSection: computed(() => navigationStore.currentSection),
    isScrolling: computed(() => navigationStore.isScrolling),
    isUserScrolling: computed(() => isUserScrolling.value),
    scrollToSection,
    navigateToSection,
    getActiveSection,
    init,
    destroy,
    isProcessingNavigation: computed(() => isProcessingNavigation.value),
  };
}
