<script setup lang="ts">
  import DlvLoadingSpinner from '@/view/ui/DlvLoadingSpinner.vue'

  const TravelshopImages = defineAsyncComponent({
    loader: () => import('@/view/components/travelshop-images.vue'),
    loadingComponent: DlvLoadingSpinner,
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
          <div class="travelshop__achievements">
            <div
              v-for="(achievement, index) in achievements"
              :key="index"
              class="travelshop__achievement"
            >
              <div class="travelshop__achievement-number">{{ index + 1 }}</div>
              <div class="travelshop__achievement-content">
                {{ achievement }}
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

<style scoped>
  .travelshop {
    padding: var(--spacing-xl) 0;
  }

  .travelshop__container {
    max-width: var(--container-lg);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .travelshop__header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
  }

  .travelshop__title {
    font-size: var(--font-size-5xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-md);
  }

  .travelshop__meta {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);
    flex-wrap: wrap;
  }

  .travelshop__role {
    background: var(--color-secondary);
    color: var(--color-text-light);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-pill);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
  }

  .travelshop__period {
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
  }

  .travelshop__description {
    font-size: var(--font-size-xl);
    color: var(--color-text-secondary);
    line-height: 1.6;
    max-width: var(--container-sm);
    margin: 0 auto;
  }

  .travelshop__content {
    display: grid;
    gap: var(--spacing-3xl);
  }

  .travelshop__section {
    background: var(--color-bg-card);
    border-radius: var(--radius-xl);
  }

  .travelshop__section_images {
    margin-top: 2rem;
  }

  .travelshop__section-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-sm);
    border-bottom: 2px solid var(--color-border-light);
  }

  .travelshop__features {
    display: grid;
    gap: var(--spacing-md);
  }

  .travelshop__feature {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
  }

  .travelshop__feature-icon {
    font-size: var(--font-size-xl);
    flex-shrink: 0;
  }

  .travelshop__tech-stack {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-md);
  }

  .travelshop__tech-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
  }

  .travelshop__tech-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--color-secondary);
    flex-shrink: 0;
  }

  .travelshop__achievements {
    display: grid;
    gap: var(--spacing-lg);
  }

  .travelshop__achievement {
    display: flex;
    gap: var(--spacing-lg);
    align-items: flex-start;
  }

  .travelshop__achievement-number {
    width: var(--icon-size-lg);
    height: var(--icon-size-lg);
    border-radius: var(--radius-full);
    background: var(--color-secondary);
    color: var(--color-text-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-semibold);
    flex-shrink: 0;
  }

  .travelshop__achievement-content {
    flex: 1;
    padding-top: var(--spacing-sm);
    line-height: 1.6;
    color: var(--color-text-secondary);
  }

  .travelshop__projects {
    display: flex;
    gap: var(--spacing-lg);
  }

  .travelshop__project {
    display: block;
    padding: var(--spacing-lg);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: inherit;
    transition: all var(--transition-normal);
    border: 1px solid transparent;
  }

  .travelshop__project:hover {
    background: var(--color-bg-primary);
    border-color: var(--color-secondary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-blue);
  }

  .travelshop__project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .travelshop__project-name {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .travelshop__project-arrow {
    font-size: var(--font-size-xl);
    color: var(--color-secondary);
  }

  .travelshop__project-description {
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin: 0;
  }

  .travelshop__screenshots {
    width: 100%;
    padding: 0.75rem 2rem;
    background: #ffffff;
    color: var(--color-secondary);
    border: solid 2px var(--color-secondary);
    border-radius: 14px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .travelshop__screenshots:hover {
    color: #ffffff;
    background: var(--color-secondary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }

  .travelshop__screenshots:active {
    transform: translateY(0);
  }

  @mixin media-tablet {
    .travelshop {
      padding: var(--spacing-md) 0;
    }

    .travelshop__container {
      padding: 0 var(--spacing-sm);
    }

    .travelshop__title {
      font-size: var(--font-size-4xl);
    }

    .travelshop__meta {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .travelshop__description {
      padding: 0 var(--spacing-md);
      font-size: var(--font-size-lg);
    }

    .travelshop__section {
      padding: var(--spacing-md);
    }

    .travelshop__projects {
      flex-direction: column;
    }

    .travelshop__tech-stack {
      grid-template-columns: 1fr;
    }

    .travelshop__achievement {
      gap: var(--spacing-md);
    }

    .travelshop__achievement-number {
      width: var(--icon-size-md);
      height: var(--icon-size-md);
      font-size: var(--font-size-base);
    }

    .travelshop__section_images {
      margin-top: 0;
    }

    .travelshop__screenshots {
      padding: 0.6rem 1.5rem;
      font-size: 0.95rem;
    }
  }

  @mixin media-mobile {
    .travelshop__container {
      padding: 0 var(--spacing-sm);
    }

    .travelshop__title {
      font-size: var(--font-size-3xl);
    }

    .travelshop__section {
      padding: var(--spacing-md);
    }

    .travelshop__feature {
      padding: var(--spacing-md);
    }
  }
</style>
