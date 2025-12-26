<script setup lang="ts">
  import '@/view/components/rest-api/parts/empty-state/empty-state.scss';

  import type { Props } from './types';
  import { useI18n } from '@/view/composables/use-i18n.ts';

  const { t } = useI18n();

  defineProps<Props>();
</script>

<template>
  <div class="empty-state">
    <div v-if="loading" class="empty-state__loading-container">
      <div class="empty-state__spinner"></div>
      <p>{{ t('rest-api.loadingFormattedData') }}</p>
    </div>
    <div v-else class="empty-state__empty-content">
      <p>{{ t('rest-api.noDataGetRandom') }}</p>
    </div>
  </div>
</template>
