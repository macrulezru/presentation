<script setup lang="ts">
  import FeatureItem from '@/view/components/features/parts/feature-item/feature-item.vue'

  import '@/view/components/features/features.scss'

  import { useFeatures } from '@/view/composables/use-features.ts'

  const { features } = useFeatures()
</script>

<template>
  <section class="features">
    <div class="features__container">
      <div class="features__list">
        <FeatureItem v-for="feature in features" :key="feature.id" :feature="feature" />
      </div>
    </div>
  </section>
</template>
