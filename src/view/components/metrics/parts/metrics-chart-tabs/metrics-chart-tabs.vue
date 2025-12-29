<script setup lang="ts">
  import { useI18n } from '@/view/composables/use-i18n';
  import './metrics-chart-tabs.scss';

  export type ChartType = 'rps' | 'latency' | 'status' | 'bytes';

  interface Props {
    activeChart: ChartType;
    bytesTotal: number;
  }

  interface Emits {
    (e: 'update:activeChart', value: ChartType): void;
  }

  defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { t } = useI18n();

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
  <div class="metrics-chart-tabs">
    <button
      class="metrics-chart-tabs__pill"
      :class="{ 'is-active': activeChart === 'rps' }"
      @click="emit('update:activeChart', 'rps')"
    >
      {{ t('metrics.tabs.rps') }}
    </button>
    <button
      class="metrics-chart-tabs__pill"
      :class="{ 'is-active': activeChart === 'latency' }"
      @click="emit('update:activeChart', 'latency')"
    >
      {{ t('metrics.tabs.latency') }}
    </button>
    <button
      class="metrics-chart-tabs__pill"
      :class="{ 'is-active': activeChart === 'status' }"
      @click="emit('update:activeChart', 'status')"
    >
      {{ t('metrics.tabs.status') }}
    </button>
    <button
      class="metrics-chart-tabs__pill"
      :class="{ 'is-active': activeChart === 'bytes' }"
      @click="emit('update:activeChart', 'bytes')"
    >
      {{ t('metrics.tabs.bytes') }} · {{ fmtBytes(bytesTotal) }}
    </button>
  </div>
</template>
