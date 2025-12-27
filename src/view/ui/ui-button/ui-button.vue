<script setup lang="ts">
  import '@/view/ui/ui-button/ui-button.scss';

  import { computed } from 'vue';

  import type { Props } from './types';

  const props = defineProps<Props>();

  /**
   * Вычисляемые CSS-классы для кнопки
   */
  const classes = computed(() => {
    return {
      'ui-button_full-width': props.fullWidth,
      'ui-button_small': props.small,
      'ui-button_micro': props.micro,
      'ui-button_disabled': props.disabled,
      'ui-button_gray': props.gray,
      'ui-button_reset': props.reset,
      'ui-button_control': props.control,
    };
  });
</script>

<template>
  <button class="ui-button" :class="classes" :disabled="disabled">
    <slot>
      {{ props.text }}
    </slot>
  </button>
</template>
