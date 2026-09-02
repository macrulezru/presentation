<script setup lang="ts">
  import '@/view/components/remote-workplace/remote-workplace.scss';

  import { computed } from 'vue';

  import RemoveWorkplaceImageHorizontal from '@/view/assets/images/remote-workstation-horizontal.webp';
  import RemoveWorkplaceImage from '@/view/assets/images/remote-workstation.webp';
  import UiImage from '@/view/ui/ui-image/ui-image.vue';
  import { useI18n } from '~/composables/useI18n';

  const { t, tm } = useI18n();

  type WorkplaceFeature = { icon?: string; title?: string; description?: string };

  const features = computed<WorkplaceFeature[]>(
    () => (tm('remote_workplace.features.items') as WorkplaceFeature[]) || [],
  );

  const benefits = computed<string[]>(
    () => (tm('remote_workplace.benefits.items') as string[]) || [],
  );
</script>

<template>
  <div class="remote-workplace">
    <div class="remote-workplace__container">
      <!-- Заголовок -->
      <div class="remote-workplace__header">
        <div class="remote-workplace__title">
          {{ t('remote_workplace.title') }}
        </div>
        <div class="remote-workplace__subtitle">
          {{ t('remote_workplace.subtitle') }}
        </div>
        <div class="remote-workplace__description">
          {{ t('remote_workplace.description') }}
        </div>
      </div>

      <!-- Основной контент -->
      <div class="remote-workplace__content">
        <!-- Особенности -->
        <div class="remote-workplace__features-section">
          <div class="remote-workplace__features-image-container">
            <UiImage
              :image="{
                src: { src: RemoveWorkplaceImage, width: '600', height: '400' },
                tablet: {
                  src: RemoveWorkplaceImageHorizontal,
                  width: '800px',
                  height: '450px',
                },
                alt: 'Workstation',
              }"
              class="feature-item__image"
            />
          </div>
          <div class="remote-workplace__side-column">
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
                  <div class="remote-workplace__feature-title">{{ feature.title }}</div>
                  <div class="remote-workplace__feature-description">
                    {{ feature.description }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Преимущества -->
            <div class="remote-workplace__benefits-section">
              <div class="remote-workplace__section-title">
                {{ t('remote_workplace.benefits_title') }}
              </div>
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
    </div>
  </div>
</template>
