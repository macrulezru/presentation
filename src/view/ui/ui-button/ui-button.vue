<script setup lang="ts">
  import '@/view/ui/ui-button/ui-button.scss';

  import type { Props, Emits } from './types';

  const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    active: false,
    focused: false,
    size: 'md',
  });

  const emit = defineEmits<Emits>();

  const handleClick = (event: MouseEvent) => {
    if (!props.disabled) {
      emit('click', event);
    }
  };

  const handleFocus = () => {
    emit('focus');
  };

  const handleBlur = () => {
    emit('blur');
  };

  const handleKeydown = (event: KeyboardEvent) => {
    emit('keydown', event);
  };
</script>

<template>
  <button
    class="ui-button"
    :class="{
      'ui-button_disabled': disabled,
      'ui-button_active': active,
      'ui-button_focused': focused,
      [`ui-button_size-${size}`]: true,
    }"
    :disabled="disabled"
    :title="title"
    :aria-disabled="ariaDisabled ?? disabled"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
  >
    <slot>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-if="label" v-html="label"></span>
    </slot>
  </button>
</template>
