<script setup lang="ts">
  const { t, tm } = useI18n()

  const messages = computed(() => ({
    title: t('localization.title'),
    subtitle: t('localization.subtitle'),
    description: t('localization.description'),
    features_title: t('localization.features.title'),
    features: tm('localization.features.items'),
    architecture_title: t('localization.architecture.title'),
    architecture_items: tm('localization.architecture.items'),
    process_title: t('localization.process.title'),
    process_steps: tm('localization.process.steps'),
    benefits_title: t('localization.benefits.title'),
    benefits: tm('localization.benefits.items'),
  }))
</script>

<template>
  <div class="localization">
    <div class="localization__container">
      <div class="localization__header">
        <h2 class="localization__title">{{ messages.title }}</h2>
        <p class="localization__subtitle">{{ messages.subtitle }}</p>
        <p class="localization__description">{{ messages.description }}</p>
      </div>

      <div class="localization__content">
        <!-- Ключевые возможности -->
        <div class="localization__section">
          <h3 class="localization__section-title">{{ messages.features_title }}</h3>
          <div class="localization__features">
            <div
              v-for="(feature, index) in messages.features"
              :key="index"
              class="localization__feature"
            >
              <div class="localization__feature-icon">🌍</div>
              <div class="localization__feature-text">{{ feature }}</div>
            </div>
          </div>
        </div>

        <!-- Процесс работы -->
        <div class="localization__section">
          <h3 class="localization__section-title">{{ messages.process_title }}</h3>
          <div class="localization__process">
            <div
              v-for="(step, index) in messages.process_steps"
              :key="index"
              class="localization__process-step"
            >
              <div class="localization__step-number">{{ index + 1 }}</div>
              <div class="localization__step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Архитектурные компоненты -->
        <div class="localization__section">
          <h3 class="localization__section-title">{{ messages.architecture_title }}</h3>
          <div class="localization__architecture">
            <div
              v-for="(item, index) in messages.architecture_items"
              :key="index"
              class="localization__architecture-item"
            >
              <div class="localization__arch-content">
                <strong>{{ item.name }}</strong>
                - {{ item.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- Преимущества подхода -->
        <div class="localization__section">
          <h3 class="localization__section-title">{{ messages.benefits_title }}</h3>
          <div class="localization__benefits">
            <div
              v-for="(benefit, index) in messages.benefits"
              :key="index"
              class="localization__benefit"
            >
              <div class="localization__benefit-text">{{ benefit }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .localization {
    padding: var(--spacing-xl) 0;
  }

  .localization__container {
    max-width: var(--container-lg);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .localization__header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
  }

  .localization__title {
    font-size: var(--font-size-5xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-md);
  }

  .localization__subtitle {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-medium);
    color: var(--color-accent-purple);
    margin-bottom: var(--spacing-md);
  }

  .localization__description {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    line-height: 1.6;
    max-width: var(--container-md);
    margin: 0 auto;
  }

  .localization__content {
    display: grid;
    gap: var(--spacing-3xl);
  }

  .localization__section {
    margin-bottom: var(--spacing-xl);
  }

  .localization__section-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
  }

  /* Стили для ключевых возможностей */
  .localization__features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .localization__feature {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
  }

  .localization__feature:hover {
    background: var(--color-bg-tertiary);
    transform: translateY(-2px);
  }

  .localization__feature-icon {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-md);
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .localization__feature-text {
    line-height: 1.5;
    color: var(--color-text-primary);
    font-size: var(--font-size-md);
  }

  /* Стили для процесса */
  .localization__process {
    display: grid;
    gap: var(--spacing-xl);
  }

  .localization__process-step {
    display: flex;
    gap: var(--spacing-lg);
    align-items: flex-start;
  }

  .localization__step-number {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    background: var(--color-accent-purple);
    color: var(--color-text-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-semibold);
    border-radius: var(--radius-full);
    flex-shrink: 0;
    font-size: var(--font-size-base);
  }

  .localization__step-content {
    flex: 1;
  }

  .localization__step-content h4 {
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  .localization__step-content p {
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  /* Стили для архитектуры */
  .localization__architecture {
    display: grid;
    gap: var(--spacing-md);
  }

  .localization__architecture-item {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-start;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--color-border-light);
  }

  .localization__architecture-item:last-child {
    border-bottom: none;
  }

  .localization__arch-content {
    flex: 1;
    line-height: 1.5;
    color: var(--color-text-primary);
  }

  .localization__arch-content strong {
    color: var(--color-text-primary);
  }

  /* Стили для преимуществ */
  .localization__benefits {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .localization__benefit {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-start;
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
  }

  .localization__benefit:hover {
    background: var(--color-bg-tertiary);
    transform: translateY(-2px);
  }

  .localization__benefit-text {
    flex: 1;
    line-height: 1.5;
    color: var(--color-text-primary);
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .localization {
      padding: var(--spacing-md) 0;
    }

    .localization__container {
      padding: 0 var(--spacing-sm);
    }

    .localization__title {
      font-size: var(--font-size-4xl);
    }

    /* На мобильных - одна колонка */
    .localization__features {
      grid-template-columns: 1fr;
    }

    .localization__benefits {
      grid-template-columns: 1fr;
    }

    .localization__process-step {
      gap: var(--spacing-md);
    }

    .localization__step-number {
      width: var(--icon-size-sm);
      height: var(--icon-size-sm);
      font-size: var(--font-size-sm);
    }

    .localization__step-content h4 {
      font-size: var(--font-size-md);
    }

    .localization__step-content p {
      font-size: var(--font-size-sm);
    }
  }

  @media (max-width: 480px) {
    .localization__container {
      padding: 0 var(--spacing-sm);
    }

    .localization__title {
      font-size: var(--font-size-3xl);
    }

    .localization__section-title {
      font-size: var(--font-size-2xl);
    }

    .localization__feature,
    .localization__architecture-item,
    .localization__benefit {
      gap: var(--spacing-sm);
    }

    .localization__feature,
    .localization__benefit {
      padding: var(--spacing-md);
    }
  }

  /* Для очень маленьких экранов */
  @media (max-width: 360px) {
    .localization__feature,
    .localization__benefit {
      padding: var(--spacing-sm);
    }

    .localization__feature-text,
    .localization__benefit-text {
      font-size: var(--font-size-base);
    }
  }
</style>
