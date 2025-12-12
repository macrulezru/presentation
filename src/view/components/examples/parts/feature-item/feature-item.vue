<script setup lang="ts">
  import '@/view/components/examples/parts/feature-item/feature-item.scss'

  import type { FeatureData } from '@/view/composables/use-features.ts'
  import { useColorGradient } from '@/view/composables/use-color-gradient'

  const { createGradient } = useColorGradient()

  interface Props {
    feature: FeatureData
  }

  defineProps<Props>()

  const gradientOptions = { offsetPercent: 50 }

  const getGradientStyle = (color: string) => {
    return `background: ${createGradient(color, gradientOptions)}`
  }
</script>

<template>
  <div class="feature-item" :data-feature-id="feature.id">
    <div class="feature-item__container">
      <div class="feature-item__header">
        <div class="feature-item__main-icon">
          <span
            class="feature-item__main-icon-background"
            :style="getGradientStyle(feature.accentColor)"
          />
          <span
            class="feature-item__main-icon-item"
            :class="`feature-item__main-icon_${feature.icon}`"
          />
        </div>
        <div class="feature-item__header-text">
          <h2 class="feature-item__title">{{ feature.title }}</h2>
          <p class="feature-item__subtitle" :style="{ color: feature.accentColor }">
            {{ feature.subtitle }}
          </p>
          <p class="feature-item__description">{{ feature.description }}</p>
        </div>
      </div>

      <div class="feature-item__content">
        <!-- Ключевые возможности -->
        <div class="feature-item__section">
          <h3 class="feature-item__section-title">{{ feature.features.title }}</h3>
          <div class="feature-item__features">
            <div
              v-for="(item, index) in feature.features.items"
              :key="index"
              class="feature-item__feature"
            >
              <div class="feature-item__feature-icon">{{ feature.featureIcon }}</div>
              <div class="feature-item__feature-text">{{ item }}</div>
            </div>
          </div>
        </div>

        <!-- Процесс работы -->
        <div class="feature-item__section">
          <h3 class="feature-item__section-title">{{ feature.process.title }}</h3>
          <div class="feature-item__process">
            <div
              v-for="(step, index) in feature.process.steps"
              :key="index"
              class="feature-item__process-step"
            >
              <div
                class="feature-item__step-number"
                :style="{ background: feature.accentColor }"
              >
                {{ index + 1 }}
              </div>
              <div class="feature-item__step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Архитектурные компоненты -->
        <div class="feature-item__section">
          <h3 class="feature-item__section-title">{{ feature.architecture.title }}</h3>
          <div class="feature-item__architecture">
            <div
              v-for="(item, index) in feature.architecture.items"
              :key="index"
              class="feature-item__architecture-item"
            >
              <div class="feature-item__arch-content">
                <strong>{{ item.name }}</strong>
                - {{ item.description }}
              </div>
            </div>
          </div>
        </div>

        <!-- Преимущества подхода -->
        <div class="feature-item__section">
          <h3 class="feature-item__section-title">{{ feature.benefits.title }}</h3>
          <div class="feature-item__benefits">
            <div
              v-for="(benefit, index) in feature.benefits.items"
              :key="index"
              class="feature-item__benefit"
            >
              <div class="feature-item__benefit-text">{{ benefit }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
