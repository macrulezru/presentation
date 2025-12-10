<script setup lang="ts">
  import '@/view/components/testing/testing.scss'

  const { t } = useI18n()

  const demonstrationData = computed(() => ({
    title: t('demonstration.title'),
    description: t('demonstration.description'),
    readiness: t('demonstration.readiness'),
  }))
</script>

<template>
  <section class="demonstration">
    <div class="demonstration__container">
      <div class="demonstration__content">
        <h2 class="demonstration__title">
          {{ demonstrationData.title }}
        </h2>
        <p class="demonstration__description">
          {{ demonstrationData.description }}
        </p>
        <p class="demonstration__readiness">
          {{ demonstrationData.readiness }}
        </p>
      </div>
    </div>
  </section>
</template>
