<script setup lang="ts">
  import { defineAsyncComponent, ref, onMounted, onBeforeUnmount } from 'vue';

  const Inner = defineAsyncComponent(() => import('./world-route-inner.vue'));

  const isVisible = ref(false);
  const containerRef = ref<HTMLElement>();

  onMounted(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      isVisible.value = true;
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          isVisible.value = true;
          io.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(containerRef.value!);
    onBeforeUnmount(() => io.disconnect());
  });
</script>

<template>
  <div ref="containerRef" class="world-route">
    <Suspense>
      <Inner v-if="isVisible" />
      <template #fallback>
        <div class="world-route__skeleton" />
      </template>
    </Suspense>
  </div>
</template>
