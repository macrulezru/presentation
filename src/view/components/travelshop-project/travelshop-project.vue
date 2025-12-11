<script setup lang="ts">
  import CircleChart from '@/view/ui/ui-circle-chart/ui-circle-chart.vue'
  import LoadingSpinner from '@/view/ui/ui-loading-spinner/ui-loading-spinner.vue'

  import '@/view/components/travelshop-project/travelshop-project.scss'

  const TravelshopImages = defineAsyncComponent({
    loader: () =>
      import(
        '@/view/components/travelshop-project/parts/travelshop-images/travelshop-images.vue'
      ),
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
  })

  const { t, tm } = useI18n()

  const showSwiper = ref<boolean>(false)

  const features = computed(() => tm('travelshop.features.items'))

  const techStack = computed(() => tm('travelshop.tech_stack.items'))

  const achievements = computed(() => tm('travelshop.achievements.items'))

  const projects = computed(() => tm('travelshop.projects.items'))

  const toggleSwiper = () => {
    showSwiper.value = !showSwiper.value
  }
</script>

<template>
  <div class="travelshop">
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
              <div class="travelshop__feature-icon">⚡</div>
              <span>{{ feature }}</span>
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
            <div class="travelshop__chart-item">
              <CircleChart :value="40" :size="190" :segmentColor="`#dd5406`" />
              <span class="travelshop__chart-label">{{ achievements[0] }}</span>
            </div>
            <div class="travelshop__chart-item">
              <CircleChart :value="60" :size="190" :segmentColor="`#078e2d`" />
              <span class="travelshop__chart-label">{{ achievements[1] }}</span>
            </div>
            <div class="travelshop__chart-item">
              <CircleChart :value="25" :size="190" :segmentColor="`#048eed`" />
              <span class="travelshop__chart-label">{{ achievements[2] }}</span>
            </div>
          </div>
          <div class="travelshop__achievements">
            <div class="travelshop__achievement">
              <div class="travelshop__achievement-content">
                <div class="travelshop__tech-dot"></div>
                <span>{{ achievements[3] }}</span>
              </div>
            </div>
            <div class="travelshop__achievement">
              <div class="travelshop__achievement-content">
                <div class="travelshop__tech-dot"></div>
                <span>{{ achievements[4] }}</span>
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
                <div class="travelshop__project-arrow">↗</div>
              </div>
              <p class="travelshop__project-description">{{ project.description }}</p>
            </a>
          </div>
        </div>
      </div>
      <div class="travelshop__section travelshop__section_images">
        <button v-if="!showSwiper" class="travelshop__screenshots" @click="toggleSwiper">
          {{ t('travelshop.view_screenshots') }}
        </button>
        <TravelshopImages
          v-if="showSwiper"
          size="large"
          :text-key="t('travelshop.loading_screenshots')"
        />
      </div>
    </div>
  </div>
</template>
