<script setup lang="ts">
  import '@/view/components/examples/parts/feature-item/feature-item.scss';

  import { useLinearGradient, useRadialGradient } from 'css-magic-gradient/vue';
  import { computed, ref } from 'vue';

  import type { GradientOptions, GradientColors, headerGradientOptions } from './types';
  import type { FeatureData } from '~/composables/useFeatures';

  import UiImage from '@/view/ui/ui-image/ui-image.vue';
  import { useResponsive } from '~/composables/useResponsive';

  interface Props {
    feature: FeatureData;
    reverse?: boolean;
  }

  const props = defineProps<Props>();

  const isReverse = computed(() => props.reverse === true);

  const responsive = useResponsive();
  const headerPortalRef = ref<HTMLElement>();
  const gradientOptions = { offsetPercent: 50 };

  const getGradientStyle = (color: string, options: GradientOptions = {}) => {
    const { shadow = false } = options;

    const gradient = useLinearGradient(color, gradientOptions);
    const styles = [`background: ${gradient.value}`];

    if (shadow) {
      styles.push(`filter: drop-shadow(0 10px 10px ${color})`);
    }

    return styles.join('; ');
  };

  const headerGradientOptions: headerGradientOptions = {
    useCustomColors: true,
    shape: 'ellipse',
    size: { width: '80%', height: '600px' },
    position: '50% -50px',
  };

  const getHeaderGradientStyle = (
    color: string,
    customColors?: Array<GradientColors>,
  ) => {
    const options: headerGradientOptions = {
      ...headerGradientOptions,
      colors: customColors || [
        { color, opacity: 0.3, position: '0%' },
        { color, opacity: 0, position: '100%' },
      ],
    };
    const gradient = useRadialGradient(color, options);
    return `background-image: ${gradient.value}`;
  };
</script>

<template>
  <div
    class="feature-item"
    :style="getHeaderGradientStyle(feature.accentColor)"
    :data-feature-id="feature.id"
  >
    <div class="feature-item__container">
      <div
        class="feature-item__header"
        :class="{ 'feature-item__header_reverse': isReverse && responsive.desktop }"
      >
        <div
          v-if="!responsive.desktop"
          ref="headerPortalRef"
          class="feature-item__main-header"
        ></div>
        <div class="feature-item__image-container">
          <UiImage
            :image="{
              src: { src: feature.image, width: '650px' },
              tablet: { src: feature.imageHorizontal, width: '800px', height: '450px' },
              alt: '',
            }"
            class="feature-item__image"
          />
        </div>
        <div class="feature-item__side-block">
          <div class="feature-item__side-block-wrapper">
            <Teleport
              :to="headerPortalRef"
              :disabled="responsive.desktop || !headerPortalRef"
            >
              <div class="feature-item__side-block-header">
                <div class="feature-item__title">{{ feature.title }}</div>
                <div class="feature-item__description">{{ feature.description }}</div>
              </div>
            </Teleport>
            <div class="feature-item__section">
              <div class="feature-item__section-title">{{ feature.features.title }}</div>
              <div class="feature-item__features">
                <div
                  v-for="(item, key) in feature.features.items"
                  :key="key"
                  class="feature-item__feature"
                >
                  <div
                    class="feature-item__feature-bullet"
                    :style="{ 'background-color': feature.accentColor }"
                  />
                  <div class="feature-item__feature-text">
                    <div class="feature-item__feature-title">{{ item.title }}</div>
                    <div class="feature-item__feature-description">
                      {{ item.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-item__content">
        <div class="feature-item__section-group">
          <div class="feature-item__section feature-item__section_process">
            <h3 class="feature-item__section-title">{{ feature.process.title }}</h3>
            <div class="feature-item__process">
              <div
                v-for="(step, index) in feature.process.steps"
                :key="index"
                class="feature-item__process-step"
              >
                <span
                  v-if="index < feature.process.steps.length - 1"
                  class="feature-item__process-line"
                  :style="`color: ${feature.accentColor}`"
                />
                <div
                  class="feature-item__step-number"
                  :style="getGradientStyle(feature.accentColor)"
                >
                  {{ index + 1 }}
                </div>
                <div class="feature-item__step-content">
                  <div class="feature-item__step-title">{{ step.title }}</div>
                  <div class="feature-item__step-description">{{ step.description }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="feature-item__section-group-separator" />

          <div class="feature-item__section feature-item__section_architecture">
            <div class="feature-item__section-title">
              {{ feature.architecture.title }}
            </div>
            <div class="feature-item__architecture">
              <div
                v-for="(item, index) in feature.architecture.items"
                :key="index"
                class="feature-item__architecture-item"
              >
                <span class="feature-item__architecture-item-title">{{ item.name }}</span>
                <span class="feature-item__architecture-item-description">
                  {{ item.description }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="feature-item__section">
          <div class="feature-item__section-title">{{ feature.benefits.title }}</div>
          <div class="feature-item__benefits">
            <div
              v-for="(benefit, index) in feature.benefits.items"
              :key="index"
              class="feature-item__benefit"
            >
              <div
                class="feature-item__benefit-bar"
                :style="{ backgroundColor: feature.accentColor }"
              />
              <div class="feature-item__benefit-text">{{ benefit }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <slot />
  </div>
</template>
