<script setup lang="ts">
  import '@/view/components/travelshop-project/travelshop-project.scss';

  import { ref, computed, defineAsyncComponent, h, Transition } from 'vue';

  import type {
    Feature,
    Project,
    AchievementGraph,
  } from '@/view/components/travelshop-project/types';

  import TravelshopImageHorizontal from '@/view/assets/images/travelshop-image-horizontal.webp';
  import TravelshopImage from '@/view/assets/images/travelshop-image.webp';
  import TravelshopIntro from '@/view/components/travelshop-project/parts/travelshop-intro/travelshop-intro.vue';
  import Button from '@/view/ui/ui-button/ui-button.vue';
  import CircleChart from '@/view/ui/ui-circle-chart/ui-circle-chart.vue';
  import UiImage from '@/view/ui/ui-image/ui-image.vue';
  import LinkArrow from '@/view/ui/ui-link-arrow/ui-link-arrow.vue';
  import UiLoading from '@/view/ui/ui-loading/ui-loading.vue';
  import { useI18n } from '~/composables/useI18n';

  const TravelshopImages = defineAsyncComponent({
    loader: () =>
      import('@/view/components/travelshop-project/parts/travelshop-images/travelshop-images.vue'),
    loadingComponent: () =>
      h(
        Transition,
        { name: 'loader-appear', appear: true },
        {
          default: () =>
            h('div', { class: 'travelshop__gallery-loader' }, [
              h(UiLoading, {
                type: 'circle',
                circleRadius: 60,
                thickness: 3,
                progressColor: '#d941b0',
              }),
            ]),
        },
      ),
    delay: 0,
    suspensible: false,
  });

  const { t, tm } = useI18n();

  const showSwiper = ref<boolean>(false);

  const isBrowser = typeof window !== 'undefined';

  const features = computed<Feature[]>(() => {
    const items = tm('travelshop.features.items') as Record<string, unknown>[];
    return Array.isArray(items)
      ? items.map(item => ({
          icon: typeof item?.icon === 'string' ? item.icon : '',
          title: typeof item?.title === 'string' ? item.title : '',
          text: typeof item?.text === 'string' ? item.text : '',
        }))
      : [];
  });

  const projects = computed<Project[]>(() => {
    const items = tm('travelshop.projects.items') as Record<string, unknown>[];
    return Array.isArray(items)
      ? items.map(item => ({
          name: typeof item?.name === 'string' ? item.name : '',
          url: typeof item?.url === 'string' ? item.url : '',
          description: typeof item?.description === 'string' ? item.description : '',
        }))
      : [];
  });

  const achievementsGraphs = computed<AchievementGraph[]>(() => [
    {
      value: 40,
      color: '#BC1212',
      text: t('travelshop.achievements.items.scalable_architecture'),
    },
    {
      value: 60,
      color: '#17980B',
      text: t('travelshop.achievements.items.error_reduction'),
    },
    {
      value: 25,
      color: '#0270FF',
      text: t('travelshop.achievements.items.performance_improvement'),
    },
  ]);

  const toggleSwiper = () => {
    showSwiper.value = !showSwiper.value;
  };
</script>

<template>
  <div class="travelshop">
    <!-- Canvas / Image() heavy intro: SSR-safe fallback -->
    <template v-if="isBrowser">
      <TravelshopIntro />
    </template>
    <div v-else class="travelshop-intro">
      <div class="travelshop-intro__wrapper">
        <div class="travelshop-intro__canvas travelshop-intro__canvas-loading" />
      </div>
    </div>
    <div class="travelshop__intro">
      <div class="travelshop__container travelshop__airplane_top">
        <div class="travelshop__intro-description">
          <div>
            <span class="travelshop__role">{{ t('travelshop.role') }}</span>
          </div>
          <div class="travelshop__title">{{ t('travelshop.title') }}</div>
          <div class="travelshop__subtitle">{{ t('travelshop.description') }}</div>
        </div>
      </div>
    </div>

    <div class="travelshop__container travelshop__airplane_bottom">
      <div class="travelshop__content">
        <!-- Ключевые функции -->
        <div class="travelshop__section">
          <div class="travelshop__section-title">
            {{ t('travelshop.features.title') }}
          </div>
          <div class="travelshop__features-wrapper">
            <div class="travelshop__features">
              <div
                v-for="(feature, index) in features"
                :key="index"
                class="travelshop__feature"
              >
                <span
                  class="travelshop__feature-icon"
                  :class="`travelshop__feature-icon_${feature.icon}`"
                />
                <span class="travelshop__feature-title">{{ feature.title }}</span>
                <span class="travelshop__feature-text">{{ feature.text }}</span>
              </div>
            </div>
            <div>
              <UiImage
                :image="{
                  src: { src: TravelshopImage, width: '720px', height: '1237px' },
                  tablet: {
                    src: TravelshopImageHorizontal,
                    width: '1400px',
                    height: '700px',
                  },
                  alt: 'TravelShop 2.0',
                }"
                class="travelshop__tsh-image"
              />
            </div>
          </div>
        </div>

        <!-- Достижения -->
        <div class="travelshop__section">
          <div class="travelshop__section-title">
            {{ t('travelshop.achievements.title') }}
          </div>
          <div class="travelshop__achievements">
            <div class="travelshop__chart">
              <div
                v-for="(item, index) in achievementsGraphs"
                :key="index"
                class="travelshop__chart-item"
              >
                <CircleChart
                  autoPlay
                  mode="boxed"
                  :value="item.value"
                  :size="180"
                  :markCount="20"
                  :lineThick="14"
                  :valueFontSize="36"
                  valueColor="#616A70"
                  strokeColor="#363035"
                  :segmentColor="item.color"
                  :label="item.text"
                />
              </div>
              <div class="travelshop__achievement-content">
                <div class="travelshop__achievement-item">
                  {{ t('travelshop.achievements.items.code_reliability') }}
                </div>
                <div class="travelshop__achievement-item">
                  {{ t('travelshop.achievements.items.responsive_design') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Проекты -->
        <div class="travelshop__section">
          <div class="travelshop__section-title">
            {{ t('travelshop.projects.title') }}
          </div>
          <div class="travelshop__projects">
            <div
              v-for="(project, index) in projects"
              :key="index"
              class="travelshop__project"
            >
              <a :href="project.url" target="_blank">
                <span class="travelshop__project-header">
                  <span class="travelshop__project-name">
                    {{ project.name }}
                    <LinkArrow class="travelshop__project-arrow" />
                  </span>
                </span>
              </a>
              <div class="travelshop__project-description">{{ project.description }}</div>
            </div>
          </div>
        </div>

        <div
          v-if="!showSwiper"
          class="travelshop__section travelshop__section_images-button"
        >
          <Button :text="t('travelshop.view_screenshots')" @click="toggleSwiper" />
        </div>
        <div v-if="showSwiper" class="travelshop__section travelshop__section_images">
          <div class="travelshop__ts-slideshow">
            <TravelshopImages
              size="large"
              :textKey="t('travelshop.loading_screenshots')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
