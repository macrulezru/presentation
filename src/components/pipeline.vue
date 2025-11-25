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
</template>

<style scoped>
  .pipeline {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .pipeline__header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .pipeline__title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .pipeline__subtitle {
    font-size: 1.3rem;
    font-weight: 500;
    color: #3498db;
    margin-bottom: 1rem;
  }

  .pipeline__description {
    font-size: 1.1rem;
    color: #5a6c7d;
    line-height: 1.6;
    max-width: 700px;
    margin: 0 auto;
  }

  .pipeline__content {
    display: grid;
    gap: 3rem;
  }

  .pipeline__section {
    margin-bottom: 2rem;
  }

  .pipeline__section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e1e5e9;
  }

  /* Стили для ключевых возможностей - 2 колонки на десктопе */
  .pipeline__features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .pipeline__feature {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .pipeline__feature:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }

  .pipeline__feature-icon {
    width: 24px;
    height: 24px;
    background: #27ae60;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .pipeline__feature-text {
    line-height: 1.5;
    color: #2c3e50;
    font-size: 1rem;
  }

  /* Стили для процесса */
  .pipeline__process {
    display: grid;
    gap: 2rem;
  }

  .pipeline__process-step {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .pipeline__step-number {
    width: 32px;
    height: 32px;
    background: #3498db;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border-radius: 50%;
    flex-shrink: 0;
    font-size: 0.9rem;
  }

  .pipeline__step-content {
    flex: 1;
  }

  .pipeline__step-content h4 {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .pipeline__step-content p {
    color: #5a6c7d;
    line-height: 1.6;
    margin: 0;
  }

  /* Стили для архитектуры */
  .pipeline__architecture {
    display: grid;
    gap: 1rem;
  }

  .pipeline__architecture-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem 0;
    border-bottom: 1px solid #f1f3f4;
  }

  .pipeline__architecture-item:last-child {
    border-bottom: none;
  }

  .pipeline__arch-content {
    flex: 1;
    line-height: 1.5;
    color: #2c3e50;
  }

  .pipeline__arch-content strong {
    color: #2c3e50;
  }

  /* Стили для преимуществ - 2 колонки на десктопе */
  .pipeline__benefits {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .pipeline__benefit {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .pipeline__benefit:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }

  .pipeline__benefit-text {
    flex: 1;
    line-height: 1.5;
    color: #2c3e50;
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .pipeline {
      padding: 1rem 0.5rem;
    }

    .pipeline__title {
      font-size: 2rem;
    }

    /* На мобильных - одна колонка */
    .pipeline__features {
      grid-template-columns: 1fr;
    }

    .pipeline__benefits {
      grid-template-columns: 1fr;
    }

    .pipeline__process-step {
      gap: 1rem;
    }

    .pipeline__step-number {
      width: 28px;
      height: 28px;
      font-size: 0.8rem;
    }

    .pipeline__step-content h4 {
      font-size: 1rem;
    }

    .pipeline__step-content p {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .pipeline__title {
      font-size: 1.75rem;
    }

    .pipeline__section-title {
      font-size: 1.3rem;
    }

    .pipeline__feature,
    .pipeline__architecture-item,
    .pipeline__benefit {
      gap: 0.75rem;
    }

    .pipeline__feature,
    .pipeline__benefit {
      padding: 0.75rem;
    }
  }

  /* Для очень маленьких экранов */
  @media (max-width: 360px) {
    .pipeline__feature,
    .pipeline__benefit {
      padding: 0.5rem;
    }

    .pipeline__feature-text,
    .pipeline__benefit-text {
      font-size: 0.9rem;
    }
  }
</style>
