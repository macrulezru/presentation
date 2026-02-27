<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { onMounted, onUnmounted, reactive, computed, ref, watch, nextTick } from 'vue';

  import MetricsChart, { type Bucket } from './parts/metrics-chart/metrics-chart.vue';
  import MetricsChartTabs, {
    type ChartType,
  } from './parts/metrics-chart-tabs/metrics-chart-tabs.vue';
  import MetricsPanelFilters, {
    type MethodFilter,
    type StatusFilter,
  } from './parts/metrics-panel-filters/metrics-panel-filters.vue';
  import MetricsPanelStats from './parts/metrics-panel-stats/metrics-panel-stats.vue';
  import MetricsTable from './parts/metrics-table/metrics-table.vue';
  import MetricsTooltip from './parts/metrics-tooltip/metrics-tooltip.vue';

  import type { RequestRecord } from '@/core/metrics/metrics-bus';

  import { useMetricStore } from '@/stores/use-metric-store';
  import { useRequestLogStore } from '@/stores/use-request-log-store';
  import {
    METRICS_PANEL_TOGGLE_EVENT,
    METRICS_PANEL_STATE_EVENT,
    type MetricsPanelToggleDetail,
  } from '@/view/components/metrics/metrics-panel.events';
import { useI18n } from '~/composables/useI18n';
  import './metrics-panel.scss';

  const metricStore = useMetricStore();

  const { isShowMetric } = storeToRefs(metricStore);

  const { t } = useI18n();

  watch(isShowMetric, v => {
    window.dispatchEvent(
      new CustomEvent<MetricsPanelToggleDetail>(METRICS_PANEL_STATE_EVENT, {
        detail: { open: v },
      }),
    );

    // Setup or cleanup ResizeObserver based on visibility
    if (v) {
      nextTick(() => {
        if (panelElement.value) {
          resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
              const { width } = entry.contentRect;
              const newWidth = Math.max(300, width - 40);
              if (chartWidth.value !== newWidth) {
                chartWidth.value = newWidth;
              }
            }
          });
          resizeObserver.observe(panelElement.value);
        }
      });
    } else {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    }
  });

  const chartsVisible = ref(false);
  const activeChart = ref<ChartType>('rps');

  const logStore = useRequestLogStore();
  const { records, selectedId, selected: selectedRow } = storeToRefs(logStore);

  const bucketMs = 2000;
  const bucketCount = 30;

  const state = reactive({
    limit: 50,
    url: '',
    method: 'ALL' as MethodFilter,
    status: 'ALL' as StatusFilter,
  });

  const chartWidth = ref(710);
  const panelElement = ref<HTMLElement | null>(null);
  let resizeObserver: ResizeObserver | null = null;

  const handleKeyDown = (e: KeyboardEvent) => {
    const { key } = e;
    const isTilde = key === '~';
    const isYo = key === 'Ё' || key === 'ё';
    if (e.shiftKey && (isTilde || isYo)) {
      e.preventDefault();
      metricStore.setShowStatus(!isShowMetric.value);
    }
  };

  const handleExternalToggle = (event: Event) => {
    const { open } = (event as CustomEvent<MetricsPanelToggleDetail>).detail || {};
    metricStore.setShowStatus(typeof open === 'boolean' ? open : !isShowMetric.value);
  };

  onMounted(() => {
    logStore.ensureSubscription();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(
      METRICS_PANEL_TOGGLE_EVENT,
      handleExternalToggle as EventListener,
    );
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener(
      METRICS_PANEL_TOGGLE_EVENT,
      handleExternalToggle as EventListener,
    );
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });

  const rows = computed(() => records.value);

  const filteredRows = computed(() => {
    const byMethod = (r: RequestRecord) =>
      state.method === 'ALL' || (r.method || '').toUpperCase() === state.method;
    const byStatus = (r: RequestRecord) => {
      if (state.status === 'ALL') return true;
      if (state.status === 'ERROR_ONLY') return !!r.error;
      const s = r.status ?? 0;
      if (!s) return false;
      if (state.status === '2xx') return s >= 200 && s < 300;
      if (state.status === '3xx') return s >= 300 && s < 400;
      if (state.status === '4xx') return s >= 400 && s < 500;
      if (state.status === '5xx') return s >= 500 && s < 600;
      return true;
    };
    const urlPart = state.url?.trim().toLowerCase();
    const byUrl = (r: RequestRecord) =>
      !urlPart || (r.url || '').toLowerCase().includes(urlPart);
    return rows.value
      .filter(r => byMethod(r) && byStatus(r) && byUrl(r))
      .slice(0, state.limit);
  });

  const total = computed(() => rows.value.length);
  const shown = computed(() => filteredRows.value.length);
  const avgDuration = computed(() => {
    const completed = filteredRows.value.filter(r => typeof r.durationMs === 'number');
    if (!completed.length) return 0;
    const sum = completed.reduce((acc, r) => acc + (r.durationMs || 0), 0);
    return Math.round(sum / completed.length);
  });

  const buckets = computed<Bucket[]>(() => {
    const now = Date.now();
    const cutoff = now - bucketMs * bucketCount;
    const arr = Array.from({ length: bucketCount }, (_, i) => ({
      t: cutoff + (i + 1) * bucketMs,
      count: 0,
      bytes: 0,
      durations: [] as number[],
      s2: 0,
      s3: 0,
      s4: 0,
      s5: 0,
    }));

    for (const row of rows.value) {
      const ts = row.startAt;
      if (!ts || ts < cutoff) continue;
      const idx = Math.min(bucketCount - 1, Math.floor((ts - cutoff) / bucketMs));
      const bucket = arr[idx];
      if (!bucket) continue;
      bucket.count += 1;
      if (typeof row.durationMs === 'number') bucket.durations.push(row.durationMs);
      const st = row.status ?? 0;
      if (st >= 200 && st < 300) bucket.s2 += 1;
      else if (st >= 300 && st < 400) bucket.s3 += 1;
      else if (st >= 400 && st < 500) bucket.s4 += 1;
      else if (st >= 500 && st < 600) bucket.s5 += 1;
      const bytes = row.responseBytes;
      if (typeof bytes === 'number' && bytes > 0) bucket.bytes += bytes;
    }

    return arr;
  });

  const bytesTotal = computed(() =>
    Math.round(buckets.value.reduce((sum, b) => sum + (b.bytes || 0), 0)),
  );

  const downloadJson = () => {
    const data = filteredRows.value;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `http-metrics-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasDetails = computed(() => Boolean(selectedRow.value));

  const selectRow = (id: string | null) => {
    logStore.select(id);
  };

  // Tooltip state for interactive charts
  const tooltipState = ref<{
    visible: boolean;
    ready: boolean;
    x: number;
    y: number;
    value: string;
    label: string;
  }>({
    visible: false,
    ready: false,
    x: 0,
    y: 0,
    value: '',
    label: '',
  });

  const tooltipElement = ref<HTMLElement | null>(null);
  const hoveredPointIndex = ref<number | null>(null);
  const tooltipInitialized = ref(false);

  // Adjust tooltip position to keep it within the container bounds
  const adjustTooltipPosition = (
    chartsContainer: HTMLElement,
    initialX: number,
  ): number => {
    if (!tooltipElement.value) return initialX;

    const tooltipWidth = tooltipElement.value.offsetWidth;
    const containerWidth = chartsContainer.offsetWidth;
    const padding = 8;

    let adjustedX = initialX;
    const tooltipLeft = initialX - tooltipWidth / 2;
    const tooltipRight = initialX + tooltipWidth / 2;

    if (tooltipRight > containerWidth - padding) {
      adjustedX = containerWidth - tooltipWidth / 2 - padding;
    } else if (tooltipLeft < padding) {
      adjustedX = tooltipWidth / 2 + padding;
    }

    return adjustedX;
  };

  watch(
    () => tooltipState.value.ready,
    isReady => {
      if (isReady && tooltipElement.value) {
        const chartsContainer = tooltipElement.value.closest(
          '.metrics-panel__charts',
        ) as HTMLElement;
        if (chartsContainer) {
          const adjustedX = adjustTooltipPosition(chartsContainer, tooltipState.value.x);
          if (adjustedX !== tooltipState.value.x) {
            tooltipState.value.x = adjustedX;
          }
          tooltipInitialized.value = true;
          tooltipState.value.visible = true;
        }
      }
    },
  );

  watch(
    () => tooltipState.value.x,
    newX => {
      if (
        tooltipInitialized.value &&
        tooltipState.value.visible &&
        tooltipElement.value
      ) {
        const chartsContainer = tooltipElement.value.closest(
          '.metrics-panel__charts',
        ) as HTMLElement;
        if (chartsContainer) {
          const adjustedX = adjustTooltipPosition(chartsContainer, newX);
          if (adjustedX !== newX) {
            tooltipState.value.x = adjustedX;
          }
        }
      }
    },
  );

  const fmtBytes = (n: number): string => {
    if (n < 1024) return `${n} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${Math.round(kb * 10) / 10} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${Math.round(mb * 10) / 10} MB`;
    const gb = mb / 1024;
    return `${Math.round(gb * 10) / 10} GB`;
  };

  const handleChartMouseMove = (event: MouseEvent) => {
    const svg = event.currentTarget as SVGSVGElement;
    if (!svg || !svg.viewBox || !svg.viewBox.baseVal) return;

    const rect = svg.getBoundingClientRect();
    const svgX = event.clientX - rect.left;
    const scale = svg.viewBox.baseVal.width / rect.width;
    const svgCoordX = svgX * scale;

    // Determine values based on active chart
    let values: number[] = [];
    let formatter: (val: number) => string = v => Math.round(v).toString();
    let label = 'Value';

    if (activeChart.value === 'rps') {
      values = buckets.value.map(b => b.count);
      formatter = v => `${Math.round(v)} req/s`;
      label = 'RPS';
    } else if (activeChart.value === 'latency') {
      values = buckets.value.map(b => {
        if (!b.durations.length) return 0;
        const sum = b.durations.reduce((acc, v) => acc + v, 0);
        return Math.round(sum / b.durations.length);
      });
      formatter = v => `${Math.round(v)}ms`;
      label = 'Latency (avg)';
    } else if (activeChart.value === 'bytes') {
      values = buckets.value.map(b => Math.round(b.bytes || 0));
      formatter = fmtBytes;
      label = 'Bytes';
    } else {
      return; // No tooltip for status chart
    }

    const step = svg.viewBox.baseVal.width / Math.max(1, values.length - 1);
    let closestIdx = 0;
    let minDist = Math.abs(svgCoordX - 0);

    for (let i = 0; i < values.length; i++) {
      const x = i * step;
      const dist = Math.abs(svgCoordX - x);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }

    if (minDist < step * 0.3) {
      const value = values[closestIdx] ?? 0;
      hoveredPointIndex.value = closestIdx;

      const chartsContainer = svg.closest('.metrics-panel__charts') as HTMLElement;
      const chartsRect = chartsContainer?.getBoundingClientRect();
      const x = chartsRect ? event.clientX - chartsRect.left : event.clientX - rect.left;
      const y = chartsRect
        ? event.clientY - chartsRect.top - 75
        : event.clientY - rect.top - 75;

      if (!tooltipState.value.visible) {
        tooltipState.value = {
          visible: false,
          ready: false,
          x,
          y,
          value: formatter(value),
          label,
        };
        nextTick(() => {
          tooltipState.value.ready = true;
        });
      } else {
        tooltipState.value.x = x;
        tooltipState.value.y = y;
        tooltipState.value.value = formatter(value);
        tooltipState.value.label = label;
      }
    } else {
      hoveredPointIndex.value = null;
      tooltipState.value.visible = false;
      tooltipState.value.ready = false;
      tooltipInitialized.value = false;
    }
  };

  const handleChartMouseLeave = () => {
    hoveredPointIndex.value = null;
    tooltipState.value.visible = false;
    tooltipState.value.ready = false;
    tooltipInitialized.value = false;
  };
</script>

<template>
  <Transition name="metrics-panel-slide">
    <div
      v-if="isShowMetric"
      ref="panelElement"
      class="metrics-panel"
      :class="{
        'metrics-panel--charts': chartsVisible,
        'metrics-panel--details': hasDetails,
      }"
    >
      <div class="metrics-panel__header">
        <div class="metrics-panel__header-row">
          <MetricsPanelFilters
            v-model:method="state.method"
            v-model:status="state.status"
            v-model:url="state.url"
            v-model:limit="state.limit"
            @close="metricStore.setShowStatus(false)"
          />
        </div>
        <div class="metrics-panel__header-row">
          <MetricsPanelStats
            :shown="shown"
            :total="total"
            :avgDuration="avgDuration"
            :chartsVisible="chartsVisible"
            @toggle-charts="chartsVisible = !chartsVisible"
            @export="downloadJson"
            @clear="logStore.clear()"
          />
        </div>
      </div>

      <Transition name="metrics-panel-chart">
        <div v-if="chartsVisible" class="metrics-panel__charts">
          <MetricsTooltip
            ref="tooltipElement"
            :visible="tooltipState.visible"
            :x="tooltipState.x"
            :y="tooltipState.y"
            :label="tooltipState.label"
            :value="tooltipState.value"
          />

          <MetricsChartTabs v-model:activeChart="activeChart" :bytesTotal="bytesTotal" />

          <MetricsChart
            :type="activeChart"
            :buckets="buckets"
            :chartWidth="chartWidth"
            :bucketCount="bucketCount"
            :bucketMs="bucketMs"
            :hoveredPointIndex="hoveredPointIndex"
            :ariaLabel="t(`metrics.aria.${activeChart}`)"
            @chart-mousemove="handleChartMouseMove"
            @chart-mouseleave="handleChartMouseLeave"
          />
        </div>
      </Transition>

      <div class="metrics-panel__table-wrapper">
        <MetricsTable
          :rows="filteredRows"
          :selectedId="selectedId"
          :selectedRow="selectedRow"
          @row-click="selectRow"
        />
      </div>
    </div>
  </Transition>
</template>
