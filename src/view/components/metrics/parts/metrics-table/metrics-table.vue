<script setup lang="ts">
  import MetricsRequestDetails from '../metrics-request-details/metrics-request-details.vue';

  import type { RequestRecord } from '@/core/metrics/metrics-bus';

  import { useI18n } from '@/view/composables/use-i18n';
  import './metrics-table.scss';

  interface Props {
    rows: RequestRecord[];
    selectedId: string | null;
    selectedRow: RequestRecord | null;
  }

  interface Emits {
    (e: 'row-click', id: string | null): void;
  }

  defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { t } = useI18n();

  function fmtTime(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number, l = 2) => String(n).padStart(l, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(
      d.getMilliseconds(),
      3,
    )}`;
  }

  function fmtDuration(ms: number | null | undefined): string {
    if (ms == null) return '...';
    return Math.round(ms).toString();
  }

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
  <div class="metrics-table">
    <div class="metrics-table__thead">
      <div>{{ t('metrics.table.time') }}</div>
      <div>{{ t('metrics.table.method') }}</div>
      <div class="metrics-table__cell--url">{{ t('metrics.table.url') }}</div>
      <div class="metrics-table__cell--num">{{ t('metrics.table.duration') }}</div>
      <div class="metrics-table__cell--num">{{ t('metrics.table.status') }}</div>
      <div class="metrics-table__cell--num">{{ t('metrics.table.bytes') }}</div>
      <div>{{ t('metrics.table.error') }}</div>
    </div>
    <template v-for="row in rows" :key="row.id">
      <div
        class="metrics-table__row"
        :class="{
          'metrics-table__row--error': !!row.error,
          'metrics-table__row--slow': (row.durationMs || 0) > 1000,
          'metrics-table__row--active': row.id === selectedId,
        }"
        @click="emit('row-click', row.id === selectedId ? null : row.id)"
      >
        <div>{{ fmtTime(row.startAt) }}</div>
        <div>{{ row.method }}</div>
        <div class="metrics-table__cell--url" :title="row.url">{{ row.url }}</div>
        <div class="metrics-table__cell--num">{{ fmtDuration(row.durationMs) }}</div>
        <div class="metrics-table__cell--num">{{ row.status ?? '-' }}</div>
        <div class="metrics-table__cell--num">
          {{ fmtBytes(row.responseBytes || 0) }}
        </div>
        <div class="metrics-table__cell--error">{{ row.error?.message }}</div>
      </div>

      <MetricsRequestDetails
        v-if="selectedRow && selectedRow.id === row.id"
        :request="selectedRow"
        @close="emit('row-click', null)"
      />
    </template>
  </div>
</template>
