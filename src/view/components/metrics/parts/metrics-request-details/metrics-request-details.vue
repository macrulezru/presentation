<script setup lang="ts">
  import type { RequestRecord } from '@/core/metrics/metrics-bus';

  import { useI18n } from '@/view/composables/use-i18n';
  import UiColorCode from '@/view/ui/ui-color-code/ui-color-code.vue';
  import './metrics-request-details.scss';

  interface Props {
    request: RequestRecord;
  }

  interface Emits {
    (e: 'close'): void;
  }

  defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { t } = useI18n();

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
  <div class="metrics-request-details">
    <div class="metrics-request-details__head">
      <div class="metrics-request-details__title">
        {{ request.method }} {{ request.url }}
      </div>
      <div class="metrics-request-details__meta">
        <span>{{ t('metrics.table.status') }}: {{ request.status ?? '-' }}</span>
        <span>
          {{ t('metrics.table.duration') }}: {{ fmtDuration(request.durationMs) }}ms
        </span>
        <span>
          {{ t('metrics.table.bytes') }}:
          {{ fmtBytes(request.responseBytes || 0) }}
        </span>
      </div>
      <button class="metrics-request-details__close" @click.stop="emit('close')">
        ✕
      </button>
    </div>
    <div class="metrics-request-details__grid">
      <div class="metrics-request-details__block">
        <div class="metrics-request-details__label">
          {{ t('metrics.details.requestBody') }}
        </div>
        <pre class="metrics-request-details__pre">{{
          formatObject(request.requestBody)
        }}</pre>
        <div class="metrics-request-details__label">
          {{ t('metrics.details.params') }}
        </div>
        <pre class="metrics-request-details__pre">{{
          formatObject(request.requestParams)
        }}</pre>
        <div class="metrics-request-details__label">
          {{ t('metrics.details.headers') }}
        </div>
        <pre class="metrics-request-details__pre">{{
          formatObject(request.requestHeaders)
        }}</pre>
      </div>
      <div class="metrics-request-details__block">
        <div class="metrics-request-details__label">
          {{ t('metrics.details.response') }}
        </div>
        <UiColorCode
          class="metrics-request-details__pre"
          :code="request.responseBody ?? request.error?.message"
        />
        <div class="metrics-request-details__label">
          {{ t('metrics.details.headers') }}
        </div>
        <UiColorCode
          class="metrics-request-details__pre"
          :code="request.responseHeaders"
        />
      </div>
    </div>
  </div>
</template>
