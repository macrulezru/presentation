<script setup lang="ts">
  const { t, tm } = useI18n()

  const messages = computed(() => ({
    title: t('seatMap.title'),
    subtitle: t('seatMap.subtitle'),
    description: t('seatMap.description'),
    features_title: t('seatMap.features.title'),
    features: tm('seatMap.features.items'),
    architecture_title: t('seatMap.architecture.title'),
    architecture_items: tm('seatMap.architecture.items'),
    process_title: t('seatMap.process.title'),
    process_steps: tm('seatMap.process.steps'),
    benefits_title: t('seatMap.benefits.title'),
    benefits: tm('seatMap.benefits.items'),
  }))
</script>

<template>
  <div class="seat-map">
    <div class="seat-map__container">
      <div class="seat-map__header">
        <h2 class="seat-map__title">{{ messages.title }}</h2>
        <p class="seat-map__subtitle">{{ messages.subtitle }}</p>
        <p class="seat-map__description">{{ messages.description }}</p>
      </div>

      <div class="seat-map__content">
        <!-- Ключевые возможности -->
        <div class="seat-map__section">
          <h3 class="seat-map__section-title">{{ messages.features_title }}</h3>
          <div class="seat-map__features">
            <div
              v-for="(feature, index) in messages.features"
              :key="index"
              class="seat-map__feature"
            >
              <div class="seat-map__feature-icon">✈️</div>
              <div class="seat-map__feature-text">{{ feature }}</div>
            </div>
          </div>
        </div>

        <!-- Процесс работы -->
        <div class="seat-map__section">
          <h3 class="seat-map__section-title">{{ messages.process_title }}</h3>
          <div class="seat-map__process">
            <div
              v-for="(step, index) in messages.process_steps"
              :key="index"
              class="seat-map__process-step"
            >
              <div class="seat-map__step-number">{{ index + 1 }}</div>
              <div class="seat-map__step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Архитектурные компоненты -->
        <div class="seat-map__section">
          <h3 class="seat-map__section-title">{{ messages.architecture_title }}</h3>
          <div class="seat-map__architecture">
            <div
              v-for="(item, index) in messages.architecture_items"
              :key="index"
              class="seat-map__architecture-item"
            >
              <div class="seat-map__arch-content">
                <strong>{{ item.name }}</strong>
                - {{ item.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- Преимущества подхода -->
        <div class="seat-map__section">
          <h3 class="seat-map__section-title">{{ messages.benefits_title }}</h3>
          <div class="seat-map__benefits">
            <div
              v-for="(benefit, index) in messages.benefits"
              :key="index"
              class="seat-map__benefit"
            >
              <div class="seat-map__benefit-text">{{ benefit }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .seat-map {
    padding: var(--spacing-xl) 0;
  }

  .seat-map__container {
    max-width: var(--container-lg);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .seat-map__header {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
  }

  .seat-map__title {
    font-size: var(--font-size-5xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-md);
  }

  .seat-map__subtitle {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-medium);
    color: var(--color-accent-orange);
    margin-bottom: var(--spacing-md);
  }

  .seat-map__description {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    line-height: 1.6;
    max-width: var(--container-md);
    margin: 0 auto;
  }

  .seat-map__content {
    display: grid;
    gap: var(--spacing-3xl);
  }

  .seat-map__section {
    margin-bottom: var(--spacing-xl);
  }

  .seat-map__section-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
  }

  /* Стили для ключевых возможностей */
  .seat-map__features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .seat-map__feature {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
  }

  .seat-map__feature:hover {
    background: var(--color-bg-tertiary);
    transform: translateY(-2px);
  }

  .seat-map__feature-icon {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-md);
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .seat-map__feature-text {
    line-height: 1.5;
    color: var(--color-text-primary);
    font-size: var(--font-size-md);
  }

  /* Стили для процесса */
  .seat-map__process {
    display: grid;
    gap: var(--spacing-xl);
  }

  .seat-map__process-step {
    display: flex;
    gap: var(--spacing-lg);
    align-items: flex-start;
  }

  .seat-map__step-number {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    background: var(--color-accent-orange);
    color: var(--color-text-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-semibold);
    border-radius: var(--radius-full);
    flex-shrink: 0;
    font-size: var(--font-size-base);
  }

  .seat-map__step-content {
    flex: 1;
  }

  .seat-map__step-content h4 {
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  .seat-map__step-content p {
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  /* Стили для архитектуры */
  .seat-map__architecture {
    display: grid;
    gap: var(--spacing-md);
  }

  .seat-map__architecture-item {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-start;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--color-border-light);
  }

  .seat-map__architecture-item:last-child {
    border-bottom: none;
  }

  .seat-map__arch-content {
    flex: 1;
    line-height: 1.5;
    color: var(--color-text-primary);
  }

  .seat-map__arch-content strong {
    color: var(--color-text-primary);
  }

  /* Стили для преимуществ */
  .seat-map__benefits {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .seat-map__benefit {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-start;
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
  }

  .seat-map__benefit:hover {
    background: var(--color-bg-tertiary);
    transform: translateY(-2px);
  }

  .seat-map__benefit-text {
    flex: 1;
    line-height: 1.5;
    color: var(--color-text-primary);
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .seat-map {
      padding: var(--spacing-md) 0;
    }

    .seat-map__container {
      padding: 0 var(--spacing-sm);
    }

    .seat-map__title {
      font-size: var(--font-size-4xl);
    }

    /* На мобильных - одна колонка */
    .seat-map__features {
      grid-template-columns: 1fr;
    }

    .seat-map__benefits {
      grid-template-columns: 1fr;
    }

    .seat-map__process-step {
      gap: var(--spacing-md);
    }

    .seat-map__step-number {
      width: var(--icon-size-sm);
      height: var(--icon-size-sm);
      font-size: var(--font-size-sm);
    }

    .seat-map__step-content h4 {
      font-size: var(--font-size-md);
    }

    .seat-map__step-content p {
      font-size: var(--font-size-sm);
    }
  }

  @media (max-width: 480px) {
    .seat-map__container {
      padding: 0 var(--spacing-sm);
    }

    .seat-map__title {
      font-size: var(--font-size-3xl);
    }

    .seat-map__section-title {
      font-size: var(--font-size-2xl);
    }

    .seat-map__feature,
    .seat-map__architecture-item,
    .seat-map__benefit {
      gap: var(--spacing-sm);
    }

    .seat-map__feature,
    .seat-map__benefit {
      padding: var(--spacing-md);
    }
  }

  /* Для очень маленьких экранов */
  @media (max-width: 360px) {
    .seat-map__feature,
    .seat-map__benefit {
      padding: var(--spacing-sm);
    }

    .seat-map__feature-text,
    .seat-map__benefit-text {
      font-size: var(--font-size-base);
    }
  }
</style>
