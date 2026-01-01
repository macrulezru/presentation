<script setup lang="ts">
  import './ui-loading.scss';

  import { computed } from 'vue';

  type LoadingType = 'bar' | 'circle';

  interface Props {
    type?: LoadingType;
    progress?: number;
    thickness?: number;
    circleRadius?: number;
    strokeColor?: string;
    progressColor?: string;
    percentageColor?: string;
    barStrokeColor?: string;
    barStrokeWidth?: number;
    barInset?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'bar',
    progress: undefined,
    thickness: 6,
    circleRadius: 45,
    strokeColor: '#e0e0e0',
    progressColor: '#048eed',
    percentageColor: '#048eed',
    barStrokeColor: undefined,
    barStrokeWidth: 1,
    barInset: 1,
  });

  const isIndeterminate = computed(() => props.progress === undefined);

  const normalizedProgress = computed(() => {
    if (isIndeterminate.value) return 0;
    return Math.max(0, Math.min(100, props.progress || 0));
  });

  const animatingBarProgress = computed(() => {
    if (!isIndeterminate.value) return normalizedProgress.value;
    return 50;
  });

  const barBorderRadius = computed(() => {
    return `${props.thickness / 2}px`;
  });

  const resolvedBarStrokeColor = computed(
    () => props.barStrokeColor || props.strokeColor,
  );
  const resolvedBarStrokeWidth = computed(() => Math.max(0, props.barStrokeWidth));
  const resolvedBarInset = computed(() => Math.max(0, props.barInset));

  const effectiveCircleRadius = computed(() => {
    return Math.max(1, props.circleRadius - props.thickness / 2);
  });

  const svgCanvasSize = computed(() => {
    return props.circleRadius * 2;
  });

  const svgCenter = computed(() => {
    return props.circleRadius;
  });

  const circleCircumference = computed(() => {
    return 2 * Math.PI * effectiveCircleRadius.value;
  });

  const segmentDashArray = computed(() => {
    const circumference = circleCircumference.value;
    if (circumference <= 0) return '0 0';
    const value = Math.min(Math.max(normalizedProgress.value, 0), 100);
    const segmentLength = (value / 100) * circumference;
    return `${segmentLength} ${circumference - segmentLength}`;
  });

  const animatedSegmentLength = computed(() => {
    const circumference = circleCircumference.value;
    return circumference > 0 ? circumference * 0.3 : 0;
  });
</script>

<template>
  <div
    v-if="type === 'bar'"
    class="ui-loading ui-loading_bar"
    :class="{ 'ui-loading_indeterminate': isIndeterminate }"
  >
    <div
      class="ui-loading__bar-container"
      :style="{
        height: `${props.thickness}px`,
        borderRadius: barBorderRadius,
        borderColor: resolvedBarStrokeColor,
        borderWidth: `${resolvedBarStrokeWidth}px`,
        padding: `${resolvedBarInset}px`,
      }"
    >
      <div
        class="ui-loading__bar-inner"
        :style="{ borderRadius: barBorderRadius, backgroundColor: props.strokeColor }"
      >
        <div
          class="ui-loading__bar-fill"
          :style="{
            width: `${animatingBarProgress}%`,
            background: props.progressColor,
            borderRadius: barBorderRadius,
          }"
        />
      </div>
    </div>
    <div v-if="!isIndeterminate" class="ui-loading__percentage">
      <span :style="{ color: props.percentageColor }">{{ normalizedProgress }}%</span>
    </div>
  </div>

  <div
    v-else-if="type === 'circle'"
    class="ui-loading ui-loading_circle"
    :class="{ 'ui-loading_indeterminate': isIndeterminate }"
  >
    <svg
      class="ui-loading__circle-svg"
      :viewBox="`0 0 ${svgCanvasSize} ${svgCanvasSize}`"
      :width="svgCanvasSize"
      :height="svgCanvasSize"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        class="ui-loading__circle-background"
        :cx="svgCenter"
        :cy="svgCenter"
        :r="effectiveCircleRadius"
        :stroke-width="props.thickness"
        :stroke="props.strokeColor"
        fill="none"
      />

      <circle
        v-if="!isIndeterminate"
        class="ui-loading__circle-segment"
        :cx="svgCenter"
        :cy="svgCenter"
        :r="effectiveCircleRadius"
        :stroke-dasharray="segmentDashArray"
        :stroke-width="props.thickness"
        :stroke="props.progressColor"
        stroke-linecap="round"
        fill="none"
        :transform="`rotate(-90 ${svgCenter} ${svgCenter})`"
      />

      <circle
        v-else
        class="ui-loading__circle-segment ui-loading__circle-segment_animated"
        :cx="svgCenter"
        :cy="svgCenter"
        :r="effectiveCircleRadius"
        :stroke-dasharray="`${animatedSegmentLength} ${circleCircumference - animatedSegmentLength}`"
        :stroke-width="props.thickness"
        :stroke="props.progressColor"
        stroke-linecap="round"
        fill="none"
        :transform="`rotate(-90 ${svgCenter} ${svgCenter})`"
      />
    </svg>

    <div v-if="!isIndeterminate" class="ui-loading__circle-percentage">
      <span :style="{ color: props.percentageColor }">{{ normalizedProgress }}%</span>
    </div>
  </div>
</template>
