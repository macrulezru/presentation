<!-- @/view/components/about-tech.vue -->
<script setup lang="ts">
  import '@/view/components/about/parts/about-tech/about-tech.scss';

import { useResponsive } from '~/composables/useResponsive';
  import { ref, onMounted, watch } from 'vue';

  import { useTechAnimation, setCanvasMaxWidth } from '@/view/composables/use-tech/';

  const containerRef = ref<HTMLElement>();

  const responsive = useResponsive();
  const { canvasRef: _canvasRef, isLoading } = useTechAnimation({
    containerRef,
  });

  watch(
    [() => responsive.desktop, () => responsive.tablet, () => responsive.mobile],
    () => {
      // При изменении размера экрана можно обновить максимальную ширину canvas
      setupCanvasWidth();
    },
  );

  const setupCanvasWidth = () => {
    if (responsive.desktop) {
      setCanvasMaxWidth(1000);
    } else if (responsive.tablet) {
      setCanvasMaxWidth(500);
    } else if (responsive.mobile) {
      setCanvasMaxWidth(400);
    }
  };

  onMounted(() => {
    setupCanvasWidth();
  });
</script>

<template>
  <section ref="containerRef" class="about-tech">
    <div class="about-tech__canvas-container">
      <canvas v-if="!isLoading" ref="_canvasRef" class="about-tech__canvas" />
      <div v-else class="about-tech__loading">
        <!-- Лоадер -->
      </div>
    </div>
  </section>
</template>
