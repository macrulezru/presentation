<!-- @/view/components/about-tech.vue -->
<script setup lang="ts">
  import '@/view/components/about/parts/about-tech/about-tech.scss';

  import { ref, onMounted, watch } from 'vue';

  import { useResponsive } from '@/view/composables/use-responsive';
  import { useTechAnimation, setCanvasMaxWidth } from '@/view/composables/use-tech/';

  const containerRef = ref<HTMLElement>();

  const { isDesktop, isTablet, isMobile } = useResponsive();
  const { canvasRef: _canvasRef, isLoading } = useTechAnimation({
    containerRef,
  });

  watch([isDesktop, isTablet, isMobile], () => {
    // При изменении размера экрана можно обновить максимальную ширину canvas
    setupCanvasWidth();
  });

  const setupCanvasWidth = () => {
    if (isDesktop.value) {
      setCanvasMaxWidth(1000);
    } else if (isTablet.value) {
      setCanvasMaxWidth(500);
    } else if (isMobile.value) {
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
