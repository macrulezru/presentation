<script setup lang="ts">
  import { ref } from 'vue';
  import './metrics-tooltip.scss';

  interface Props {
    visible: boolean;
    x: number;
    y: number;
    label: string;
    value: string;
  }

  defineProps<Props>();

  const rootElement = ref<HTMLElement | null>(null);

  defineExpose({
    get offsetWidth() {
      return rootElement.value?.offsetWidth ?? 0;
    },
    closest(selector: string) {
      return rootElement.value?.closest(selector);
    },
  });
</script>

<template>
  <div
    ref="rootElement"
    class="metrics-tooltip"
    :class="{ 'is-visible': visible }"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
    }"
  >
    <div class="metrics-tooltip__label">{{ label }}</div>
    <div class="metrics-tooltip__value">{{ value }}</div>
  </div>
</template>
