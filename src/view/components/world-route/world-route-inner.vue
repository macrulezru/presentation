<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';

  import { fetchRandomRoute } from './use-random-route';
  import { useWorldRouteGlobe } from './use-world-route-globe';

  import '@/view/components/world-route/world-route.scss';

  const canvasRef = ref<HTMLCanvasElement>();
  const isLoading = ref(false);
  const hasRoute = ref(false);

  const { init, destroy, setRoute, setZoom, currentZoom, labels, MIN_ZOOM, MAX_ZOOM } =
    useWorldRouteGlobe();

  const loadRoute = async () => {
    isLoading.value = true;
    try {
      const result = await fetchRandomRoute();
      setRoute(result.segments, result.airports);
      hasRoute.value = true;
    } catch (e) {
      console.error('[WorldRoute] failed to load route', e);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(async () => {
    if (canvasRef.value) init(canvasRef.value);
    await loadRoute();
  });

  onBeforeUnmount(() => destroy());
</script>

<template>
  <div class="world-route-inner">
    <canvas ref="canvasRef" class="world-route-inner__canvas" />

    <!-- Лейблы аэропортов и сегмента -->
    <div class="world-route-labels">
      <div
        v-for="label in labels"
        :key="label.key"
        class="world-route-label"
        :class="[
          `world-route-label--${label.role}`,
          `world-route-label--${label.placement}`,
        ]"
        :style="{ left: label.x + 'px', top: label.y + 'px' }"
      >
        <div class="world-route-label__name">{{ label.text }}</div>
        <div v-if="label.subtext" class="world-route-label__sub">{{ label.subtext }}</div>
      </div>
    </div>

    <!-- Контролы -->
    <div class="world-route-inner__controls">
      <!-- Кнопка обновления маршрута -->
      <button
        class="world-route-inner__refresh"
        :class="{ 'is-loading': isLoading }"
        :disabled="isLoading"
        title="Случайный маршрут"
        @click="loadRoute"
      >
        <svg
          width="16"
          height="19"
          viewBox="0 0 16 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7.87138 2.02237L7.35691 1.4538C6.58521 0.575112 7.92283 -0.562016 8.64309 0.316673L10.2379 2.07405C10.6495 2.53924 10.6495 3.21118 10.2379 3.67637L8.64309 5.48544C7.87138 6.31244 6.58521 5.17531 7.35691 4.29662L7.87138 3.77974C4.47588 3.83143 1.7492 6.62256 1.7492 10.0856C1.7492 13.5487 4.52733 16.3915 8.02572 16.3915C11.4727 16.3915 14.3023 13.5487 14.3023 10.0856C14.3023 8.89682 16 8.94851 16 10.0856C16 14.4791 12.3987 18.0972 8.02572 18.0972C3.60129 18.0972 0 14.4791 0 10.0856C0 5.69219 3.49839 2.07405 7.87138 2.02237Z"
            fill="white"
          />
        </svg>
      </button>

      <!-- Вертикальный ползунок зума -->
      <div class="world-route-inner__zoom-wrap">
        <span class="world-route-inner__zoom-icon world-route-inner__zoom-icon--plus">
          +
        </span>
        <input
          class="world-route-inner__zoom-slider"
          type="range"
          :min="MIN_ZOOM"
          :max="MAX_ZOOM"
          :step="(MAX_ZOOM - MIN_ZOOM) / 100"
          :value="currentZoom"
          @input="setZoom(+($event.target as HTMLInputElement).value)"
        />
        <span class="world-route-inner__zoom-icon world-route-inner__zoom-icon--minus">
          −
        </span>
      </div>
    </div>

    <!-- Тёмный фон на первой загрузке -->
    <transition name="fade">
      <div v-if="!hasRoute" class="world-route-inner__skeleton" />
    </transition>

    <!-- Спиннер (первая загрузка + обновление маршрута) -->
    <transition name="fade">
      <div v-if="isLoading" class="world-route-inner__loader">
        <span class="world-route-inner__spinner" />
      </div>
    </transition>
  </div>
</template>
