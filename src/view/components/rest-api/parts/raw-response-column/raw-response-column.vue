<script setup lang="ts">
  import '@/view/components/rest-api/parts/raw-response-column/raw-response-column.scss'

  import { useI18n } from '@/view/composables/use-i18n.ts'

  const { t } = useI18n()

  interface Props {
    loading: boolean
    error: string | null
    rawResponse: any
  }

  defineProps<Props>()

  const formatJson = (data: any) => {
    if (!data) return ''
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }
</script>

<template>
  <div class="raw-response-column">
    <h3 class="raw-response-column__title">{{ t('rest-api.rawResponseTitle') }}</h3>
    <div class="raw-response-column__card">
      <div v-if="loading" class="raw-response-column__loading-container">
        <div class="raw-response-column__spinner"></div>
        <p class="raw-response-column__loading-text">
          {{ t('rest-api.loadingRawResponse') }}
        </p>
      </div>
      <div v-else-if="error" class="raw-response-column__error-container">
        <pre class="raw-response-column__error-content">{{ error }}</pre>
      </div>
      <pre v-else-if="rawResponse" class="raw-response-column__json-output">{{
        formatJson(rawResponse)
      }}</pre>
      <div v-else class="raw-response-column__empty-state">
        <p class="raw-response-column__empty-text">{{ t('rest-api.noDataGetRandom') }}</p>
      </div>
    </div>
  </div>
</template>
