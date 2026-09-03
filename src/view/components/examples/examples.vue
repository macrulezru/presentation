<script setup lang="ts">
  import {
    ref,
    defineAsyncComponent,
    onMounted,
    onUnmounted,
    watch,
    nextTick,
    h,
    Transition,
  } from 'vue';

  import { FeaturesEnum } from '@/enums/features.enum';
  import { PageSectionsEnum } from '@/enums/page-sections.enum.ts';
  import FeatureItem from '@/view/components/examples/parts/feature-item/feature-item.vue';
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts';
  import UiButton from '~/components/ui/UiButton.vue';
  import UiLoading from '~/components/ui/UiLoading.vue';
  import { useFeatures } from '~/composables/useFeatures';
  import { useI18n } from '~/composables/useI18n';
  import { useResponsive } from '~/composables/useResponsive';

  import '@/view/components/examples/examples.scss';

  const Pipeline = defineAsyncComponent({
    loader: () => import('@/view/components/pipeline/pipeline.vue'),
    loadingComponent: () =>
      h(
        Transition,
        { name: 'loader-appear', appear: true },
        {
          default: () =>
            h('div', { class: 'examples__pipeline-loader' }, [
              h(UiLoading, {
                type: 'circle',
                circleRadius: 60,
                thickness: 3,
                progressColor: '#8aec0b',
              }),
            ]),
        },
      ),
    delay: 0,
    suspensible: false,
  });

  const RestApi = defineAsyncComponent({
    loader: () => import('@/view/components/rest-api/rest-api.vue'),
    loadingComponent: () =>
      h(
        Transition,
        { name: 'loader-appear', appear: true },
        {
          default: () =>
            h('div', { class: 'examples__pipeline-loader' }, [
              h(UiLoading, {
                type: 'circle',
                circleRadius: 60,
                thickness: 3,
                progressColor: '#8aec0b',
              }),
            ]),
        },
      ),
    delay: 0,
    suspensible: false,
  });

  const AppPlatform = defineAsyncComponent({
    loader: () => import('@/view/components/app-platform/app-platform.vue'),
    loadingComponent: () =>
      h(
        Transition,
        { name: 'loader-appear', appear: true },
        {
          default: () =>
            h('div', { class: 'examples__pipeline-loader' }, [
              h(UiLoading, {
                type: 'circle',
                circleRadius: 60,
                thickness: 3,
                progressColor: '#8aec0b',
              }),
            ]),
        },
      ),
    delay: 0,
    suspensible: false,
  });

  const { t } = useI18n();

  const responsive = useResponsive();
  const { features } = useFeatures();
  const { navigateToSection, setIgnoreScrollUpdates } = useScrollRouting();

  const isShowPipeline = ref<boolean>(false);
  const isShowRestApi = ref<boolean>(false);
  const isShowAppPlatform = ref<boolean>(false);
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

    const itemLeft = activeItem.offsetLeft;
    const itemWidth = activeItem.offsetWidth;
    const containerWidth = scrollableContainer.clientWidth;

    const itemCenter = itemLeft + itemWidth / 2;
    const containerCenter = containerWidth / 2;
    const targetScroll = itemCenter - containerCenter;

    scrollableContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  const toContactSection = () => {
    navigateToSection(PageSectionsEnum.CONTACTS);
  };

  const showPipeline = () => {
    isShowPipeline.value = true;
    activeFeatureId.value = FeaturesEnum.PIPELINE;
    nextTick(() => scrollNavigationToActiveItem());
  };

  const showRestApi = () => {
    isShowRestApi.value = true;
    activeFeatureId.value = FeaturesEnum.REST_MONITORING;
    nextTick(() => scrollNavigationToActiveItem());
  };

  const closeRestApi = () => {
    isShowRestApi.value = false;
  };

  const showAppPlatform = () => {
    isShowAppPlatform.value = true;
    activeFeatureId.value = FeaturesEnum.DEPLOY_PLATFORM;
    nextTick(() => scrollNavigationToActiveItem());
  };

  const closeAppPlatform = () => {
    isShowAppPlatform.value = false;
  };

  const getNavigationOffset = () => {
    const headerHeight = responsive.desktop ? 60 : 50;
    const navigationHeight = navigationRef.value?.offsetHeight || 0;
    return headerHeight + navigationHeight;
  };

  const scrollToFeature = (featureId: string) => {
    isScrollingByUser.value = true;
    targetFeatureId.value = featureId;
    setIgnoreScrollUpdates(1000);

    activeFeatureId.value = featureId;

    setTimeout(() => {
      scrollNavigationToActiveItem();
    }, 0);

    const element = document.querySelector(`[data-feature-id="${featureId}"]`);
    if (element) {
      const offset = getNavigationOffset();
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      const handleScrollEnd = () => {
        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - offsetPosition) < 50) {
          isScrollingByUser.value = false;
          window.removeEventListener('scroll', handleScrollEnd);
        }
      };

      window.addEventListener('scroll', handleScrollEnd);

      setTimeout(() => {
        isScrollingByUser.value = false;
        window.removeEventListener('scroll', handleScrollEnd);
      }, 1000);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const intersectingElements = new Set<Element>();

    observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            intersectingElements.add(entry.target);
          } else {
            intersectingElements.delete(entry.target);
          }
        });

        if (isScrollingByUser.value) return;
        if (intersectingElements.size === 0) return;

        const zoneTop = getNavigationOffset();
        const zoneBottom = window.innerHeight * (responsive.desktop ? 0.9 : 0.6);
        const getZonePixels = (el: Element) => {
          const rect = el.getBoundingClientRect();
          return Math.max(
            0,
            Math.min(rect.bottom, zoneBottom) - Math.max(rect.top, zoneTop),
          );
        };

        const best = Array.from(intersectingElements).reduce((a, b) =>
          getZonePixels(b) > getZonePixels(a) ? b : a,
        );

        const featureId = best.getAttribute('data-feature-id');
        if (featureId && activeFeatureId.value !== featureId) {
          activeFeatureId.value = featureId;
        }
      },
      {
        rootMargin: responsive.desktop ? '-10% 0px -10% 0px' : '-40% 0px -40% 0px',
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
  });

  watch(
    activeFeatureId,
    () => {
      setTimeout(() => {
        scrollNavigationToActiveItem();
      }, 0);
    },
    { immediate: true },
  );
