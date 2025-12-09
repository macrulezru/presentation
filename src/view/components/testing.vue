<script setup lang="ts">
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

<style lang="scss" scoped>
  .demonstration {
    padding: var(--spacing-3xl) 0;
    background: var(--color-bg-secondary);
  }

  .demonstration__container {
    @include container-lg;
  }

  .demonstration__content {
    text-align: center;
    max-width: var(--container-sm);
    margin: 0 auto;
  }

  .demonstration__title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-lg);
    line-height: 1.3;
  }

  .demonstration__description {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: var(--spacing-lg);
  }

  .demonstration__readiness {
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    line-height: 1.6;
    background: var(--color-bg-primary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
  }

  @include media-tablet {
    .demonstration {
      padding: var(--spacing-lg) 0;
    }

    .demonstration__container {
      padding: 0 var(--spacing-lg);
    }

    .demonstration__title {
      font-size: var(--font-size-2xl);
    }

    .demonstration__description,
    .demonstration__readiness {
      font-size: var(--font-size-md);
    }

    .demonstration__readiness {
      padding: var(--spacing-md);
    }
  }

  @include media-mobile {
    .demonstration__container {
      padding: 0 var(--spacing-md);
    }

    .demonstration__title {
      font-size: var(--font-size-xl);
    }
  }
</style>
