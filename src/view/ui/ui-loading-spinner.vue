<script setup lang="ts">
  const { t } = useI18n()

  interface Props {
    size?: 'small' | 'medium' | 'large'
    showText?: boolean
    textKey?: string
  }

  withDefaults(defineProps<Props>(), {
    size: 'medium',
    showText: true,
    textKey: 'common.loading',
  })
</script>

<template>
  <div class="dlv-loading-spinner" :class="size">
    <div class="dlv-loading-spinner__spinner"></div>
    <p v-if="showText" class="dlv-loading-spinner__text">
      {{ t(textKey) }}
    </p>
    <p v-else-if="$slots.default" class="dlv-loading-spinner__text">
      <slot />
    </p>
  </div>
</template>

<style lang="scss" scoped>
  .dlv-loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 400px;
    padding: var(--spacing-xl);
  }

  .dlv-loading-spinner__spinner {
    border: 3px solid var(--color-border-light);
    border-top-color: var(--color-secondary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-md);
  }

  .dlv-loading-spinner.small .dlv-loading-spinner__spinner {
    width: 24px;
    height: 24px;
  }

  .dlv-loading-spinner.medium .dlv-loading-spinner__spinner {
    width: 48px;
    height: 48px;
  }

  .dlv-loading-spinner.large .dlv-loading-spinner__spinner {
    width: 64px;
    height: 64px;
  }

  .dlv-loading-spinner__text {
    color: var(--color-text-secondary);
    text-align: center;
    margin: 0;
    font-size: var(--font-size-base);
  }

  .dlv-loading-spinner.small .dlv-loading-spinner__text {
    font-size: var(--font-size-sm);
  }

  .dlv-loading-spinner.large .dlv-loading-spinner__text {
    font-size: var(--font-size-lg);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
