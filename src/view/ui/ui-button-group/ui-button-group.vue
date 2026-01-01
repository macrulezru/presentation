<script setup lang="ts">
  import '@/view/ui/ui-button-group/ui-button-group.scss';

  import { computed, ref } from 'vue';

  import type { Props, ButtonConfig } from './types';

  import UiButton from '@/view/ui/ui-button/ui-button.vue';

  const props = withDefaults(defineProps<Props>(), {
    mode: 'row',
    border: true,
    radius: 8,
    theme: 'light',
    size: 'md',
  });

  const focusedButtonId = ref<string | null>(null);

  /**
   * Handles button click
   */
  const handleClick = (button: ButtonConfig) => {
    if (!button.disabled && button.action) {
      button.action();
    }
  };

  /**
   * Handles keyboard navigation
   */
  const handleKeydown = (event: KeyboardEvent, index: number, button: ButtonConfig) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleClick(button);
        break;
      case 'ArrowRight':
        if (props.mode === 'row') {
          event.preventDefault();
          focusNextButton(index);
        }
        break;
      case 'ArrowLeft':
        if (props.mode === 'row') {
          event.preventDefault();
          focusPreviousButton(index);
        }
        break;
      case 'ArrowDown':
        if (props.mode === 'column') {
          event.preventDefault();
          focusNextButton(index);
        }
        break;
      case 'ArrowUp':
        if (props.mode === 'column') {
          event.preventDefault();
          focusPreviousButton(index);
        }
        break;
    }
  };

  /**
   * Focus next button
   */
  const focusNextButton = (currentIndex: number) => {
    let nextIndex = currentIndex + 1;
    while (nextIndex < props.buttons.length) {
      const nextButton = props.buttons[nextIndex];
      if (nextButton && !nextButton.disabled) {
        focusedButtonId.value = nextButton.id;
        return;
      }
      nextIndex++;
    }
  };

  /**
   * Focus previous button
   */
  const focusPreviousButton = (currentIndex: number) => {
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0) {
      const prevButton = props.buttons[prevIndex];
      if (prevButton && !prevButton.disabled) {
        focusedButtonId.value = prevButton.id;
        return;
      }
      prevIndex--;
    }
  };

  /**
   * Compute container classes
   */
  const containerClasses = computed(() => {
    return {
      [`ui-button-group_theme-${props.theme}`]: true,
      [`ui-button-group_${props.mode}`]: true,
      'ui-button-group_no-border': !props.border,
    };
  });

  /**
   * Compute button classes
   */
  const getButtonClasses = (button: ButtonConfig) => {
    return {
      ...(button.class ? { [button.class]: true } : {}),
    };
  };

  /**
   * Container style for border radius
   */
  const containerStyle = computed(() => {
    return {
      '--btn-group-radius': `${props.radius}px`,
    } as Record<string, string>;
  });
</script>

<template>
  <div
    class="ui-button-group"
    :class="containerClasses"
    :style="containerStyle"
    :role="'group'"
    :aria-label="ariaLabel"
  >
    <UiButton
      v-for="(button, index) in buttons"
      :key="button.id"
      class="ui-button-group__button"
      :class="getButtonClasses(button)"
      :label="button.label"
      :disabled="button.disabled"
      :title="button.title"
      :active="button.active"
      :focused="focusedButtonId === button.id"
      :size="size"
      :aria-disabled="button.disabled"
      @click="handleClick(button)"
      @keydown="handleKeydown($event, index, button)"
      @focus="focusedButtonId = button.id"
      @blur="focusedButtonId = null"
    />
  </div>
</template>
