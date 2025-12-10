<script setup lang="ts">
  import '@/view/ui/ui-loading-spinner/ui-loading-spinner.scss'

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
