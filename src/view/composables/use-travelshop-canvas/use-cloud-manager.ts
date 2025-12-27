import { ref, type Ref, computed } from 'vue';

import type { Cloud, Size } from './types';

import { useTravelshopIntroStore } from '@/stores/use-travelshop-intro-store';

export interface UseCloudManagerReturn {
  clouds: Ref<Cloud[]>;
  adaptiveCloudsCount: Ref<{
    back: number;
    middle: number;
    front: number;
  }>;
  intervalIds: Ref<number[]>;
  createInitialClouds: (config: any, imageSizes: any) => void;
  createCloud: (layer: 'back' | 'middle' | 'front', isPreWarm?: boolean) => void;
  updateClouds: () => void;
  drawCloudLayer: (
    ctx: CanvasRenderingContext2D,
    images: any,
    layer: 'back' | 'middle' | 'front',
  ) => void;
  startCloudGeneration: (config: any) => void;
  stopCloudGeneration: () => void;
}

export function useCloudManager(
  containerSize: Ref<Size>,
  imageSizes: any,
): UseCloudManagerReturn {
  const travelshopIntroStore = useTravelshopIntroStore();

  const clouds = ref<Cloud[]>([]);
  const intervalIds = ref<number[]>([]);

  const adaptiveCloudsCount = computed(() => {
    if (!containerSize.value.width) {
      return {
        back: travelshopIntroStore.config.clouds.back.minCount,
        middle: travelshopIntroStore.config.clouds.middle.minCount,
        front: travelshopIntroStore.config.clouds.front.minCount,
      };
    }

    const calculateCount = (
      containerWidth: number,
      ratio: number,
      minCount: number,
      maxCount: number,
    ) => {
      const rawCount = Math.floor(containerWidth / ratio);
      return Math.max(minCount, Math.min(maxCount, rawCount));
    };

    return {
      back: calculateCount(
        containerSize.value.width,
        travelshopIntroStore.config.clouds.back.adaptiveCountRatio,
        travelshopIntroStore.config.clouds.back.minCount,
        travelshopIntroStore.config.clouds.back.maxCount,
      ),
      middle: calculateCount(
        containerSize.value.width,
        travelshopIntroStore.config.clouds.middle.adaptiveCountRatio,
        travelshopIntroStore.config.clouds.middle.minCount,
        travelshopIntroStore.config.clouds.middle.maxCount,
      ),
      front: calculateCount(
        containerSize.value.width,
        travelshopIntroStore.config.clouds.front.adaptiveCountRatio,
        travelshopIntroStore.config.clouds.front.minCount,
        travelshopIntroStore.config.clouds.front.maxCount,
      ),
    };
  });

  const createInitialClouds = () => {
    const { back, middle, front } = adaptiveCloudsCount.value;

    for (let i = 0; i < back; i++) {
      createCloud('back', true);
    }

    for (let i = 0; i < middle; i++) {
      createCloud('middle', true);
    }

    for (let i = 0; i < front; i++) {
      createCloud('front', true);
    }
  };

  const createCloud = (layer: 'back' | 'middle' | 'front', isPreWarm = false) => {
    const { width: containerWidth, height: containerHeight } = containerSize.value;
    const cloudAspectRatio = imageSizes.value.cloud.aspectRatio;
    const configCloud = travelshopIntroStore.config.clouds[layer];
    const yRange = travelshopIntroStore.config.clouds.yRanges[layer];
    const opacityRange = travelshopIntroStore.config.clouds.opacity[layer];

    const currentLayerCloudsCount = clouds.value.filter(c => c.layer === layer).length;
    const maxCloudsInLayer = adaptiveCloudsCount.value[layer];

    if (currentLayerCloudsCount >= maxCloudsInLayer) {
      return;
    }

    const cloudWidth =
      Math.random() * (configCloud.maxWidth - configCloud.minWidth) +
      configCloud.minWidth;
    const cloudHeight = cloudWidth * cloudAspectRatio;

    const yPercent = Math.random() * (yRange.max - yRange.min) + yRange.min;
    const y = containerHeight * yPercent;

    const cloud: Cloud = {
      x: isPreWarm ? Math.random() * containerWidth : containerWidth + Math.random() * 50,
      y,
      size: cloudWidth,
      speed:
        Math.random() * (configCloud.maxSpeed - configCloud.minSpeed) +
        configCloud.minSpeed,
      opacity: Math.random() * (opacityRange.max - opacityRange.min) + opacityRange.min,
      layer,
      seed: Math.random(),
      actualWidth: cloudWidth,
      actualHeight: cloudHeight,
    };

    clouds.value.push(cloud);
  };

  const updateClouds = () => {
    const cloudsToRemove: Cloud[] = [];

    clouds.value.forEach(cloud => {
      cloud.x -= cloud.speed / 60;

      if (cloud.x < -cloud.actualWidth * 2) {
        cloudsToRemove.push(cloud);
      }
    });

    clouds.value = clouds.value.filter(cloud => !cloudsToRemove.includes(cloud));
  };

  const drawCloudLayer = (
    ctx: CanvasRenderingContext2D,
    images: any,
    layer: 'back' | 'middle' | 'front',
  ) => {
    if (!ctx || !images.cloud.complete) return;

    const layerClouds = clouds.value.filter(cloud => cloud.layer === layer);

    layerClouds.forEach(cloud => {
      ctx.save();
      ctx.globalAlpha = cloud.opacity;

      const rotation = Math.sin(cloud.seed * 10 + Date.now() * 0.001) * 0.1;

      ctx.translate(cloud.x + cloud.actualWidth / 2, cloud.y + cloud.actualHeight / 2);
      ctx.rotate(rotation);

      ctx.drawImage(
        images.cloud,
        -cloud.actualWidth / 2,
        -cloud.actualHeight / 2,
        cloud.actualWidth,
        cloud.actualHeight,
      );

      ctx.restore();
    });
  };

  const startCloudGeneration = () => {
    stopCloudGeneration();

    Object.entries(travelshopIntroStore.config.clouds.generationIntervals).forEach(
      ([layer, interval]) => {
        const id = window.setInterval(() => {
          const currentCount = clouds.value.filter(c => c.layer === layer).length;
          const maxCount =
            adaptiveCloudsCount.value[layer as 'back' | 'middle' | 'front'];

          if (currentCount < maxCount) {
            createCloud(layer as 'back' | 'middle' | 'front');
          }
        }, interval as number);
        intervalIds.value.push(id);
      },
    );
  };

  const stopCloudGeneration = () => {
    intervalIds.value.forEach(id => clearInterval(id));
    intervalIds.value = [];
  };

  return {
    clouds,
    adaptiveCloudsCount,
    intervalIds,
    createInitialClouds,
    createCloud,
    updateClouds,
    drawCloudLayer,
    startCloudGeneration,
    stopCloudGeneration,
  };
}
