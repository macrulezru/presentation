<script setup lang="ts">
  import { computed } from 'vue';
  import './metrics-chart.scss';

  export interface Bucket {
    count: number;
    bytes: number;
    durations: number[];
    s2: number;
    s3: number;
    s4: number;
    s5: number;
  }

  interface Props {
    type: 'rps' | 'latency' | 'status' | 'bytes';
    buckets: Bucket[];
    chartWidth: number;
    bucketCount: number;
    bucketMs: number;
    hoveredPointIndex: number | null;
    ariaLabel: string;
  }

  interface Emits {
    (e: 'chart-mousemove', event: MouseEvent): void;
    (e: 'chart-mouseleave'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  // RPS calculations
  const rpsMax = computed(() => props.buckets.reduce((m, b) => Math.max(m, b.count), 0));
  const rpsCurrent = computed(() => props.buckets[props.buckets.length - 1]?.count ?? 0);

  function linePoints(values: number[], width: number): string {
    const height = 48;
    const max = Math.max(1, ...values, 1);
    const step = values.length > 1 ? width / (values.length - 1) : width;
    return values
      .map((v, i) => {
        const x = Math.round(i * step * 100) / 100;
        const y = Math.round((height - (v / max) * height) * 100) / 100;
        return `${x},${y}`;
      })
      .join(' ');
  }

  const rpsPoints = computed(() =>
    linePoints(
      props.buckets.map(b => b.count),
      props.chartWidth,
    ),
  );

  // Latency calculations
  function percentile(arr: number[], p: number): number {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const rawIdx = Math.floor((p / 100) * sorted.length);
    const idx = Math.max(0, Math.min(sorted.length - 1, rawIdx));
    return sorted[idx] ?? 0;
  }

  const latencyAvg = computed(() =>
    props.buckets.map(b => {
      if (!b.durations.length) return 0;
      const sum = b.durations.reduce((acc, v) => acc + v, 0);
      return Math.round(sum / b.durations.length);
    }),
  );

  const latencyP95 = computed(() =>
    props.buckets.map(b => Math.round(percentile(b.durations, 95))),
  );

  const latencyAvgPoints = computed(() => linePoints(latencyAvg.value, props.chartWidth));
  const latencyP95Points = computed(() => linePoints(latencyP95.value, props.chartWidth));

  // Status calculations
  const statusMax = computed(() =>
    props.buckets.reduce((m, b) => Math.max(m, b.s2 + b.s3 + b.s4 + b.s5), 0),
  );

  // Bytes calculations
  const bytesPoints = computed(() =>
    linePoints(
      props.buckets.map(b => Math.round(b.bytes || 0)),
      props.chartWidth,
    ),
  );

  function computeCoords(values: number[], width: number, height = 48) {
    const max = Math.max(1, ...values);
    const step = values.length > 1 ? width / (values.length - 1) : width;
    return values.map((v, i) => {
      const x = Math.round(i * step * 100) / 100;
      const y = Math.round((height - (v / max) * height) * 100) / 100;
      return { x, y };
    });
  }

  const bytesCoords = computed(() =>
    computeCoords(
      props.buckets.map(b => Math.round(b.bytes || 0)),
      props.chartWidth,
    ),
  );

  const bytesMax = computed(() =>
    props.buckets.reduce((m, b) => Math.max(m, Math.round(b.bytes || 0)), 0),
  );

  const bytesCurrent = computed(() =>
    Math.round(props.buckets[props.buckets.length - 1]?.bytes || 0),
  );

  function fmtBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${Math.round(kb * 10) / 10} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${Math.round(mb * 10) / 10} MB`;
    const gb = mb / 1024;
    return `${Math.round(gb * 10) / 10} GB`;
  }
</script>

<template>
  <div class="metrics-chart" :class="{ 'metrics-chart--bars': type === 'status' }">
    <!-- RPS Chart -->
    <svg
      v-if="type === 'rps'"
      :viewBox="`0 0 ${chartWidth} 48`"
      role="img"
      :aria-label="ariaLabel"
      @mousemove="emit('chart-mousemove', $event)"
      @mouseleave="emit('chart-mouseleave')"
    >
      <polyline :points="rpsPoints" fill="none" stroke="#6ad1ff" stroke-width="2" />
      <circle
        v-for="(b, i) in buckets"
        :key="`rps-${i}`"
        :cx="(i * chartWidth) / (bucketCount - 1)"
        :cy="48 - (b.count / (rpsMax || 1)) * 48"
        :r="hoveredPointIndex === i ? 4 : 2"
        :fill="hoveredPointIndex === i ? '#6ad1ff' : 'transparent'"
        class="metrics-chart__point"
      />
    </svg>

    <!-- Latency Chart -->
    <svg
      v-else-if="type === 'latency'"
      :viewBox="`0 0 ${chartWidth} 48`"
      role="img"
      :aria-label="ariaLabel"
      @mousemove="emit('chart-mousemove', $event)"
      @mouseleave="emit('chart-mouseleave')"
    >
      <polyline
        :points="latencyAvgPoints"
        fill="none"
        stroke="#7fd7ff"
        stroke-width="2"
      />
      <polyline
        :points="latencyP95Points"
        fill="none"
        stroke="#c58bff"
        stroke-width="2"
        stroke-dasharray="4 2"
      />
      <circle
        v-for="(val, i) in latencyAvg"
        :key="`latency-${i}`"
        :cx="(i * chartWidth) / Math.max(1, latencyAvg.length - 1)"
        :cy="48 - ((val ?? 0) / Math.max(1, ...latencyAvg.concat(latencyP95))) * 48"
        :r="hoveredPointIndex === i ? 4 : 2"
        :fill="hoveredPointIndex === i ? '#7fd7ff' : 'transparent'"
        class="metrics-chart__point"
      />
    </svg>

    <!-- Status Chart -->
    <svg
      v-else-if="type === 'status'"
      :viewBox="`0 0 ${chartWidth} 48`"
      role="img"
      :aria-label="ariaLabel"
    >
      <template v-for="(b, i) in buckets" :key="i">
        <g v-if="statusMax > 0">
          <rect
            v-if="b.s5"
            :x="(i * chartWidth) / (bucketCount - 1) - 3"
            :y="48 - ((b.s5 + b.s4 + b.s3 + b.s2) / statusMax) * 48"
            :width="6"
            :height="(b.s5 / statusMax) * 48"
            fill="#ff6b6b"
            opacity="0.9"
          />
          <rect
            v-if="b.s4"
            :x="(i * chartWidth) / (bucketCount - 1) - 3"
            :y="48 - ((b.s4 + b.s3 + b.s2) / statusMax) * 48"
            :width="6"
            :height="(b.s4 / statusMax) * 48"
            fill="#ffd166"
            opacity="0.9"
          />
          <rect
            v-if="b.s3"
            :x="(i * chartWidth) / (bucketCount - 1) - 3"
            :y="48 - ((b.s3 + b.s2) / statusMax) * 48"
            :width="6"
            :height="(b.s3 / statusMax) * 48"
            fill="#6ac7ff"
            opacity="0.9"
          />
          <rect
            v-if="b.s2"
            :x="(i * chartWidth) / (bucketCount - 1) - 3"
            :y="48 - (b.s2 / statusMax) * 48"
            :width="6"
            :height="(b.s2 / statusMax) * 48"
            fill="#7be495"
            opacity="0.9"
          />
        </g>
      </template>
    </svg>

    <!-- Bytes Chart -->
    <svg
      v-else-if="type === 'bytes'"
      :viewBox="`0 0 ${chartWidth} 48`"
      role="img"
      :aria-label="ariaLabel"
      @mousemove="emit('chart-mousemove', $event)"
      @mouseleave="emit('chart-mouseleave')"
    >
      <polyline :points="bytesPoints" fill="none" stroke="#9fe070" stroke-width="2" />
      <circle
        v-for="(pt, i) in bytesCoords"
        :key="i"
        :cx="pt.x"
        :cy="pt.y"
        :r="hoveredPointIndex === i ? 4 : 2"
        :fill="hoveredPointIndex === i ? '#c9f28d' : '#c9f28d'"
        :opacity="hoveredPointIndex === i ? 1 : 0.9"
        class="metrics-chart__point"
      />
    </svg>

    <!-- Legends -->
    <div class="metrics-chart__legend">
      <template v-if="type === 'rps'">
        <span>Now: {{ rpsCurrent }}/s</span>
        <span>Peak: {{ rpsMax }}/s</span>
        <span>Window: {{ (bucketCount * bucketMs) / 1000 }}s</span>
      </template>
      <template v-else-if="type === 'latency'">
        <span>Latency (avg)</span>
        <span>Latency (p95)</span>
        <span>Window: {{ (bucketCount * bucketMs) / 1000 }}s</span>
      </template>
      <template v-else-if="type === 'status'">
        <span>2xx</span>
        <span>3xx</span>
        <span>4xx</span>
        <span>5xx</span>
      </template>
      <template v-else-if="type === 'bytes'">
        <span>Now: {{ fmtBytes(bytesCurrent) }}</span>
        <span>Peak: {{ fmtBytes(bytesMax) }}</span>
        <span>Bytes per window</span>
        <span>Window: {{ (bucketCount * bucketMs) / 1000 }}s</span>
      </template>
    </div>
  </div>
</template>
