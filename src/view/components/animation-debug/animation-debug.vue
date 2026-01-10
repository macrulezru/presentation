<script setup lang="ts">
  import './animation-debug.scss';

  import { ref, onMounted, watch } from 'vue';

  const props = defineProps<{ targetEl: HTMLElement | null }>();

  const animationInfo = ref<string>('');

  const checkAnimation = () => {
    if (!props.targetEl) {
      animationInfo.value = 'Элемент не передан';
      return;
    }
    const style = getComputedStyle(props.targetEl);
    const anim = style.animation;
    if (anim && anim !== 'none') {
      animationInfo.value = `animation: ${anim}`;
    } else {
      animationInfo.value = 'У элемента нет анимации';
    }
  };

  watch(() => props.targetEl, checkAnimation);

  onMounted(checkAnimation);
</script>

<template>
  <div class="animation-debug">
    <div class="animation-debug__info">
      {{ animationInfo }}
    </div>
  </div>
</template>
