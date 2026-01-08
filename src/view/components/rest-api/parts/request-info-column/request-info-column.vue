<script setup lang="ts">
  import '@/view/components/rest-api/parts/request-info-column/request-info-column.scss';

  import type { Props } from './types';

  import { useI18n } from '@/view/composables/use-i18n.ts';

  const { t } = useI18n();

  defineProps<Props>();
</script>

<template>
  <div class="request-info-column">
    <div class="request-info-column__title">{{ t('rest-api.requestInformation') }}</div>
    <div class="request-info-column__card">
      <div class="request-info-column__item">
        {{ t('rest-api.baseUrl') }}
        <code>{{ apiInfo.baseUrl }}</code>
      </div>
      <div class="request-info-column__item">
        {{ t('rest-api.endpoint') }}
        <code>{{ apiInfo.endpoint }}</code>
      </div>
      <div class="request-info-column__item">
        {{ t('rest-api.method') }}
        <code>{{ apiInfo.method }}</code>
      </div>
      <div class="request-info-column__item">
        {{ t('rest-api.fullUrl') }}
        <code>{{ apiInfo.fullUrl }}</code>
      </div>
      <div class="request-info-column__item">
        {{ t('rest-api.status') }}
        <span
          :class="{
            'request-info-column__status request-info-column__status_loading': loading,
            'request-info-column__status request-info-column__status_success':
              !loading && !error,
            'request-info-column__status request-info-column__status_error': error,
            'request-info-column__status request-info-column__status_idle':
              !loading && !error,
          }"
        >
          {{
            loading
              ? t('rest-api.loadingStatus')
              : error
                ? t('rest-api.errorStatus')
                : t('rest-api.readyStatus')
          }}
        </span>
      </div>
    </div>
  </div>
</template>
