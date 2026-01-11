<script setup lang="ts">
  // Количество делений шкалы (например, 12 как на часах)
  import '@/view/ui/ui-circle-chart/ui-circle-chart.scss';

  import { ref, computed, watch, onMounted, onBeforeUnmount, useSlots } from 'vue';

  import type { Props } from './types';

  import { nanoid } from '@/utils/nanoid';

  // Значения по умолчанию для пропсов
  const props = withDefaults(defineProps<Props>(), {
    mode: 'circle',
    size: 300,
    lineThick: 20,
    strokeColor: '#e3e3e3',
    showValue: true,
    valueFontSize: 28,
    valueColor: '#333333',
    boxColor: '#222',
    boxCornerRadius: 12,
    markColor: '#202020',
    markCount: 12,
    boxOffset: 10,
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

  const maskId = `circle-only-mask-${nanoid(8)}`;

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

  const markLength = computed(() => props.lineThick * 1.2);

  const scaleMarks = computed(() => {
    const arr = [];
    const r1 = circleRadius.value - props.boxOffset; // внешний радиус — ровно по краю выреза
    const r2 = r1 - markLength.value; // внутренний радиус (деление короче круга)
    for (let i = 0; i < props.markCount; i++) {
      const angle = (2 * Math.PI * i) / props.markCount;
      const x1 = circlePosition.value + r2 * Math.cos(angle - Math.PI / 2);
      const y1 = circlePosition.value + r2 * Math.sin(angle - Math.PI / 2);
      const x2 = circlePosition.value + r1 * Math.cos(angle - Math.PI / 2);
      const y2 = circlePosition.value + r1 * Math.sin(angle - Math.PI / 2);
      arr.push({ x1, y1, x2, y2 });
    }
    return arr;
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
      <template v-if="props.mode === 'circle'">
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
      </template>
      <template v-if="props.mode === 'boxed'">
        <svg
          :width="props.size"
          :height="props.size"
          :viewBox="`0 0 ${props.size} ${props.size}`"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask :id="maskId">
              <rect
                x="0"
                y="0"
                :width="props.size"
                :height="props.size"
                fill="white"
                rx="12"
              />
              <circle
                :cx="circlePosition"
                :cy="circlePosition"
                :r="circleRadius - props.boxOffset"
                fill="black"
              />
            </mask>
          </defs>
          <!-- Прямоугольный фон с вырезанным кругом -->
          <rect
            x="2"
            y="2"
            :width="props.size - 4"
            :height="props.size - 4"
            :rx="props.boxCornerRadius"
            :fill="props.boxColor"
            :mask="`url(#${maskId})`"
          />
          <!-- Разметка шкалы -->
          <g>
            <line
              v-for="(mark, idx) in scaleMarks"
              :key="'mark-' + idx"
              :x1="mark.x1"
              :y1="mark.y1"
              :x2="mark.x2"
              :y2="mark.y2"
              :stroke="props.markColor"
              stroke-width="1"
              stroke-linecap="round"
            />
          </g>
          <circle
            :cx="circlePosition"
            :cy="circlePosition"
            :r="circleRadius - props.boxOffset - props.lineThick / 2"
            :stroke="segmentColor"
            :stroke-width="lineThick"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="segmentDashArray"
            :transform="`rotate(-90 ${circlePosition} ${circlePosition})`"
          />
          <circle
            :cx="circlePosition"
            :cy="circlePosition"
            :r="circleRadius - lineThick - props.boxOffset"
            :fill="props.boxColor"
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
      </template>
    </div>
    <div v-if="hasDefaultSlot || props.label" class="ui-circle-chart__label">
      <slot>{{ props.label }}</slot>
    </div>
  </div>
</template>
