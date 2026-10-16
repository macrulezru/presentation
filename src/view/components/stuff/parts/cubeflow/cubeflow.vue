<script setup lang="ts">
  import './cubeflow.scss';

  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

  import CubeflowBox from '@/view/assets/images/cubeflow-box.webp';
  import CubeflowLogo from '@/view/assets/images/cubeflow.webp';
  import { useI18n } from '~/composables/useI18n';

  interface CubeflowFeature {
    title: string;
    text: string;
  }

  const { t, tm } = useI18n();

  const promoRef = ref<HTMLElement>();
  const canvasRef = ref<HTMLCanvasElement>();
  const sceneRef = ref<HTMLElement>();

  /** Положение сетки: центр куба-картинки и размер единицы плоскости; пересчитывается при смене размеров, а не каждый кадр */
  const frame = { cx: 0, cy: 0, unit: 400 };
  let grid: import('./cubeflow-grid').CubeflowGridHandle | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let isGridLoading = false;
  let isDestroyed = false;

  const measureFrame = () => {
    const canvas = canvasRef.value;
    const scene = sceneRef.value;
    if (!canvas || !scene) return;
    const canvasRect = canvas.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const box = scene.querySelector<HTMLElement>('.cubeflow__box');
    frame.cx = sceneRect.left + sceneRect.width / 2 - canvasRect.left;
    frame.cy =
      sceneRect.top -
      canvasRect.top +
      (box ? box.offsetTop + box.offsetHeight / 2 : sceneRect.height / 2);
    frame.unit = (box?.offsetWidth || 500) * 0.8;
  };

  /** Скрипт сетки подгружается, только когда блок впервые оказался рядом с экраном */
  const loadGrid = async () => {
    if (grid || isGridLoading || !canvasRef.value) return;
    isGridLoading = true;
    const { createCubeflowGrid } = await import('./cubeflow-grid');
    isGridLoading = false;
    if (isDestroyed || !canvasRef.value) return;
    grid = createCubeflowGrid(canvasRef.value, () => frame);
    measureFrame();
    grid.resize();
    resizeObserver = new ResizeObserver(() => {
      measureFrame();
      grid?.resize();
    });
    resizeObserver.observe(canvasRef.value);
    if (sceneRef.value) resizeObserver.observe(sceneRef.value);
    if (visibility.isVisible.value) grid.start();
  };

  const visibility = useElementVisibility(promoRef, { rootMargin: '200px 0px' });

  watch(
    () => visibility.isVisible.value,
    isVisible => {
      if (isVisible) {
        if (grid) grid.start();
        else void loadGrid();
      } else grid?.stop();
    },
  );

  onMounted(() => {
    if (visibility.isVisible.value) void loadGrid();
  });

  onBeforeUnmount(() => {
    isDestroyed = true;
    resizeObserver?.disconnect();
    grid?.destroy();
    grid = null;
  });

  const features = computed(() => (tm('cubeflow.features') as CubeflowFeature[]) || []);
</script>

<template>
  <div class="cubeflow">
    <div class="cubeflow__container">
      <div ref="promoRef" class="cubeflow__promo">
        <canvas ref="canvasRef" class="cubeflow__grid" aria-hidden="true" />
        <a class="cubeflow__link" href="https://cubeflow.retrosteam.ru" target="_blank">
          <VImage
            class="cubeflow__logo"
            :src="CubeflowLogo"
            hazehash="OcmTtuGiyn_YnjdxlyMA-vXhXW1UyxNKqxXtWw"
            :width="800"
            :height="164"
            alt="Cubeflow"
            :lazy="true"
          />
          <div ref="sceneRef" class="cubeflow__scene">
            <div class="cubeflow__box">
              <VImage
                class="cubeflow__box-iamge"
                :src="CubeflowBox"
                hazehash="L0wOutuAQLdoSalzNY666lpa-4k5St7fVpu5bQ"
                :width="599"
                :height="698"
                alt="Cubeflow box"
                :lazy="true"
              />
            </div>

            <span class="cubeflow__shadow" />
          </div>
        </a>
        <div class="cubeflow__subtitle">{{ t('cubeflow.subtitle') }}</div>
      </div>

      <ul class="cubeflow__features">
        <li
          v-for="(feature, index) in features"
          :key="feature.title"
          class="cubeflow__feature"
        >
          <div
            class="cubeflow__feature-icon"
            :class="`cubeflow__feature-icon_${index + 1}`"
            aria-hidden="true"
          />
          <div class="cubeflow__feature-title">{{ feature.title }}</div>
          <div class="cubeflow__feature-text">{{ feature.text }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>
