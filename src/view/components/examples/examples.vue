<script setup lang="ts">
  import {
    ref,
    defineAsyncComponent,
    onMounted,
    onUnmounted,
    watch,
    nextTick,
  } from 'vue';

  import { FeaturesEnum } from '@/enums/features.enum';
  import { PageSectionsEnum } from '@/enums/page-sections.enum.ts';
  import { useExamplesStore } from '@/stores/use-examples-store.ts';
  import musicUrl from '@/view/assets/music/background-music.mp3';
  import FeatureItem from '@/view/components/examples/parts/feature-item/feature-item.vue';
  import { useFeatures } from '@/view/composables/use-features.ts';
  import { useI18n } from '@/view/composables/use-i18n.ts';
  import { useResponsive } from '@/view/composables/use-responsive';
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts';
  import Button from '@/view/ui/ui-button/ui-button.vue';
  import LoadingSpinner from '@/view/ui/ui-loading-spinner/ui-loading-spinner.vue';

  import '@/view/components/examples/examples.scss';

  const RestApi = defineAsyncComponent({
    loader: () => import('@/view/components/rest-api/rest-api.vue'),
    loadingComponent: LoadingSpinner,
    delay: 200,
    timeout: 10000,
    errorComponent: {
      template: `
      <div class="travelshop__error">
        <p>{{ $t('travelshop.loading_error') }}</p>
      </div>
    `,
    },
  });

  const { t } = useI18n();

  const { isDesktop } = useResponsive();
  const { features } = useFeatures();
  const { navigateToSection } = useScrollRouting();
  const examplesStore = useExamplesStore();

  const isShowRestApi = ref<boolean>(false);
  const activeFeatureId = ref<string>('');
  const navigationRef = ref<HTMLElement | null>(null);
  const isScrollingByUser = ref<boolean>(false);
  const targetFeatureId = ref<string>('');

  const scrollNavigationToActiveItem = () => {
    if (!navigationRef.value) return;

    const scrollableContainer = navigationRef.value.querySelector(
      '.examples__navigation-scrollable',
    ) as HTMLElement;
    if (!scrollableContainer) return;

    const activeItem = navigationRef.value.querySelector(
      '.examples__navigation-item_active',
    ) as HTMLElement;
    if (!activeItem) return;

    // Get the position of the active item relative to the scrollable container
    const itemLeft = activeItem.offsetLeft;
    const itemWidth = activeItem.offsetWidth;
    const containerWidth = scrollableContainer.clientWidth;

    // Calculate the target scroll position to center the item
    const itemCenter = itemLeft + itemWidth / 2;
    const containerCenter = containerWidth / 2;
    const targetScroll = itemCenter - containerCenter;

    // Scroll smoothly to the target position
    scrollableContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  const toContactSection = () => {
    navigateToSection(PageSectionsEnum.CONTACTS);
  };

  const showRestApi = () => {
    isShowRestApi.value = true;
  };

  const getNavigationOffset = () => {
    const headerHeight = isDesktop.value ? 60 : 50;
    const navigationHeight = navigationRef.value?.offsetHeight || 0;
    return headerHeight + navigationHeight;
  };

  const scrollToFeature = (featureId: string) => {
    // Set flag to indicate user-initiated scroll
    isScrollingByUser.value = true;
    targetFeatureId.value = featureId;

    // Immediately highlight and center the menu item
    activeFeatureId.value = featureId;

    // Ensure DOM is updated before scrolling the menu
    setTimeout(() => {
      scrollNavigationToActiveItem();
    }, 0);

    // Then scroll the page to the feature
    const element = document.querySelector(`[data-feature-id="${featureId}"]`);
    if (element) {
      const offset = getNavigationOffset();
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      // Listen for scroll end to disable the user scroll flag
      const handleScrollEnd = () => {
        // Check if we're close to the target position
        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - offsetPosition) < 50) {
          isScrollingByUser.value = false;
          window.removeEventListener('scroll', handleScrollEnd);
        }
      };

      window.addEventListener('scroll', handleScrollEnd);

      // Fallback: disable flag after 600ms (duration of smooth scroll)
      setTimeout(() => {
        isScrollingByUser.value = false;
        window.removeEventListener('scroll', handleScrollEnd);
      }, 600);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    // preload audio
    music.value = new Audio(musicUrl);
    if (examplesStore.videoStatus) playMusic();

    const offset = getNavigationOffset();
    observer = new IntersectionObserver(
      entries => {
        // Only process if user is not scrolling by clicking menu
        if (isScrollingByUser.value) return;

        // Find the topmost (first) intersecting element
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        if (intersectingEntries.length === 0) return;

        // Sort by position to get the topmost element
        const topmost = intersectingEntries.reduce((top, current) => {
          const topRect = top.target.getBoundingClientRect();
          const currentRect = current.target.getBoundingClientRect();
          return currentRect.top < topRect.top ? current : top;
        });

        const featureId = topmost.target.getAttribute('data-feature-id');
        if (featureId) {
          activeFeatureId.value = featureId;
        }
      },
      {
        rootMargin: `-${offset}px 0px -50% 0px`,
        threshold: 0,
      },
    );

    const featureElements = document.querySelectorAll('[data-feature-id]');
    featureElements.forEach(el => observer?.observe(el));

    if (features.value.length > 0 && features.value[0]) {
      activeFeatureId.value = features.value[0].id;
    }
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
    stopMusic();
    music.value = null;
  });

  // Watch for changes in activeFeatureId and scroll the navigation menu
  watch(activeFeatureId, () => {
    // Use nextTick equivalent: setTimeout ensures DOM is updated
    setTimeout(() => {
      scrollNavigationToActiveItem();
    }, 0);
  });
  const featuresListRef = ref<HTMLElement | null>(null);

  function checkFeaturesListVisibility() {
    if (!featuresListRef.value) return;
    const rect = featuresListRef.value.getBoundingClientRect();
    const inViewport =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;
    // Если анимация включена, иконка всегда видима
    if (examplesStore.videoStatus) {
      examplesStore.setIsShowVideoButton(true);
    } else {
      examplesStore.setIsShowVideoButton(inViewport);
    }
  }

  onMounted(() => {
    nextTick(() => {
      checkFeaturesListVisibility();
    });
    window.addEventListener('scroll', checkFeaturesListVisibility, { passive: true });
    window.addEventListener('resize', checkFeaturesListVisibility, { passive: true });
  });
  onUnmounted(() => {
    window.removeEventListener('scroll', checkFeaturesListVisibility);
    window.removeEventListener('resize', checkFeaturesListVisibility);
  });

  // --- Background music logic ---
  const music = ref<HTMLAudioElement | null>(null);

  function playMusic() {
    if (!music.value) return;
    music.value.loop = true;
    music.value.volume = 0.5;
    music.value.currentTime = 0;
    music.value.play().catch(() => {});
  }

  function stopMusic() {
    if (!music.value) return;
    music.value.pause();
    music.value.currentTime = 0;
  }

  watch(
    () => examplesStore.videoStatus,
    val => {
      if (val) {
        playMusic();
      } else {
        stopMusic();
      }
    },
  );
