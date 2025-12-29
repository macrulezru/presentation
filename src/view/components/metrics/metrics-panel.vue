<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { onMounted, onUnmounted, reactive, computed, ref, watch } from 'vue';

  import type { RequestRecord } from '@/core/metrics/metrics-bus';

  import { useRequestLogStore } from '@/stores/use-request-log-store';
  import {
    METRICS_PANEL_TOGGLE_EVENT,
    METRICS_PANEL_STATE_EVENT,
    type MetricsPanelToggleDetail,
  } from '@/view/components/metrics/metrics-panel.events';
  import { useI18n } from '@/view/composables/use-i18n';
  import './metrics-panel.scss';

  type MethodFilter =
    | 'ALL'
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'OPTIONS'
    | 'HEAD';
  type StatusFilter = 'ALL' | '2xx' | '3xx' | '4xx' | '5xx' | 'ERROR_ONLY';

  const { t } = useI18n();
  const visible = ref(false);
  watch(visible, v => {
    window.dispatchEvent(
      new CustomEvent<MetricsPanelToggleDetail>(METRICS_PANEL_STATE_EVENT, {
        detail: { open: v },
      }),
    );
  });
  const chartsVisible = ref(false);
  const activeChart = ref<'rps' | 'latency' | 'status' | 'bytes'>('rps');
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

  function handleKeyDown(e: KeyboardEvent) {
    if (e.shiftKey && e.key.toLowerCase() === '~') {
      e.preventDefault();
      visible.value = !visible.value;
    }
  }

  function handleExternalToggle(event: Event) {
    const { open } = (event as CustomEvent<MetricsPanelToggleDetail>).detail || {};
    visible.value = typeof open === 'boolean' ? open : !visible.value;
  }

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

  const buckets = computed(() => {
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

  const chartWidth = ref(710);

  const rpsMax = computed(() => buckets.value.reduce((m, b) => Math.max(m, b.count), 0));
  const rpsCurrent = computed(() => buckets.value[buckets.value.length - 1]?.count ?? 0);

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
      buckets.value.map(b => b.count),
      chartWidth.value,
    ),
  );

  function percentile(arr: number[], p: number): number {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const rawIdx = Math.floor((p / 100) * sorted.length);
    const idx = Math.max(0, Math.min(sorted.length - 1, rawIdx));
    return sorted[idx] ?? 0;
  }

  const latencyAvg = computed(() =>
    buckets.value.map(b => {
      if (!b.durations.length) return 0;
      const sum = b.durations.reduce((acc, v) => acc + v, 0);
      return Math.round(sum / b.durations.length);
    }),
  );

  const latencyP95 = computed(() =>
    buckets.value.map(b => Math.round(percentile(b.durations, 95))),
  );

  const latencyAvgPoints = computed(() => linePoints(latencyAvg.value, chartWidth.value));
  const latencyP95Points = computed(() => linePoints(latencyP95.value, chartWidth.value));

  const statusMax = computed(() =>
    buckets.value.reduce((m, b) => Math.max(m, b.s2 + b.s3 + b.s4 + b.s5), 0),
  );

  const bytesPoints = computed(() =>
    linePoints(
      buckets.value.map(b => Math.round(b.bytes || 0)),
      chartWidth.value,
    ),
  );

  const bytesMax = computed(() =>
    buckets.value.reduce((m, b) => Math.max(m, Math.round(b.bytes || 0)), 0),
  );
  const bytesCurrent = computed(() =>
    Math.round(buckets.value[buckets.value.length - 1]?.bytes || 0),
  );

  // Removed fmtNum; using fmtBytes for display

  function fmtBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${Math.round(kb * 10) / 10} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${Math.round(mb * 10) / 10} MB`;
    const gb = mb / 1024;
    return `${Math.round(gb * 10) / 10} GB`;
  }

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
      buckets.value.map(b => Math.round(b.bytes || 0)),
      chartWidth.value,
    ),
  );

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

  function downloadJson() {
    const data = filteredRows.value;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `http-metrics-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasDetails = computed(() => Boolean(selectedRow.value));

  function selectRow(id: string | null) {
    const current = selectedId.value;
    logStore.select(current === id ? null : id);
  }

  function formatObject(value: unknown): string {
    if (value === undefined || value === null) return 'n/a';
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
</script>

<template>
  <Transition name="metrics-panel-slide">
    <div
      v-if="visible"
      class="metrics-panel"
      :class="{
        'metrics-panel--charts': chartsVisible,
        'metrics-panel--details': hasDetails,
      }"
    >
      <div class="metrics-panel__header">
        <div class="metrics-panel__header-row">
          <div class="metrics-panel__title">{{ t('metrics.title') }}</div>
          <div class="metrics-panel__controls">
            <label>
              {{ t('metrics.filters.method') }}
              <select v-model="state.method">
                <option value="ALL">{{ t('metrics.methods.all') }}</option>
                <option value="GET">{{ t('metrics.methods.get') }}</option>
                <option value="POST">{{ t('metrics.methods.post') }}</option>
                <option value="PUT">{{ t('metrics.methods.put') }}</option>
                <option value="DELETE">{{ t('metrics.methods.delete') }}</option>
                <option value="PATCH">{{ t('metrics.methods.patch') }}</option>
                <option value="OPTIONS">{{ t('metrics.methods.options') }}</option>
                <option value="HEAD">{{ t('metrics.methods.head') }}</option>
              </select>
            </label>
            <label>
              {{ t('metrics.filters.status') }}
              <select v-model="state.status">
                <option value="ALL">{{ t('metrics.statuses.all') }}</option>
                <option value="2xx">{{ t('metrics.statuses.2xx') }}</option>
                <option value="3xx">{{ t('metrics.statuses.3xx') }}</option>
                <option value="4xx">{{ t('metrics.statuses.4xx') }}</option>
                <option value="5xx">{{ t('metrics.statuses.5xx') }}</option>
                <option value="ERROR_ONLY">{{ t('metrics.statuses.errors') }}</option>
              </select>
            </label>
            <label>
              {{ t('metrics.filters.url') }}
              <input
                v-model="state.url"
                class="metrics-panel__input"
                :placeholder="t('metrics.filters.urlPlaceholder')"
              />
            </label>
            <label>
              {{ t('metrics.filters.limit') }}
              <input
                v-model.number="state.limit"
                class="metrics-panel__input metrics-panel__input--limit"
                type="number"
                min="1"
                max="500"
              />
            </label>
            <button
              class="metrics-panel__close"
              :title="`${t('common.close')} (Shift+~)`"
              @click="visible = false"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="metrics-panel__header-row">
          <div class="metrics-panel__stats">
            <span>{{ t('metrics.stats.shown') }}: {{ shown }}/{{ total }}</span>
            <span>
              {{ t('metrics.stats.avg') }}: {{ avgDuration }}
              {{ t('metrics.table.duration') }}
            </span>
            <button
              class="metrics-panel__icon-btn"
              :class="{ 'is-active': chartsVisible }"
              :title="t('metrics.actions.toggleCharts')"
              @click="chartsVisible = !chartsVisible"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M4 16v2h16v-2zm0-5v2l4 1.5 4-3 4 1.5 4-3V8l-4 3-4-1.5-4 3z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          <div class="metrics-panel__actions">
            <button class="metrics-panel__btn" @click="downloadJson()">
              {{ t('metrics.actions.export') }}
            </button>
            <button class="metrics-panel__btn" @click="logStore.clear()">
              {{ t('metrics.actions.clear') }}
            </button>
          </div>
        </div>
      </div>

      <Transition name="metrics-panel-chart">
        <div v-if="chartsVisible" class="metrics-panel__charts">
          <div class="metrics-panel__chart-tabs">
            <button
              class="metrics-panel__pill"
              :class="{ 'is-active': activeChart === 'rps' }"
              @click="activeChart = 'rps'"
            >
              {{ t('metrics.tabs.rps') }}
            </button>
            <button
              class="metrics-panel__pill"
              :class="{ 'is-active': activeChart === 'latency' }"
              @click="activeChart = 'latency'"
            >
              {{ t('metrics.tabs.latency') }}
            </button>
            <button
              class="metrics-panel__pill"
              :class="{ 'is-active': activeChart === 'status' }"
              @click="activeChart = 'status'"
            >
              {{ t('metrics.tabs.status') }}
            </button>
            <button
              class="metrics-panel__pill"
              :class="{ 'is-active': activeChart === 'bytes' }"
              @click="activeChart = 'bytes'"
            >
              {{ t('metrics.tabs.bytes') }} · {{ fmtBytes(bytesCurrent) }}
            </button>
          </div>

          <div v-if="activeChart === 'rps'" class="metrics-panel__chart">
            <svg
              :viewBox="`0 0 ${chartWidth} 48`"
              role="img"
              :aria-label="t('metrics.aria.requests')"
            >
              <polyline
                :points="rpsPoints"
                fill="none"
                stroke="#6ad1ff"
                stroke-width="2"
              />
            </svg>
            <div class="metrics-panel__chart-legend">
              <span>{{ t('metrics.legend.now') }}: {{ rpsCurrent }}/s</span>
              <span>{{ t('metrics.legend.peak') }}: {{ rpsMax }}/s</span>
              <span>
                {{ t('metrics.legend.window') }}: {{ (bucketCount * bucketMs) / 1000 }}s
              </span>
            </div>
          </div>

          <div v-else-if="activeChart === 'latency'" class="metrics-panel__chart">
            <svg
              :viewBox="`0 0 ${chartWidth} 48`"
              role="img"
              :aria-label="t('metrics.aria.latency')"
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
            </svg>
            <div class="metrics-panel__chart-legend">
              <span>{{ t('metrics.legend.latencyAvg') }}</span>
              <span>{{ t('metrics.legend.latencyP95') }}</span>
              <span>
                {{ t('metrics.legend.window') }}: {{ (bucketCount * bucketMs) / 1000 }}s
              </span>
            </div>
          </div>

          <div
            v-else-if="activeChart === 'status'"
            class="metrics-panel__chart metrics-panel__chart--bars"
          >
            <svg
              :viewBox="`0 0 ${chartWidth} 48`"
              role="img"
              :aria-label="t('metrics.aria.status')"
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
            <div class="metrics-panel__chart-legend">
              <span>{{ t('metrics.legend.status2xx') }}</span>
              <span>{{ t('metrics.legend.status3xx') }}</span>
              <span>{{ t('metrics.legend.status4xx') }}</span>
              <span>{{ t('metrics.legend.status5xx') }}</span>
            </div>
          </div>

          <div v-else-if="activeChart === 'bytes'" class="metrics-panel__chart">
            <svg
              :viewBox="`0 0 ${chartWidth} 48`"
              role="img"
              :aria-label="t('metrics.aria.bytes')"
            >
              <polyline
                :points="bytesPoints"
                fill="none"
                stroke="#9fe070"
                stroke-width="2"
              />
              <circle
                v-for="(pt, i) in bytesCoords"
                :key="i"
                :cx="pt.x"
                :cy="pt.y"
                r="2"
                fill="#c9f28d"
                opacity="0.9"
              />
            </svg>
            <div class="metrics-panel__chart-legend">
              <span>{{ t('metrics.legend.now') }}: {{ fmtBytes(bytesCurrent) }}</span>
              <span>{{ t('metrics.legend.peak') }}: {{ fmtBytes(bytesMax) }}</span>
              <span>{{ t('metrics.legend.bytesPerWindow') }}</span>
              <span>
                {{ t('metrics.legend.window') }}: {{ (bucketCount * bucketMs) / 1000 }}s
              </span>
            </div>
          </div>
        </div>
      </Transition>

      <div class="metrics-panel__table">
        <div class="metrics-panel__thead">
          <div>{{ t('metrics.table.time') }}</div>
          <div>{{ t('metrics.table.method') }}</div>
          <div class="metrics-panel__cell--url">{{ t('metrics.table.url') }}</div>
          <div class="metrics-panel__cell--num">{{ t('metrics.table.duration') }}</div>
          <div class="metrics-panel__cell--num">{{ t('metrics.table.status') }}</div>
          <div class="metrics-panel__cell--num">{{ t('metrics.table.bytes') }}</div>
          <div>{{ t('metrics.table.error') }}</div>
        </div>
        <template v-for="row in filteredRows" :key="row.id">
          <div
            class="metrics-panel__row"
            :class="{
              'metrics-panel__row--error': !!row.error,
              'metrics-panel__row--slow': (row.durationMs || 0) > 1000,
              'metrics-panel__row--active': row.id === selectedId,
            }"
            @click="selectRow(row.id)"
          >
            <div>{{ fmtTime(row.startAt) }}</div>
            <div>{{ row.method }}</div>
            <div class="metrics-panel__cell--url" :title="row.url">{{ row.url }}</div>
            <div class="metrics-panel__cell--num">{{ fmtDuration(row.durationMs) }}</div>
            <div class="metrics-panel__cell--num">{{ row.status ?? '-' }}</div>
            <div class="metrics-panel__cell--num">
              {{ fmtBytes(row.responseBytes || 0) }}
            </div>
            <div class="metrics-panel__cell--error">{{ row.error?.message }}</div>
          </div>

          <div
            v-if="selectedRow && selectedRow.id === row.id"
            class="metrics-panel__details-row"
          >
            <div class="metrics-panel__details-head">
              <div class="metrics-panel__details-title">
                {{ selectedRow.method }} {{ selectedRow.url }}
              </div>
              <div class="metrics-panel__details-meta">
                <span>
                  {{ t('metrics.table.status') }}: {{ selectedRow.status ?? '-' }}
                </span>
                <span>
                  {{ t('metrics.table.duration') }}:
                  {{ fmtDuration(selectedRow.durationMs) }}ms
                </span>
                <span>
                  {{ t('metrics.table.bytes') }}:
                  {{ fmtBytes(selectedRow.responseBytes || 0) }}
                </span>
              </div>
              <button class="metrics-panel__close" @click.stop="selectRow(null)">
                ✕
              </button>
            </div>
            <div class="metrics-panel__details-grid">
              <div class="metrics-panel__details-block">
                <div class="metrics-panel__details-label">
                  {{ t('metrics.details.requestBody') }}
                </div>
                <pre class="metrics-panel__details-pre">{{
                  formatObject(selectedRow.requestBody)
                }}</pre>
                <div class="metrics-panel__details-label">
                  {{ t('metrics.details.params') }}
                </div>
                <pre class="metrics-panel__details-pre">{{
                  formatObject(selectedRow.requestParams)
                }}</pre>
                <div class="metrics-panel__details-label">
                  {{ t('metrics.details.headers') }}
                </div>
                <pre class="metrics-panel__details-pre">{{
                  formatObject(selectedRow.requestHeaders)
                }}</pre>
              </div>
              <div class="metrics-panel__details-block">
                <div class="metrics-panel__details-label">
                  {{ t('metrics.details.response') }}
                </div>
                <pre class="metrics-panel__details-pre">{{
                  formatObject(selectedRow.responseBody ?? selectedRow.error?.message)
                }}</pre>
                <div class="metrics-panel__details-label">
                  {{ t('metrics.details.headers') }}
                </div>
                <pre class="metrics-panel__details-pre">{{
                  formatObject(selectedRow.responseHeaders)
                }}</pre>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>
