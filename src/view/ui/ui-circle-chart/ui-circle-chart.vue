<script setup lang="ts">
  import '@/view/ui/ui-circle-chart/ui-circle-chart.scss';

  import { ref, computed, watch, onMounted, onBeforeUnmount, useSlots } from 'vue';
  import type { Props } from './types';

  // Значения по умолчанию для пропсов
  const props = withDefaults(defineProps<Props>(), {
    size: 300,
    lineThick: 20,
    strokeColor: '#e3e3e3',
    showValue: true,
    valueFontSize: 28,
    valueColor: '#333333',
    animationDuration: 1000,
    animateOnMount: false,
    autoPlay: false,
    autoPlayOnce: false,
    autoPlayThreshold: 0.5,
    autoPlayDelay: 0,
  });

  const slots = useSlots();

  // Реактивное значение для анимации
  const animatedValue = ref(0);
  const chartContainer = ref<HTMLElement | null>(null);

  // Состояние анимации
  const isAnimating = ref(false);
  const hasAutoPlayedOnce = ref(false);
  let animationFrameId: number | null = null;
  let animationStartTime: number | null = null;
  let intersectionObserver: IntersectionObserver | null = null;

  const circlePosition = computed(() => {
    return props.size / 2;
  });

  const circleRadius = computed(() => {
    return props.size / 2 - props.lineThick / 2 - 2;
  });

  const circleCircumference = computed(() => {
    return 2 * Math.PI * circleRadius.value;
  });

  const segmentDashArray = computed(() => {
    const value = Math.min(Math.max(animatedValue.value, 0), 100);
    const segmentLength = (value / 100) * circleCircumference.value;

    return `${segmentLength} ${circleCircumference.value - segmentLength}`;
  });

  const displayValue = computed(() => {
    return `${Math.round(animatedValue.value)}%`;
  });

  const hasDefaultSlot = computed(() => {
    return slots.default && slots.default().length > 0;
  });

  /**
   * Запускает анимацию круговой диаграммы
   * @param duration - Длительность анимации в миллисекундах (опционально)
   * @example
   * // В родительском компоненте
   * chartRef.value?.startAnimation(1500)
   */
  const startAnimation = (duration?: number) => {
    const animationDuration = duration || props.animationDuration;
    animate(0, props.value, animationDuration);
  };

  /**
   * Внутренняя функция анимации
   * @private
   */
  const animate = (from: number, to: number, duration: number) => {
    if (isAnimating.value && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    isAnimating.value = true;
    animationStartTime = performance.now();

    const animateStep = (currentTime: number) => {
      if (!animationStartTime) return;

      const elapsed = currentTime - animationStartTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = easeInOutCubic(progress);

      animatedValue.value = from + (to - from) * easeProgress;

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateStep);
      } else {
        isAnimating.value = false;
        animationFrameId = null;
        animationStartTime = null;
      }
    };

    animationFrameId = requestAnimationFrame(animateStep);
  };

  /**
   * Функция плавности ease-in-out
   * @private
   */
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Обработчик Intersection Observer
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (props.autoPlay) {
          if (props.autoPlayDelay > 0) {
            setTimeout(() => {
              startAnimation();
            }, props.autoPlayDelay);
          } else {
            startAnimation();
          }
        }

        if (props.autoPlayOnce && !hasAutoPlayedOnce.value) {
          if (props.autoPlayDelay > 0) {
            setTimeout(() => {
              startAnimation();
              hasAutoPlayedOnce.value = true;
            }, props.autoPlayDelay);
          } else {
            startAnimation();
            hasAutoPlayedOnce.value = true;
          }
        }
      }
    });
  };

  /**
   * Инициализация Intersection Observer для автостарта
   * @private
   */
  const initIntersectionObserver = () => {
    if (!chartContainer.value || (!props.autoPlay && !props.autoPlayOnce)) return;

    intersectionObserver = new IntersectionObserver(handleIntersection, {
      threshold: props.autoPlayThreshold,
      rootMargin: '50px',
    });

    intersectionObserver.observe(chartContainer.value);
  };

  // Автоматическая анимация при монтировании
  onMounted(() => {
    if (props.autoPlay || props.autoPlayOnce) {
      animatedValue.value = 0;
      initIntersectionObserver();
    } else if (props.animateOnMount) {
      startAnimation();
    } else {
      animatedValue.value = props.value;
    }
  });

  // Остановка анимации и очистка при размонтировании
  onBeforeUnmount(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    if (intersectionObserver) {
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }
  });

  // Следим за изменением значения
  watch(
    () => props.value,
    newValue => {
      if (!isAnimating.value) {
        animatedValue.value = newValue;
      }
    },
  );

  // Экспортируем публичный метод
  defineExpose({
    startAnimation,
  });
</script>

<template>
  <div ref="chartContainer" class="ui-circle-chart">
    <div class="ui-circle-chart__graph">
      <svg
        :width="props.size"
        :height="props.size"
        :viewBox="`0 0 ${props.size} ${props.size}`"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          :cx="circlePosition"
          :cy="circlePosition"
          :r="circleRadius"
          :stroke="strokeColor"
          :stroke-width="lineThick"
          fill="none"
        />

        <circle
          :cx="circlePosition"
          :cy="circlePosition"
          :r="circleRadius"
          :stroke="segmentColor"
          :stroke-width="lineThick"
          fill="none"
          stroke-linecap="round"
          :stroke-dasharray="segmentDashArray"
          :transform="`rotate(-90 ${circlePosition} ${circlePosition})`"
        />

        <text
          v-if="showValue"
          :x="circlePosition"
          :y="circlePosition"
          :font-size="valueFontSize"
          :fill="valueColor"
          text-anchor="middle"
          dominant-baseline="middle"
          class="ui-circle-chart__value"
        >
          {{ displayValue }}
        </text>
      </svg>
    </div>
    <div v-if="hasDefaultSlot || props.label" class="ui-circle-chart__label">
      <slot>{{ props.label }}</slot>
    </div>
  </div>
</template>
