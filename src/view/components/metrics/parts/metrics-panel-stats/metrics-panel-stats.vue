<script setup lang="ts">
  import { useI18n } from '@/view/composables/use-i18n';
  import './metrics-panel-stats.scss';

  interface Props {
    shown: number;
    total: number;
    avgDuration: number;
    chartsVisible: boolean;
  }

  interface Emits {
    (e: 'toggle-charts'): void;
    (e: 'export'): void;
    (e: 'clear'): void;
  }

  defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { t } = useI18n();
</script>

<template>
  <div class="metrics-panel-stats">
    <div class="metrics-panel-stats__info">
      <span>{{ t('metrics.stats.shown') }}: {{ shown }}/{{ total }}</span>
      <span>
        {{ t('metrics.stats.avg') }}: {{ avgDuration }}
        {{ t('metrics.table.duration') }}
      </span>
      <button
        class="metrics-panel-stats__icon-btn"
        :class="{ 'is-active': chartsVisible }"
        :title="t('metrics.actions.toggleCharts')"
        @click="emit('toggle-charts')"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M4 16v2h16v-2zm0-5v2l4 1.5 4-3 4 1.5 4-3V8l-4 3-4-1.5-4 3z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
    <div class="metrics-panel-stats__actions">
      <button class="metrics-panel-stats__btn" @click="emit('export')">
        {{ t('metrics.actions.export') }}
      </button>
      <button class="metrics-panel-stats__btn" @click="emit('clear')">
        {{ t('metrics.actions.clear') }}
      </button>
    </div>
  </div>
</template>
