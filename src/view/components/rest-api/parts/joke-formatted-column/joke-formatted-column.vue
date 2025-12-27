<script setup lang="ts">
  import type { Props } from './types';

  import EmptyState from '@/view/components/rest-api/parts/empty-state/empty-state.vue';
  import { useI18n } from '@/view/composables/use-i18n.ts';
  import '@/view/components/rest-api/parts/joke-formatted-column/joke-formatted-column.scss';

  const { t } = useI18n();

  defineProps<Props>();
</script>

<template>
  <div class="joke-formatted-column">
    <EmptyState v-if="loading" :loading="true" />
    <div v-else-if="error" class="joke-formatted-column__error-container">
      <pre>{{ error }}</pre>
    </div>
    <div v-else-if="formattedData" class="joke-formatted-column__content">
      <div class="joke-formatted-column__joke-card">
        <div class="joke-formatted-column__joke-header">
          <span class="joke-formatted-column__joke-type">{{ formattedData.type }}</span>
          <span class="joke-formatted-column__joke-id">ID: {{ formattedData.id }}</span>
        </div>
        <div class="joke-formatted-column__joke-body">
          <p class="joke-formatted-column__setup">
            <strong>{{ t('rest-api.setup') }}</strong>
            {{ formattedData.setup }}
          </p>
          <p class="joke-formatted-column__punchline">
            <strong>{{ t('rest-api.punchline') }}</strong>
            {{ formattedData.punchline }}
          </p>
        </div>
        <div class="joke-formatted-column__joke-full">
          <strong>{{ t('rest-api.fullJoke') }}</strong>
          <p class="joke-formatted-column__joke-full-setup">{{ formattedData.Setup }}</p>
          <p class="joke-formatted-column__joke-full-punchline">
            {{ formattedData.Punchline }}
          </p>
        </div>
      </div>
    </div>
    <EmptyState v-else />
  </div>
</template>
