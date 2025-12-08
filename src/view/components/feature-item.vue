<script setup lang="ts">
  import type { FeatureData } from '@/view/composables/useFeatures'

  interface Props {
    feature: FeatureData
  }

  defineProps<Props>()
</script>

<template>
  <article class="feature-item" :data-feature-id="feature.id">
    <div class="feature-item__container">
      <header class="feature-item__header">
        <h2 class="feature-item__title">{{ feature.title }}</h2>
        <p class="feature-item__subtitle" :style="{ color: feature.accentColor }">
          {{ feature.subtitle }}
        </p>
        <p class="feature-item__description">{{ feature.description }}</p>
      </header>

      <div class="feature-item__content">
        <!-- Ключевые возможности -->
        <section class="feature-item__section">
          <h3 class="feature-item__section-title">{{ feature.features.title }}</h3>
          <div class="feature-item__features">
            <div
              v-for="(item, index) in feature.features.items"
              :key="index"
              class="feature-item__feature"
            >
              <div class="feature-item__feature-icon">{{ feature.featureIcon }}</div>
              <div class="feature-item__feature-text">{{ item }}</div>
            </div>
          </div>
        </section>

        <!-- Процесс работы -->
        <section class="feature-item__section">
          <h3 class="feature-item__section-title">{{ feature.process.title }}</h3>
          <div class="feature-item__process">
            <div
              v-for="(step, index) in feature.process.steps"
              :key="index"
              class="feature-item__process-step"
            >
              <div
                class="feature-item__step-number"
                :style="{ background: feature.accentColor }"
              >
                {{ index + 1 }}
              </div>
              <div class="feature-item__step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Архитектурные компоненты -->
        <section class="feature-item__section">
          <h3 class="feature-item__section-title">{{ feature.architecture.title }}</h3>
          <div class="feature-item__architecture">
            <div
              v-for="(item, index) in feature.architecture.items"
              :key="index"
              class="feature-item__architecture-item"
            >
              <div class="feature-item__arch-content">
                <strong>{{ item.name }}</strong>
                - {{ item.description }}
              </div>
            </div>
          </div>
        </section>

        <!-- Преимущества подхода -->
        <section class="feature-item__section">
          <h3 class="feature-item__section-title">{{ feature.benefits.title }}</h3>
          <div class="feature-item__benefits">
            <div
              v-for="(benefit, index) in feature.benefits.items"
              :key="index"
              class="feature-item__benefit"
            >
              <div class="feature-item__benefit-text">{{ benefit }}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </article>
</template>

<style scoped>
  .feature-item {
    padding: var(--spacing-xl) 0;
    border-bottom: 1px solid var(--color-border-light);
    scroll-margin-top: var(--spacing-lg);
  }

  .feature-item:last-child {
    border-bottom: none;
  }

  .feature-item__container {
    max-width: var(--container-lg);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .feature-item__header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
  }

  .feature-item__title {
    font-size: var(--font-size-5xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-md);
    line-height: 1.2;
  }

  .feature-item__subtitle {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--spacing-md);
    line-height: 1.3;
  }

  .feature-item__description {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    line-height: 1.6;
    max-width: var(--container-md);
    margin: 0 auto;
  }

  .feature-item__content {
    display: grid;
    gap: var(--spacing-3xl);
  }

  .feature-item__section {
    margin-bottom: var(--spacing-xl);
  }

  .feature-item__section-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
  }

  .feature-item__features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .feature-item__feature {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
  }

  .feature-item__feature:hover {
    background: var(--color-bg-tertiary);
    transform: translateY(-2px);
  }

  .feature-item__feature-icon {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    border-radius: var(--radius-full);
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .feature-item__feature-text {
    line-height: 1.5;
    color: var(--color-text-primary);
    font-size: var(--font-size-md);
  }

  .feature-item__process {
    display: grid;
    gap: var(--spacing-xl);
  }

  .feature-item__process-step {
    display: flex;
    gap: var(--spacing-lg);
    align-items: flex-start;
  }

  .feature-item__step-number {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    color: var(--color-text-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-semibold);
    border-radius: var(--radius-full);
    flex-shrink: 0;
    font-size: var(--font-size-base);
  }

  .feature-item__step-content {
    flex: 1;
  }

  .feature-item__step-content h4 {
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  .feature-item__step-content p {
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .feature-item__architecture {
    display: grid;
    gap: var(--spacing-md);
  }

  .feature-item__architecture-item {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-start;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--color-border-light);
  }

  .feature-item__architecture-item:last-child {
    border-bottom: none;
  }

  .feature-item__arch-content {
    flex: 1;
    line-height: 1.5;
    color: var(--color-text-primary);
  }

  .feature-item__arch-content strong {
    color: var(--color-text-primary);
  }

  .feature-item__benefits {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .feature-item__benefit {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-start;
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
  }

  .feature-item__benefit:hover {
    background: var(--color-bg-tertiary);
    transform: translateY(-2px);
  }

  .feature-item__benefit-text {
    flex: 1;
    line-height: 1.5;
    color: var(--color-text-primary);
  }

  @media (max-width: 768px) {
    .feature-item {
      padding: var(--spacing-lg) 0;
    }

    .feature-item__container {
      padding: 0 var(--spacing-sm);
    }

    .feature-item__title {
      font-size: var(--font-size-4xl);
    }

    .feature-item__features {
      grid-template-columns: 1fr;
    }

    .feature-item__benefits {
      grid-template-columns: 1fr;
    }

    .feature-item__process-step {
      gap: var(--spacing-md);
    }

    .feature-item__step-number {
      width: var(--icon-size-sm);
      height: var(--icon-size-sm);
      font-size: var(--font-size-sm);
    }

    .feature-item__step-content h4 {
      font-size: var(--font-size-md);
    }

    .feature-item__step-content p {
      font-size: var(--font-size-sm);
    }
  }

  @media (max-width: 480px) {
    .feature-item__container {
      padding: 0 var(--spacing-sm);
    }

    .feature-item__title {
      font-size: var(--font-size-3xl);
    }

    .feature-item__section-title {
      font-size: var(--font-size-2xl);
    }

    .feature-item__feature,
    .feature-item__architecture-item,
    .feature-item__benefit {
      gap: var(--spacing-sm);
    }

    .feature-item__feature,
    .feature-item__benefit {
      padding: var(--spacing-md);
    }
  }

  @media (max-width: 360px) {
    .feature-item__feature,
    .feature-item__benefit {
      padding: var(--spacing-sm);
    }

    .feature-item__feature-text,
    .feature-item__benefit-text {
      font-size: var(--font-size-base);
    }
  }
</style>
