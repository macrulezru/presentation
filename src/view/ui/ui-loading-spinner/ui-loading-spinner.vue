<script setup lang="ts">
  import '@/view/ui/ui-loading-spinner/ui-loading-spinner.scss'

  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  interface Props {
    /** Размер индикатора */
    size?: 'small' | 'medium' | 'large'

    /** Показывать текст загрузки */
    showText?: boolean

    /** Ключ перевода для текста */
    textKey?: string
  }

  withDefaults(defineProps<Props>(), {
    size: 'medium',
    showText: true,
    textKey: 'common.loading',
  })
</script>

<template>
  <div class="ui-loading-spinner" :class="size">
    <div class="ui-loading-spinner__spinner"></div>
    <p v-if="showText" class="ui-loading-spinner__text">
      {{ t(textKey) }}
    </p>
    <p v-else-if="$slots.default" class="ui-loading-spinner__text">
      <slot />
    </p>
  </div>
</template>
