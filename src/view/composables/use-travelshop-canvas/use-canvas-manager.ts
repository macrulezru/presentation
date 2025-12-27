import { ref, type Ref, computed } from 'vue';

import type { Size, Point } from './types';

import { useTravelshopIntroStore } from '@/stores/use-travelshop-intro-store';

export interface UseCanvasManagerReturn {
  canvasRef: Ref<HTMLCanvasElement | undefined>;
  ctx: Ref<CanvasRenderingContext2D | null>;
  containerSize: Ref<Size>;
  sceneCenter: Ref<Point>;
  adaptiveCanvasHeight: Ref<number>;
  adaptiveAirportMarginTop: Ref<number>;
  initCanvas: () => boolean;
  resizeThrottle: () => void;
  getSafeZoneBounds: (margins: { horizontal: number; vertical: number }) => {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  clampToSafeZone: (
    x: number,
    y: number,
    bounds: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    },
  ) => Point;
}

export function useCanvasManager(
  containerRef: Ref<HTMLElement | undefined>,
): UseCanvasManagerReturn {
  const travelshopIntroStore = useTravelshopIntroStore();
  const canvasRef = ref<HTMLCanvasElement>();
  const ctx = ref<CanvasRenderingContext2D | null>(null);
  const containerSize = ref<Size>({ width: 0, height: 0 });
  const sceneCenter = ref<Point>({ x: 0, y: 0 });

  // Адаптивные вычисления
  const adaptiveCanvasHeight = computed(() => {
    if (!containerSize.value.width) return travelshopIntroStore.config.canvasInitHeight;

    if (travelshopIntroStore.config.airport.maxWidth > containerSize.value.width - 60) {
      return containerSize.value.width / 1.12;
    } else {
      return travelshopIntroStore.config.canvasInitHeight;
    }
  });

  const adaptiveAirportMarginTop = computed(() => {
    if (!containerSize.value.width)
      return travelshopIntroStore.config.airport.initialMarginTop;

    if (travelshopIntroStore.config.airport.maxWidth > containerSize.value.width - 60) {
      return containerSize.value.width / 3.2;
    } else {
      return travelshopIntroStore.config.airport.initialMarginTop;
    }
  });

  // Троттлинг для обработки изменения размеров
  let resizeThrottleTimeout: number | undefined;
  let lastResizeCall = 0;
  const RESIZE_THROTTLE_DELAY = 100;

  const resizeThrottle = () => {
    const now = Date.now();

    if (now - lastResizeCall < RESIZE_THROTTLE_DELAY) {
      if (resizeThrottleTimeout) {
        clearTimeout(resizeThrottleTimeout);
      }
      resizeThrottleTimeout = window.setTimeout(() => {
        lastResizeCall = Date.now();
        initCanvas();
      }, RESIZE_THROTTLE_DELAY);
      return;
    }

    lastResizeCall = now;
    initCanvas();
  };

  const initCanvas = (): boolean => {
    if (!canvasRef.value || !containerRef.value) return false;

    const canvas = canvasRef.value;
    const container = containerRef.value;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0) return false;

    // Обновляем размеры контейнера
    containerSize.value = {
      width: rect.width,
      height: adaptiveCanvasHeight.value,
    };

    sceneCenter.value = {
      x: rect.width / 2,
      y: adaptiveCanvasHeight.value / 2,
    };

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = adaptiveCanvasHeight.value * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${adaptiveCanvasHeight.value}px`;

    ctx.value = canvas.getContext('2d', { alpha: true });

    if (ctx.value) {
      ctx.value.scale(dpr, dpr);
      ctx.value.imageSmoothingEnabled = true;
      ctx.value.imageSmoothingQuality = 'high';
    }

    return true;
  };

  const getSafeZoneBounds = (margins: { horizontal: number; vertical: number }) => {
    if (containerSize.value.width === 0 || containerSize.value.height === 0) {
      return {
        minX: margins.horizontal,
        maxX: margins.horizontal,
        minY: margins.vertical,
        maxY: margins.vertical,
      };
    }

    const bounds = {
      minX: margins.horizontal,
      maxX: containerSize.value.width - margins.horizontal,
      minY: margins.vertical,
      maxY: containerSize.value.height - margins.vertical,
    };

    if (bounds.minX > bounds.maxX) {
      const centerX = (bounds.minX + bounds.maxX) / 2;
      bounds.minX = centerX;
      bounds.maxX = centerX;
    }

    if (bounds.minY > bounds.maxY) {
      const centerY = (bounds.minY + bounds.maxY) / 2;
      bounds.minY = centerY;
      bounds.maxY = centerY;
    }

    return bounds;
  };

  const clampToSafeZone = (
    x: number,
    y: number,
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
  ): Point => {
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
    };
  };

  return {
    canvasRef,
    ctx,
    containerSize,
    sceneCenter,
    adaptiveCanvasHeight,
    adaptiveAirportMarginTop,
    initCanvas,
    resizeThrottle,
    getSafeZoneBounds,
    clampToSafeZone,
  };
}
