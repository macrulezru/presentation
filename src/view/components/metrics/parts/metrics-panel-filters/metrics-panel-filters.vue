<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';
  import './metrics-panel-filters.scss';

  export type MethodFilter =
    | 'ALL'
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'OPTIONS'
    | 'HEAD';
  export type StatusFilter = 'ALL' | '2xx' | '3xx' | '4xx' | '5xx' | 'ERROR_ONLY';

  interface Props {
    method: MethodFilter;
    status: StatusFilter;
    url: string;
    limit: number;
  }

  interface Emits {
    (e: 'update:method', value: MethodFilter): void;
    (e: 'update:status', value: StatusFilter): void;
    (e: 'update:url', value: string): void;
    (e: 'update:limit', value: number): void;
    (e: 'close'): void;
  }

  defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { t } = useI18n();
</script>

<template>
  <div class="metrics-panel-filters">
    <div class="metrics-panel-filters__title">{{ t('metrics.title') }}</div>
    <div class="metrics-panel-filters__controls">
      <label>
        {{ t('metrics.filters.method') }}
        <select
          :value="method"
          @change="
            emit(
              'update:method',
              ($event.target as HTMLSelectElement).value as MethodFilter,
            )
          "
        >
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
        <select
          :value="status"
          @change="
            emit(
              'update:status',
              ($event.target as HTMLSelectElement).value as StatusFilter,
            )
          "
        >
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
          :value="url"
          class="metrics-panel-filters__input"
          :placeholder="t('metrics.filters.urlPlaceholder')"
          @input="emit('update:url', ($event.target as HTMLInputElement).value)"
        />
      </label>
      <label>
        {{ t('metrics.filters.limit') }}
        <input
          :value="limit"
          class="metrics-panel-filters__input metrics-panel-filters__input--limit"
          type="number"
          min="1"
          max="500"
          @input="emit('update:limit', Number(($event.target as HTMLInputElement).value))"
        />
      </label>
      <button
        class="metrics-panel-filters__close"
        :title="`${t('common.close')} (Shift+~)`"
        @click="emit('close')"
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L9 9M9 1L1 9"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
