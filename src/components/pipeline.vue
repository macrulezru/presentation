<script setup lang="ts">
  const { t, tm } = useI18n()

  const messages = computed(() => ({
    title: t('pipeline.title'),
    subtitle: t('pipeline.subtitle'),
    description: t('pipeline.description'),
    features_title: t('pipeline.features.title'),
    features: tm('pipeline.features.items'),
    architecture_title: t('pipeline.architecture.title'),
    architecture_items: tm('pipeline.architecture.items'),
    process_title: t('pipeline.process.title'),
    process_steps: tm('pipeline.process.steps'),
    benefits_title: t('pipeline.benefits.title'),
    benefits: tm('pipeline.benefits.items'),
  }))
</script>

<template>
  <div class="pipeline">
    <div class="pipeline__container">
      <div class="pipeline__header">
        <h2 class="pipeline__title">{{ messages.title }}</h2>
        <p class="pipeline__subtitle">{{ messages.subtitle }}</p>
        <p class="pipeline__description">{{ messages.description }}</p>
      </div>

      <div class="pipeline__content">
        <!-- Ключевые возможности -->
        <div class="pipeline__section">
          <h3 class="pipeline__section-title">{{ messages.features_title }}</h3>
          <div class="pipeline__features">
            <div
              v-for="(feature, index) in messages.features"
              :key="index"
              class="pipeline__feature"
            >
              <div class="pipeline__feature-icon">✓</div>
              <div class="pipeline__feature-text">{{ feature }}</div>
            </div>
          </div>
        </div>

        <!-- Процесс работы -->
        <div class="pipeline__section">
          <h3 class="pipeline__section-title">{{ messages.process_title }}</h3>
          <div class="pipeline__process">
            <div
              v-for="(step, index) in messages.process_steps"
              :key="index"
              class="pipeline__process-step"
            >
              <div class="pipeline__step-number">{{ index + 1 }}</div>
              <div class="pipeline__step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Архитектурные компоненты -->
        <div class="pipeline__section">
          <h3 class="pipeline__section-title">{{ messages.architecture_title }}</h3>
          <div class="pipeline__architecture">
            <div
              v-for="(item, index) in messages.architecture_items"
              :key="index"
              class="pipeline__architecture-item"
            >
              <div class="pipeline__arch-content">
                <strong>{{ item.name }}</strong>
                - {{ item.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- Преимущества подхода -->
        <div class="pipeline__section">
          <h3 class="pipeline__section-title">{{ messages.benefits_title }}</h3>
          <div class="pipeline__benefits">
            <div
              v-for="(benefit, index) in messages.benefits"
              :key="index"
              class="pipeline__benefit"
            >
              <div class="pipeline__benefit-text">{{ benefit }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .pipeline {
    padding: var(--spacing-xl) 0;
  }

  .pipeline__container {
    max-width: var(--container-lg);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .pipeline__header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
  }

  .pipeline__title {
    font-size: var(--font-size-5xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-md);
  }

  .pipeline__subtitle {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-medium);
    color: var(--color-secondary);
    margin-bottom: var(--spacing-md);
  }

  .pipeline__description {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    line-height: 1.6;
    max-width: var(--container-md);
    margin: 0 auto;
  }

  .pipeline__content {
    display: grid;
    gap: var(--spacing-3xl);
  }

  .pipeline__section {
    margin-bottom: var(--spacing-xl);
  }

  .pipeline__section-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
  }

  /* Стили для ключевых возможностей */
  .pipeline__features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .pipeline__feature {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
  }

  .pipeline__feature:hover {
    background: var(--color-bg-tertiary);
    transform: translateY(-2px);
  }

  .pipeline__feature-icon {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
    background: var(--color-accent-green);
    color: var(--color-text-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    border-radius: var(--radius-full);
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .pipeline__feature-text {
    line-height: 1.5;
    color: var(--color-text-primary);
    font-size: var(--font-size-md);
  }

  /* Стили для процесса */
  .pipeline__process {
    display: grid;
    gap: var(--spacing-xl);
  }

  .pipeline__process-step {
    display: flex;
    gap: var(--spacing-lg);
    align-items: flex-start;
  }

  .pipeline__step-number {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    background: var(--color-secondary);
    color: var(--color-text-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-semibold);
    border-radius: var(--radius-full);
    flex-shrink: 0;
    font-size: var(--font-size-base);
  }

  .pipeline__step-content {
    flex: 1;
  }

  .pipeline__step-content h4 {
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  .pipeline__step-content p {
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  /* Стили для архитектуры */
  .pipeline__architecture {
    display: grid;
    gap: var(--spacing-md);
  }

  .pipeline__architecture-item {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-start;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--color-border-light);
  }

  .pipeline__architecture-item:last-child {
    border-bottom: none;
  }

  .pipeline__arch-content {
    flex: 1;
    line-height: 1.5;
    color: var(--color-text-primary);
  }

  .pipeline__arch-content strong {
    color: var(--color-text-primary);
  }

  /* Стили для преимуществ */
  .pipeline__benefits {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .pipeline__benefit {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-start;
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
  }

  .pipeline__benefit:hover {
    background: var(--color-bg-tertiary);
    transform: translateY(-2px);
  }

  .pipeline__benefit-text {
    flex: 1;
    line-height: 1.5;
    color: var(--color-text-primary);
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .pipeline {
      padding: var(--spacing-md) 0;
    }

    .pipeline__container {
      padding: 0 var(--spacing-sm);
    }

    .pipeline__title {
      font-size: var(--font-size-4xl);
    }

    /* На мобильных - одна колонка */
    .pipeline__features {
      grid-template-columns: 1fr;
    }

    .pipeline__benefits {
      grid-template-columns: 1fr;
    }

    .pipeline__process-step {
      gap: var(--spacing-md);
    }

    .pipeline__step-number {
      width: var(--icon-size-sm);
      height: var(--icon-size-sm);
      font-size: var(--font-size-sm);
    }

    .pipeline__step-content h4 {
      font-size: var(--font-size-md);
    }

    .pipeline__step-content p {
      font-size: var(--font-size-sm);
    }
  }

  @media (max-width: 480px) {
    .pipeline__container {
      padding: 0 var(--spacing-sm);
    }

    .pipeline__title {
      font-size: var(--font-size-3xl);
    }

    .pipeline__section-title {
      font-size: var(--font-size-2xl);
    }

    .pipeline__feature,
    .pipeline__architecture-item,
    .pipeline__benefit {
      gap: var(--spacing-sm);
    }

    .pipeline__feature,
    .pipeline__benefit {
      padding: var(--spacing-md);
    }
  }

  /* Для очень маленьких экранов */
  @media (max-width: 360px) {
    .pipeline__feature,
    .pipeline__benefit {
      padding: var(--spacing-sm);
    }

    .pipeline__feature-text,
    .pipeline__benefit-text {
      font-size: var(--font-size-base);
    }
  }
</style>
