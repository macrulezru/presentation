<script setup lang="ts">
  import FeatureItem from '@/view/components/feature-item.vue'

  import { useFeatures } from '@/view/composables/useFeatures'

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

<style scoped>
  .features {
    padding: var(--spacing-2xl) 0;
    background: var(--color-bg-primary);
  }

  .features__container {
    max-width: var(--container-xl);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .features__list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3xl);
  }

  @media (max-width: 768px) {
    .features {
      padding: var(--spacing-xl) 0;
    }

    .features__list {
      gap: var(--spacing-2xl);
    }
  }

  @media (max-width: 480px) {
    .features__list {
      gap: var(--spacing-xl);
    }
  }
</style>
