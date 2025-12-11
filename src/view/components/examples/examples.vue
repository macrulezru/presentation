<script setup lang="ts">
  import FeatureItem from '@/view/components/examples/parts/feature-item/feature-item.vue'

  import '@/view/components/examples/examples.scss'

  import { useI18n } from '@/view/composables/use-i18n.ts'
  import { useFeatures } from '@/view/composables/use-features.ts'

  const { t } = useI18n()

  const { features } = useFeatures()
</script>

<template>
  <div>
    <h3 class="examples__title">{{ t('app.examples_title') }}</h3>
    <div class="examples__demonstration">
      <div class="examples__demonstration-container">
        <div class="examples__demonstration-content">
          <h2 class="examples__demonstration-title">
            {{ t('demonstration.title') }}
          </h2>
          <p class="examples__demonstration-description">
            {{ t('demonstration.description') }}
          </p>
          <p class="examples__demonstration-readiness">
            {{ t('demonstration.readiness') }}
          </p>
        </div>
      </div>
    </div>
    <div class="examples__features">
      <div class="examples__features-container">
        <div class="examples__features-list">
          <FeatureItem v-for="feature in features" :key="feature.id" :feature="feature" />
        </div>
      </div>
    </div>
  </div>
</template>
