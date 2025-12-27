<script setup lang="ts">
  import '@/view/components/remote-workplace/remote-workplace.scss';

  import { computed } from 'vue';

  import { useI18n } from '@/view/composables/use-i18n.ts';

  const { t, tm } = useI18n();

  const features = computed(() => tm('remote_workplace.features.items'));

  const benefits = computed(() => tm('remote_workplace.benefits.items'));
</script>

<template>
  <div class="remote-workplace">
    <div class="remote-workplace__container">
      <!-- Заголовок -->
      <header class="remote-workplace__header">
        <h2 class="remote-workplace__title">
          {{ t('remote_workplace.title') }}
        </h2>
        <p class="remote-workplace__subtitle">
          {{ t('remote_workplace.subtitle') }}
        </p>
        <p class="remote-workplace__description">
          {{ t('remote_workplace.description') }}
        </p>
      </header>

      <!-- Основной контент -->
      <div class="remote-workplace__content">
        <!-- Особенности -->
        <div class="remote-workplace__features-section">
          <div class="remote-workplace__features-grid">
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="remote-workplace__feature-item"
            >
              <div class="remote-workplace__feature-content">
                <div
                  class="remote-workplace__feature-icon"
                  :class="`remote-workplace__feature-icon__${feature.icon}`"
                />
                <h3 class="remote-workplace__feature-title">{{ feature.title }}</h3>
                <p class="remote-workplace__feature-description">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Преимущества -->
        <div class="remote-workplace__benefits-section">
          <h3 class="remote-workplace__section-title">
            {{ t('remote_workplace.benefits_title') }}
          </h3>
          <div class="remote-workplace__benefits-list">
            <div
              v-for="(benefit, index) in benefits"
              :key="index"
              class="remote-workplace__benefit-item"
            >
              {{ benefit }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
