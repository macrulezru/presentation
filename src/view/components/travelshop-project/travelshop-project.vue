<script setup lang="ts">
  import '@/view/components/travelshop-project/travelshop-project.scss';

  import { ref, computed, defineAsyncComponent, h } from 'vue';

  import type {
    Feature,
    Project,
    AchievementGraph,
  } from '@/view/components/travelshop-project/types';

  import TravelshopIntro from '@/view/components/travelshop-project/parts/travelshop-intro/travelshop-intro.vue';
  import { useI18n } from '@/view/composables/use-i18n';
  import Button from '@/view/ui/ui-button/ui-button.vue';
  import CircleChart from '@/view/ui/ui-circle-chart/ui-circle-chart.vue';
  import LinkArrow from '@/view/ui/ui-link-arrow/ui-link-arrow.vue';
  import UiLoading from '@/view/ui/ui-loading/ui-loading.vue';

  const TravelshopImages = defineAsyncComponent({
    loader: () =>
      import(
        '@/view/components/travelshop-project/parts/travelshop-images/travelshop-images.vue'
      ),
    loadingComponent: () =>
      h('div', { class: 'travelshop__gallery-loader' }, [
        h(UiLoading, { type: 'circle', circleRadius: 60, thickness: 8 }),
      ]),
    delay: 0,
  });

  const { t, tm } = useI18n();

  const showSwiper = ref<boolean>(false);

  const features = computed<Feature[]>(() => {
    const items = tm('travelshop.features.items') as Record<string, unknown>[];
    return Array.isArray(items)
      ? items.map(item => ({
          icon: typeof item?.icon === 'string' ? item.icon : '',
          text: typeof item?.text === 'string' ? item.text : '',
        }))
      : [];
  });

  const techStack = computed<string[]>(() => {
    const items = tm('travelshop.tech_stack.items') as unknown;
    return Array.isArray(items)
      ? items.filter((item): item is string => typeof item === 'string')
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
      color: '#dd5406',
      text: t('travelshop.achievements.items.scalable_architecture'),
    },
    {
      value: 60,
      color: '#078e2d',
      text: t('travelshop.achievements.items.error_reduction'),
    },
    {
      value: 25,
      color: '#048eed',
      text: t('travelshop.achievements.items.performance_improvement'),
    },
  ]);

  const toggleSwiper = () => {
    showSwiper.value = !showSwiper.value;
  };
</script>

<template>
  <div class="travelshop">
    <TravelshopIntro />
    <div class="travelshop__container">
      <div class="travelshop__header">
        <h2 class="travelshop__title">{{ t('travelshop.title') }}</h2>
        <div class="travelshop__meta">
          <span class="travelshop__role">{{ t('travelshop.role') }}</span>
          <span class="travelshop__period">{{ t('travelshop.period') }}</span>
        </div>
        <p class="travelshop__description">{{ t('travelshop.description') }}</p>
      </div>

      <div class="travelshop__content">
        <!-- Ключевые функции -->
        <div class="travelshop__section">
          <h3 class="travelshop__section-title">{{ t('travelshop.features.title') }}</h3>
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
              <span>{{ feature.text }}</span>
            </div>
          </div>
        </div>

        <!-- Технологический стек -->
        <div class="travelshop__section">
          <h3 class="travelshop__section-title">
            {{ t('travelshop.tech_stack.title') }}
          </h3>
          <div class="travelshop__tech-stack">
            <div
              v-for="(tech, index) in techStack"
              :key="index"
              class="travelshop__tech-item"
            >
              <div class="travelshop__tech-dot"></div>
              <span>{{ tech }}</span>
            </div>
          </div>
        </div>

        <!-- Достижения -->
        <div class="travelshop__section">
          <h3 class="travelshop__section-title">
            {{ t('travelshop.achievements.title') }}
          </h3>
          <div class="travelshop__chart">
            <div
              v-for="(item, index) in achievementsGraphs"
              :key="index"
              class="travelshop__chart-item"
            >
              <CircleChart
                autoPlay
                :value="item.value"
                :size="190"
                :segmentColor="item.color"
                :label="item.text"
              />
            </div>
          </div>
          <div class="travelshop__achievements">
            <div class="travelshop__achievement">
              <div class="travelshop__achievement-content">
                <div class="travelshop__tech-dot"></div>
                <span>{{ t('travelshop.achievements.items.code_reliability') }}</span>
              </div>
            </div>
            <div class="travelshop__achievement">
              <div class="travelshop__achievement-content">
                <div class="travelshop__tech-dot"></div>
                <span>{{ t('travelshop.achievements.items.responsive_design') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Проекты -->
        <div class="travelshop__section">
          <h3 class="travelshop__section-title">{{ t('travelshop.projects.title') }}</h3>
          <div class="travelshop__projects">
            <a
              v-for="(project, index) in projects"
              :key="index"
              :href="project.url"
              target="_blank"
              class="travelshop__project"
            >
              <div class="travelshop__project-header">
                <h4 class="travelshop__project-name">{{ project.name }}</h4>
                <LinkArrow class="travelshop__project-arrow" />
              </div>
              <p class="travelshop__project-description">{{ project.description }}</p>
            </a>
          </div>
        </div>
      </div>
      <div class="travelshop__section travelshop__section_images">
        <Button
          v-if="!showSwiper"
          fullWidth
          :text="t('travelshop.view_screenshots')"
          @click="toggleSwiper"
        />
        <div v-if="showSwiper" class="travelshop__ts-slideshow">
          <TravelshopImages size="large" :textKey="t('travelshop.loading_screenshots')" />
        </div>
      </div>
    </div>
  </div>
</template>
