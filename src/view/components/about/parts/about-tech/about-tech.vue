<!-- @/view/components/about-tech.vue -->
<script setup lang="ts">
  import { ref } from 'vue';

  import { useTechAnimation } from '@/view/composables/use-tech/';

  const containerRef = ref<HTMLElement>();

  // Используем Canvas анимацию
  // Композиция сама подключает useResponsive и useI18n, автоматически переключает режим траектории
  const { canvasRef, isLoading } = useTechAnimation({
    containerRef,
  });
</script>

<template>
  <section ref="containerRef" class="about-tech">
    <div class="about-tech__canvas-container">
      <canvas v-if="!isLoading" ref="canvasRef" class="about-tech__canvas" />
      <div v-else class="about-tech__loading">
        <!-- Лоадер -->
      </div>
    </div>
  </section>
</template>