</script>

<template>
  <div>
    <div class="examples__demonstration">
      <div class="examples__demonstration-container">
        <div class="examples__title" v-html="t('app.examples_title')" />
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
              <UiButton
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
                <div v-if="!isShowPipeline" class="examples__pipeline">
                  <UiButton
                    :text="t('pipeline-demo.button_openDemo')"
                    promo
                    @click="showPipeline"
                  />
                </div>
                <div v-if="isShowPipeline" class="examples__pipeline-animated">
                  <Pipeline />
                </div>
              </template>
              <template v-if="feature.id === FeaturesEnum.REST_MONITORING">
                <div v-if="!isShowRestApi" class="examples__pipeline examples__rest-api">
                  <UiButton
                    :text="t('rest-api-demo.button_openDemo')"
                    promo
                    @click="showRestApi"
                  />
                </div>
                <div
                  v-if="isShowRestApi"
                  class="examples__pipeline-animated examples__rest-api"
                >
                  <RestApi @close="closeRestApi" />
                </div>
              </template>
              <template v-if="feature.id === FeaturesEnum.DEPLOY_PLATFORM">
                <div
                  v-if="!isShowAppPlatform"
                  class="examples__pipeline examples__app-platform"
                >
                  <UiButton
                    :text="t('app-platform-demo.button_openDemo')"
                    promo
                    @click="showAppPlatform"
                  />
                </div>
                <div
                  v-if="isShowAppPlatform"
                  class="examples__pipeline-animated examples__app-platform"
                >
                  <AppPlatform @close="closeAppPlatform" />
                </div>
              </template>
            </FeatureItem>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
