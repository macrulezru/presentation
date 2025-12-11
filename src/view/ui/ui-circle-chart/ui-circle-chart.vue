<script setup lang="ts">
  import '@/view/ui/ui-circle-chart/ui-circle-chart.scss'

  import { computed } from 'vue'

  interface Props {
    value: number
    segmentColor: string
    size?: number
    lineThick?: number
    strokeColor?: string
    showValue?: boolean
    valueFontSize?: number
    valueColor?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 300,
    lineThick: 20,
    strokeColor: '#e3e3e3',
    showValue: true,
    valueFontSize: 28,
    valueColor: '#333333',
  })

  const circlePosition = computed(() => {
    return props.size / 2
  })

  const circleRadius = computed(() => {
    return props.size / 2 - props.lineThick / 2
  })

  const circleCircumference = computed(() => {
    return 2 * Math.PI * circleRadius.value
  })

  const segmentDashArray = computed(() => {
    const value = Math.min(Math.max(props.value, 0), 100)
    const segmentLength = (value / 100) * circleCircumference.value

    return `${segmentLength} ${circleCircumference.value - segmentLength}`
  })

  const displayValue = computed(() => {
    return `${Math.round(props.value)}%`
  })
</script>

<template>
  <div class="circle-chart-container">
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
        class="circle-chart-value"
      >
        {{ displayValue }}
      </text>
    </svg>
  </div>
</template>
