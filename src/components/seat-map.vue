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
</template>

<style scoped>
  .seat-map {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .seat-map__header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .seat-map__title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .seat-map__subtitle {
    font-size: 1.3rem;
    font-weight: 500;
    color: #3498db;
    margin-bottom: 1rem;
  }

  .seat-map__description {
    font-size: 1.1rem;
    color: #5a6c7d;
    line-height: 1.6;
    max-width: 700px;
    margin: 0 auto;
  }

  .seat-map__content {
    display: grid;
    gap: 3rem;
  }

  .seat-map__section {
    margin-bottom: 2rem;
  }

  .seat-map__section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e1e5e9;
  }

  /* Стили для ключевых возможностей - 2 колонки на десктопе */
  .seat-map__features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .seat-map__feature {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .seat-map__feature:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }

  .seat-map__feature-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .seat-map__feature-text {
    line-height: 1.5;
    color: #2c3e50;
    font-size: 1rem;
  }

  /* Стили для процесса */
  .seat-map__process {
    display: grid;
    gap: 2rem;
  }

  .seat-map__process-step {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .seat-map__step-number {
    width: 32px;
    height: 32px;
    background: #e67e22;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border-radius: 50%;
    flex-shrink: 0;
    font-size: 0.9rem;
  }

  .seat-map__step-content {
    flex: 1;
  }

  .seat-map__step-content h4 {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .seat-map__step-content p {
    color: #5a6c7d;
    line-height: 1.6;
    margin: 0;
  }

  /* Стили для архитектуры */
  .seat-map__architecture {
    display: grid;
    gap: 1rem;
  }

  .seat-map__architecture-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem 0;
    border-bottom: 1px solid #f1f3f4;
  }

  .seat-map__architecture-item:last-child {
    border-bottom: none;
  }

  .seat-map__arch-content {
    flex: 1;
    line-height: 1.5;
    color: #2c3e50;
  }

  .seat-map__arch-content strong {
    color: #2c3e50;
  }

  /* Стили для преимуществ - 2 колонки на десктопе */
  .seat-map__benefits {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .seat-map__benefit {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .seat-map__benefit:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }

  .seat-map__benefit-text {
    flex: 1;
    line-height: 1.5;
    color: #2c3e50;
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .seat-map {
      padding: 1rem 0.5rem;
    }

    .seat-map__title {
      font-size: 2rem;
    }

    /* На мобильных - одна колонка */
    .seat-map__features {
      grid-template-columns: 1fr;
    }

    .seat-map__benefits {
      grid-template-columns: 1fr;
    }

    .seat-map__process-step {
      gap: 1rem;
    }

    .seat-map__step-number {
      width: 28px;
      height: 28px;
      font-size: 0.8rem;
    }

    .seat-map__step-content h4 {
      font-size: 1rem;
    }

    .seat-map__step-content p {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .seat-map__title {
      font-size: 1.75rem;
    }

    .seat-map__section-title {
      font-size: 1.3rem;
    }

    .seat-map__feature,
    .seat-map__architecture-item,
    .seat-map__benefit {
      gap: 0.75rem;
    }

    .seat-map__feature,
    .seat-map__benefit {
      padding: 0.75rem;
    }
  }

  /* Для очень маленьких экранов */
  @media (max-width: 360px) {
    .seat-map__feature,
    .seat-map__benefit {
      padding: 0.5rem;
    }

    .seat-map__feature-text,
    .seat-map__benefit-text {
      font-size: 0.9rem;
    }
  }
</style>
