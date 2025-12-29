<script setup lang="ts">
  import './ui-tumbler.scss';

  const props = withDefaults(
    defineProps<{
      shortcut?: string;
      active?: boolean;
      ariaLabel?: string;
    }>(),
    {
      shortcut: '',
      active: false,
      ariaLabel: '',
    },
  );

  const emit = defineEmits<{ (e: 'toggle'): void }>();

  const handleClick = () => emit('toggle');
</script>

<template>
  <button
    class="ui-tumbler"
    :class="{ 'ui-tumbler--active': props.active }"
    type="button"
    :aria-label="props.ariaLabel || undefined"
    @click="handleClick"
  >
    <span class="ui-tumbler__badge" aria-hidden="true">
      <span class="ui-tumbler__dot" />
    </span>
    <span v-if="$slots.default" class="ui-tumbler__label">
      <slot />
    </span>
  </button>
</template>
