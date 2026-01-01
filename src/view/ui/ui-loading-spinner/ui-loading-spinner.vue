<script setup lang="ts">
  import '@/view/ui/ui-loading-spinner/ui-loading-spinner.scss';

  import type { Props } from './types';

  import { i18n } from '@/locales';

  // Используем глобальный i18n напрямую, чтобы не зависеть от инъекций
  const t = (key: string, values?: Record<string, unknown>) =>
    values ? i18n.global.t(key, values) : i18n.global.t(key);

  withDefaults(defineProps<Props>(), {
    size: 'medium',
    showText: true,
    textKey: 'common.loading',
  });
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
