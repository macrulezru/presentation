<script setup lang="ts">
  import type { Props } from './types';

  import EmptyState from '@/view/components/rest-api/parts/empty-state/empty-state.vue';
  import { useI18n } from '@/view/composables/use-i18n.ts';
  import '@/view/components/rest-api/parts/joke-formatted-column/joke-formatted-column.scss';

  const { t } = useI18n();

  defineProps<Props>();

  // Эмодзи по типу шутки
  function getJokeEmoji(type: string) {
    switch (type) {
      case 'программисты':
        return '💻';
      case 'тестировщики':
        return '🧪';
      case 'баги':
        return '🐞';
      case 'офис':
        return '🏢';
      case 'геймдев':
        return '🎮';
      case 'фриланс':
        return '🌍';
      case 'ИИ':
        return '🤖';
      case 'дедлайны':
        return '⏰';
      case 'админы':
        return '🛡️';
      default:
        return '😂';
    }
  }
</script>

<template>
  <div class="joke-formatted-column">
    <EmptyState v-if="loading" :loading="true" />
    <div v-else-if="error" class="joke-formatted-column__error-container">
      <pre>{{ error }}</pre>
    </div>
    <div v-else-if="formattedData" class="joke-formatted-column__content">
      <div class="joke-formatted-column__joke-card">
        <div class="joke-formatted-column__joke-visual">
          <div class="joke-formatted-column__joke-emoji">
            {{ getJokeEmoji(formattedData.type) }}
          </div>
          <div class="joke-formatted-column__joke-type-title">
            {{ t('rest-api.jokeType.' + formattedData.type) }}
          </div>
          <div class="joke-formatted-column__joke-setup">
            {{ formattedData.setup }}
          </div>
          <div class="joke-formatted-column__joke-punchline">
            {{ formattedData.punchline }}
          </div>
          <div class="joke-formatted-column__joke-id">#{{ formattedData.id }}</div>
        </div>
      </div>
    </div>
    <EmptyState v-else />
  </div>
</template>