</script>

<template>
  <div>
    <div class="examples__demonstration">
      <div class="examples__demonstration-container">
        <div class="examples__title">{{ t('app.examples_title') }}</div>
        <div class="examples__demonstration-content">
          <div class="examples__demonstration-title">
            {{ t('demonstration.title') }}
          </div>
          <div class="examples__demonstration-description">
            {{ t('demonstration.description') }}
          </div>
          <div class="examples__demonstration-readiness">
            <div class="examples__demonstration-icon" />
            <div>{{ t('demonstration.readiness') }}</div>
            <div>
              <Button
                small
                :text="t('demonstration.contact_me_conveniently')"
                @click="toContactSection"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="examples__features">
      <div class="examples__features-container">
        <div ref="navigationRef" class="examples__navigation">
          <div class="examples__navigation-wrapper">
            <div class="examples__navigation-scrollable">
              <div class="examples__navigation-items">
                <div
                  v-for="feature in features"
                  :key="feature.id"
                  class="examples__navigation-item"
                  :class="{
                    'examples__navigation-item_active': activeFeatureId === feature.id,
                  }"
                  @click="scrollToFeature(feature.id)"
                >
                  {{ feature.shortTitle }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref="featuresListRef" class="examples__features-list">
          <template v-for="(feature, idx) in features" :key="feature.id">
            <FeatureItem :feature="feature" :reverse="idx > 0 && idx % 2 === 1">
              <template v-if="feature.id === FeaturesEnum.PIPELINE">
                <div v-if="!isShowRestApi" class="examples__rest-api">
                  <Button :text="t('rest-api.button')" @click="showRestApi" />
                </div>
                <RestApi v-if="isShowRestApi" />
              </template>
            </FeatureItem>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
