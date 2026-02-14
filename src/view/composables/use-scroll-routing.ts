// Обновление URL с поддержкой третьего сегмента (feature)
import { useResponsive } from '@/view/composables/use-responsive';
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { PageSectionsEnum } from '@/enums/page-sections.enum';
import { useNavigationStore } from '@/stores/use-navigation-store.ts';

const HEADER_HEIGHT = 60;
const HEADER_MOBILE_HEIGHT = 50;
const SPLASH_SCROLL_THRESHOLD = 100;
const SCROLL_END_THRESHOLD = 50;
const SCROLL_TIMEOUT = 2000;

// Синглтон: общее состояние для всех вызовов useScrollRouting
let scrollRoutingApi: ReturnType<typeof createScrollRouting> | null = null;

function createScrollRouting() {
  const router = useRouter();
  const route = useRoute();
  const navigationStore = useNavigationStore();
  const responsive = useResponsive();

  const scrollEndTimeout = ref<NodeJS.Timeout | null>(null);
  const isProcessingNavigation = ref(false);
  const isProgrammaticScroll = ref(false);
  const pendingNavigation = ref<string | null>(null);
  const lastScrollTime = ref<number>(0);
  const lastUrlUpdateTime = ref<number>(0);
  const ignoreNextRouteChange = ref(false);
  const targetSectionAfterScroll = ref<string | null>(null);
  const ignoreScrollUpdatesUntil = ref<number>(0);

  const rafId = ref<number | null>(null);
  const isUserScrolling = ref<boolean>(false);
  const lastScrollPosition = ref<number>(0);

  const sectionNames = Object.values(PageSectionsEnum);

  const headerHeight = computed(() => {
    return responsive.value.tablet || responsive.value.mobile ? HEADER_MOBILE_HEIGHT : HEADER_HEIGHT;
  });

  const FEATURE_SEP = '--';

  /** Секция и featureId из hash — стандартные якоря #section или #section--featureId */
  const getSectionFromHash = (hash: string): { section: string; featureId?: string } => {
    if (!hash || hash === '#') return { section: PageSectionsEnum.SPLASH };
    const path = hash.slice(1).replace(/^\//, '');
    const sepIdx = path.indexOf(FEATURE_SEP);
    if (sepIdx > 0) {
      const section = path.slice(0, sepIdx);
      const featureId = path.slice(sepIdx + FEATURE_SEP.length);
      return {
        section: section === PageSectionsEnum.SPLASH ? PageSectionsEnum.SPLASH : section,
        featureId: featureId || undefined,
      };
    }
    const section = path || PageSectionsEnum.SPLASH;
    return { section: section === PageSectionsEnum.SPLASH ? PageSectionsEnum.SPLASH : section };
  };

  const getHashForSection = (sectionName: string, featureId?: string): string => {
    if (sectionName === PageSectionsEnum.SPLASH) return '#';
    return featureId ? `#${sectionName}${FEATURE_SEP}${featureId}` : `#${sectionName}`;
  };

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

  const getCurrentSection = (scrollY: number): string => {
    if (navigationStore.isScrolling || isProcessingNavigation.value) {
      return navigationStore.currentSection;
    }

    if (scrollY < SPLASH_SCROLL_THRESHOLD) {
      return PageSectionsEnum.SPLASH;
    }

    const { innerHeight } = window;
    const scrollPosition = scrollY + innerHeight / 4;

    let activeSection = PageSectionsEnum.SPLASH;
    let minDistance = Infinity;

    for (const section of navigationStore.sections) {
      if (section.element) {
        const elementTop = section.element.offsetTop - headerHeight.value;
        const elementBottom = elementTop + section.element.offsetHeight;
        const elementCenter = elementTop + (elementBottom - elementTop) / 2;
        const distance = Math.abs(scrollPosition - elementCenter);

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

  const waitForScrollEnd = async (targetPosition: number): Promise<void> => {
    return new Promise(resolve => {
      let isResolved = false;
      let lastPosition = window.pageYOffset;
      let stationaryTime = 0;
      const stationaryThreshold = 100;

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
          stationaryTime += 16;
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

  const updateUrl = (sectionName: string) => {
    if (isProgrammaticScroll.value || isProcessingNavigation.value) return;
    if (Date.now() < ignoreScrollUpdatesUntil.value) return;

    const now = Date.now();
    if (now - lastUrlUpdateTime.value < 300) return;

    if (sectionName !== navigationStore.currentSection) {
      navigationStore.setCurrentSection(sectionName);
      const newHash = getHashForSection(sectionName);
      if (route.hash !== newHash) {
        ignoreNextRouteChange.value = true;
        router.replace({ path: route.path, hash: newHash });
        lastUrlUpdateTime.value = now;
      }
    }
  };

  const handleScroll = () => {
    const currentScrollY = window.pageYOffset;

    if (currentScrollY === lastScrollPosition.value) {
      return;
    }

    lastScrollPosition.value = currentScrollY;
    isUserScrolling.value = true;

    if (rafId.value) {
      cancelAnimationFrame(rafId.value);
    }

    rafId.value = requestAnimationFrame(() => {
      if (isProgrammaticScroll.value || isProcessingNavigation.value) {
        return;
      }
      if (Date.now() < ignoreScrollUpdatesUntil.value) {
        return;
      }

      const now = Date.now();
      if (now - lastScrollTime.value < 50) {
        return;
      }

      lastScrollTime.value = now;

      const section = getCurrentSection(currentScrollY);
      updateUrl(section);

      setTimeout(() => {
        isUserScrolling.value = false;
      }, 50);
    });
  };

  const scrollToSection = async (sectionName: string, immediate = false, retryCount = 0) => {
    if (isProcessingNavigation.value) {
      pendingNavigation.value = sectionName;
      return;
    }

    const section = navigationStore.getSectionById(sectionName);
    if (!section?.element) {
      // При первом открытии watch hash срабатывает до initSections() — пробуем повторить после монтирования
      if (navigationStore.sections.length === 0 && retryCount < 3) {
        setTimeout(() => scrollToSection(sectionName, immediate, retryCount + 1), 150);
        return;
      }
      console.warn(`Section ${sectionName} not found`);
      return;
    }

    const elementPosition = section.element.offsetTop;
    const offsetPosition = elementPosition - headerHeight.value;
    const currentPosition = window.pageYOffset;

    if (Math.abs(currentPosition - offsetPosition) < 10) {
      navigationStore.setCurrentSection(sectionName);
      targetSectionAfterScroll.value = null;
      return;
    }

    isProcessingNavigation.value = true;
    isProgrammaticScroll.value = true;
    navigationStore.setIsScrolling(true);
    targetSectionAfterScroll.value = sectionName;
    navigationStore.setCurrentSection(sectionName);

    try {
      window.scrollTo({
        top: offsetPosition,
        behavior: immediate ? 'auto' : 'smooth',
      });

      await waitForScrollEnd(offsetPosition);

      navigationStore.setCurrentSection(sectionName);
      targetSectionAfterScroll.value = null;

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Scroll error:', error);
    } finally {
      navigationStore.setIsScrolling(false);
      isProcessingNavigation.value = false;

      setTimeout(() => {
        isProgrammaticScroll.value = false;
      }, 300);

      if (pendingNavigation.value && pendingNavigation.value !== sectionName) {
        const nextSection = pendingNavigation.value;
        pendingNavigation.value = null;
        setTimeout(() => scrollToSection(nextSection), 100);
      }
    }
  };

  const navigateToSection = async (sectionName: string) => {
    if (isProcessingNavigation.value) {
      pendingNavigation.value = sectionName;
      return;
    }

    try {
      const currentLocale = (route.params.locale as string) || 'ru';
      const { section: currentSection } = getSectionFromHash(route.hash || '');

      if (currentSection === sectionName) {
        await scrollToSection(sectionName, false);
        return;
      }

      ignoreNextRouteChange.value = true;
      await router.replace({
        path: `/${currentLocale}/`,
        hash: getHashForSection(sectionName),
      });

      await new Promise(resolve => setTimeout(resolve, 50));
      await scrollToSection(sectionName, false);
    } catch (error) {
      console.error('Navigation error:', error);
      navigationStore.setIsScrolling(false);
      isProcessingNavigation.value = false;
      isProgrammaticScroll.value = false;
      pendingNavigation.value = null;
      ignoreNextRouteChange.value = false;
    }
  };

  const getActiveSection = () => {
    return navigationStore.currentSection;
  };

  watch(
    () => route.hash,
    async (newHash, oldHash) => {
      if (ignoreNextRouteChange.value) {
        ignoreNextRouteChange.value = false;
        return;
      }
      if (isProcessingNavigation.value) return;
      if (newHash === oldHash) return;

      const { section: sectionName } = getSectionFromHash(newHash || '');

      if (navigationStore.currentSection !== sectionName) {
        navigationStore.setCurrentSection(sectionName);
      }

      const targetSection = targetSectionAfterScroll.value || sectionName;
      if (!isProgrammaticScroll.value) {
        await scrollToSection(targetSection, true);
      }
    },
    { immediate: true },
  );

  const init = () => {
    if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    ignoreScrollUpdatesUntil.value = Date.now() + 600;

    initSections();

    if (navigationStore.sections.length === 0) {
      console.warn('No sections initialized, retrying...');
      requestAnimationFrame(() => initSections());
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    const { section: initialSection } = getSectionFromHash(route.hash || '');
    if (navigationStore.currentSection !== initialSection) {
      navigationStore.setCurrentSection(initialSection);
    }

    lastScrollPosition.value = window.pageYOffset;
  };

  const destroy = () => {
    if (rafId.value) {
      cancelAnimationFrame(rafId.value);
      rafId.value = null;
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
    ignoreScrollUpdatesUntil.value = 0;
  };

  const updateUrlWithFeature = (sectionName: string, featureId?: string) => {
    if (isProgrammaticScroll.value || isProcessingNavigation.value) return;

    const now = Date.now();
    if (now - lastUrlUpdateTime.value < 300) return;

    navigationStore.setCurrentSection(sectionName);
    const newHash = getHashForSection(sectionName, featureId);
    if (route.hash !== newHash) {
      ignoreNextRouteChange.value = true;
      router.replace({ path: route.path, hash: newHash });
      lastUrlUpdateTime.value = now;
    }
  };

  const setIgnoreScrollUpdates = (durationMs: number) => {
    ignoreScrollUpdatesUntil.value = Date.now() + durationMs;
  };

  return {
    sections: computed(() => navigationStore.sections),
    currentSection: computed(() => navigationStore.currentSection),
    isScrolling: computed(() => navigationStore.isScrolling),
    isUserScrolling: computed(() => isUserScrolling.value),
    updateUrlWithFeature,
    scrollToSection,
    navigateToSection,
    getActiveSection,
    setIgnoreScrollUpdates,
    init,
    destroy,
    isProcessingNavigation: computed(() => isProcessingNavigation.value),
  };
}

export function useScrollRouting() {
  if (!scrollRoutingApi) {
    scrollRoutingApi = createScrollRouting();
  }
  return scrollRoutingApi;
}
