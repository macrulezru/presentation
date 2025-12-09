<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from '@/view/composables/use-i18n.ts'

  const { t, tm } = useI18n()

  const workplaceData = computed(() => ({
    title: t('remote_workplace.title'),
    subtitle: t('remote_workplace.subtitle'),
    description: t('remote_workplace.description'),
    features: tm('remote_workplace.features.items'),
    benefitsTitle: t('remote_workplace.benefits_title'),
    benefits: tm('remote_workplace.benefits.items'),
  }))
</script>

<template>
  <section class="remote-workplace">
    <div class="remote-workplace__container">
      <!-- Заголовок -->
      <header class="remote-workplace__header">
        <h2 class="remote-workplace__title">
          {{ workplaceData.title }}
        </h2>
        <p class="remote-workplace__subtitle">
          {{ workplaceData.subtitle }}
        </p>
        <p class="remote-workplace__description">
          {{ workplaceData.description }}
        </p>
      </header>

      <!-- Основной контент -->
      <div class="remote-workplace__content">
        <!-- Особенности -->
        <div class="features-section">
          <div class="features-grid">
            <div
              v-for="(feature, index) in workplaceData.features"
              :key="index"
              class="feature-item"
            >
              <div class="feature-content">
                <div class="feature-icon" :class="`feature-icon__${feature.icon}`" />
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Преимущества -->
        <div class="benefits-section">
          <h3 class="section-title">{{ workplaceData.benefitsTitle }}</h3>
          <div class="benefits-list">
            <div
              v-for="(benefit, index) in workplaceData.benefits"
              :key="index"
              class="benefit-item"
            >
              {{ benefit }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .remote-workplace {
    padding: 5rem 0 var(--spacing-2xl);
    background-color: #1b232b;
    color: var(--color-text-light);
  }

  .remote-workplace__container {
    @include container-lg;
  }

  .remote-workplace__header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .remote-workplace__title {
    font-size: 2.25rem;
    font-weight: var(--font-weight-bold);
    margin-bottom: 0.75rem;
    line-height: 1.2;
    color: var(--color-text-light);
  }

  .remote-workplace__subtitle {
    font-size: 1.25rem;
    font-weight: var(--font-weight-medium);
    margin-bottom: 1rem;
    color: var(--color-text-light);
  }

  .remote-workplace__description {
    font-size: 1.125rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
    color: #8193aa;
    opacity: 0.9;
  }

  .features-section {
    margin-bottom: 3rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1.5rem 0;
  }

  .feature-icon {
    margin-bottom: 1.5rem;
    height: 5rem;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
  }

  .feature-icon__workstation {
    background-image: url('@/view/assets/images/workstation-icon.svg');
  }

  .feature-icon__monitors {
    background-image: url('@/view/assets/images/monitors-icon.svg');
  }

  .feature-icon__internet {
    background-image: url('@/view/assets/images/internet-icon.svg');
  }

  .feature-icon__webcam {
    background-image: url('@/view/assets/images/webcam-icon.svg');
  }

  .feature-content {
    flex: 1;
  }

  .feature-title {
    margin-bottom: 0.5rem;
    font-size: 1.125rem;
    font-weight: var(--font-weight-semibold);
    text-align: center;
    line-height: 1.4;
    color: var(--color-text-light);
  }

  .feature-description {
    text-align: center;
    line-height: 1.5;
    margin: 0;
    color: #8193aa;
    opacity: 0.8;
  }

  .benefits-section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-semibold);
    text-align: center;
    margin-bottom: 2rem;
    color: var(--color-text-light);
  }

  .benefits-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .benefit-item {
    padding: 1rem 1.5rem;
    line-height: 1.5;
    position: relative;
    padding-left: 2rem;
    color: var(--color-text-light);
    opacity: 0.9;
  }

  .benefit-item::before {
    content: '—';
    position: absolute;
    left: 0.5rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-accent-green);
  }

  @include media-tablet {
    .remote-workplace {
      padding: 3rem 0.5rem;
    }

    .remote-workplace__title {
      font-size: 2rem;
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .feature-item {
      padding: 1rem 0;
      gap: 1rem;
    }

    .benefits-list {
      grid-template-columns: 1fr;
    }

    .feature-icon {
      margin-bottom: 1rem;
      height: 4rem;
    }
  }

  @include media-mobile {
    .remote-workplace__container {
      padding: 0 1rem;
    }

    .remote-workplace__title {
      font-size: 1.75rem;
    }
  }
</style>
