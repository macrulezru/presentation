<script setup lang="ts">
  import '@/view/components/rest-api/parts/request-info-column/request-info-column.scss';

  import type { Props } from './types';
  import { useI18n } from '@/view/composables/use-i18n.ts';

  const { t } = useI18n();

  defineProps<Props>();
</script>

<template>
  <div class="request-info-column">
    <h3 class="request-info-column__title">{{ t('rest-api.requestInformation') }}</h3>
    <div class="request-info-column__card">
      <div class="request-info-column__item">
        <strong>{{ t('rest-api.baseUrl') }}</strong>
        <code>{{ apiInfo.baseUrl }}</code>
      </div>
      <div class="request-info-column__item">
        <strong>{{ t('rest-api.endpoint') }}</strong>
        <code>{{ apiInfo.endpoint }}</code>
      </div>
      <div class="request-info-column__item">
        <strong>{{ t('rest-api.method') }}</strong>
        <code>{{ apiInfo.method }}</code>
      </div>
      <div class="request-info-column__item">
        <strong>{{ t('rest-api.fullUrl') }}</strong>
        <code>{{ apiInfo.fullUrl }}</code>
      </div>
      <div class="request-info-column__item">
        <strong>{{ t('rest-api.status') }}</strong>
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
