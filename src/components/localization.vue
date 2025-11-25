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
</template>

<style scoped>
  .localization {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .localization__header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .localization__title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .localization__subtitle {
    font-size: 1.3rem;
    font-weight: 500;
    color: #3498db;
    margin-bottom: 1rem;
  }

  .localization__description {
    font-size: 1.1rem;
    color: #5a6c7d;
    line-height: 1.6;
    max-width: 700px;
    margin: 0 auto;
  }

  .localization__content {
    display: grid;
    gap: 3rem;
  }

  .localization__section {
    margin-bottom: 2rem;
  }

  .localization__section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e1e5e9;
  }

  /* Стили для ключевых возможностей - 2 колонки на десктопе */
  .localization__features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .localization__feature {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .localization__feature:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }

  .localization__feature-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .localization__feature-text {
    line-height: 1.5;
    color: #2c3e50;
    font-size: 1rem;
  }

  /* Стили для процесса */
  .localization__process {
    display: grid;
    gap: 2rem;
  }

  .localization__process-step {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .localization__step-number {
    width: 32px;
    height: 32px;
    background: #9b59b6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border-radius: 50%;
    flex-shrink: 0;
    font-size: 0.9rem;
  }

  .localization__step-content {
    flex: 1;
  }

  .localization__step-content h4 {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .localization__step-content p {
    color: #5a6c7d;
    line-height: 1.6;
    margin: 0;
  }

  /* Стили для архитектуры */
  .localization__architecture {
    display: grid;
    gap: 1rem;
  }

  .localization__architecture-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem 0;
    border-bottom: 1px solid #f1f3f4;
  }

  .localization__architecture-item:last-child {
    border-bottom: none;
  }

  .localization__arch-content {
    flex: 1;
    line-height: 1.5;
    color: #2c3e50;
  }

  .localization__arch-content strong {
    color: #2c3e50;
  }

  /* Стили для преимуществ - 2 колонки на десктопе */
  .localization__benefits {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .localization__benefit {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .localization__benefit:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }

  .localization__benefit-text {
    flex: 1;
    line-height: 1.5;
    color: #2c3e50;
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .localization {
      padding: 1rem 0.5rem;
    }

    .localization__title {
      font-size: 2rem;
    }

    /* На мобильных - одна колонка */
    .localization__features {
      grid-template-columns: 1fr;
    }

    .localization__benefits {
      grid-template-columns: 1fr;
    }

    .localization__process-step {
      gap: 1rem;
    }

    .localization__step-number {
      width: 28px;
      height: 28px;
      font-size: 0.8rem;
    }

    .localization__step-content h4 {
      font-size: 1rem;
    }

    .localization__step-content p {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .localization__title {
      font-size: 1.75rem;
    }

    .localization__section-title {
      font-size: 1.3rem;
    }

    .localization__feature,
    .localization__architecture-item,
    .localization__benefit {
      gap: 0.75rem;
    }

    .localization__feature,
    .localization__benefit {
      padding: 0.75rem;
    }
  }

  /* Для очень маленьких экранов */
  @media (max-width: 360px) {
    .localization__feature,
    .localization__benefit {
      padding: 0.5rem;
    }

    .localization__feature-text,
    .localization__benefit-text {
      font-size: 0.9rem;
    }
  }
</style>
