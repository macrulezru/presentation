<script setup lang="ts">
  import EmptyState from '@/view/components/rest-api/parts/empty-state/empty-state.vue';

  import '@/view/components/rest-api/parts/person-formatted-column/person-formatted-column.scss';

  import type { Props } from './types';
  import { useI18n } from '@/view/composables/use-i18n.ts';

  const { t } = useI18n();

  defineProps<Props>();
</script>

<template>
  <div class="person-formatted-column">
    <EmptyState v-if="loading" :loading="true" />
    <div v-else-if="error" class="person-formatted-column__error-container">
      <pre>{{ error }}</pre>
    </div>
    <div v-else-if="formattedData" class="person-formatted-column__content">
      <div class="person-formatted-column__info-section">
        <h4>{{ t('rest-api.responseInfo') }}</h4>
        <div class="person-formatted-column__info-grid">
          <div>
            <strong>{{ t('rest-api.seed') }}</strong>
            {{ formattedData.seed }}
          </div>
          <div>
            <strong>{{ t('rest-api.results') }}</strong>
            {{ formattedData.count }}
          </div>
          <div>
            <strong>{{ t('rest-api.page') }}</strong>
            {{ formattedData.page }}
          </div>
          <div>
            <strong>{{ t('rest-api.version') }}</strong>
            {{ formattedData.version }}
          </div>
        </div>
      </div>

      <div
        v-for="(person, index) in formattedData.persons"
        :key="index"
        class="person-formatted-column__person-card"
      >
        <div class="person-formatted-column__person-header">
          <img
            :src="person.profilePicture"
            :alt="person.fullName"
            class="person-formatted-column__avatar"
          />
          <div class="person-formatted-column__person-title">
            <h4>{{ person.fullName }}</h4>
            <p class="person-formatted-column__short-name">{{ person.shortName }}</p>
            <div class="person-formatted-column__person-meta">
              <span class="person-formatted-column__gender">{{ person.gender }}</span>
              <span class="person-formatted-column__nationality">{{ person.nat }}</span>
              <span class="person-formatted-column__age">
                {{ person.age }} {{ t('rest-api.years') }}
              </span>
            </div>
          </div>
        </div>

        <div class="person-formatted-column__person-details">
          <div class="person-formatted-column__detail-item">
            <strong>{{ t('rest-api.email') }}</strong>
            {{ person.email }}
          </div>
          <div class="person-formatted-column__detail-item">
            <strong>{{ t('rest-api.phone') }}</strong>
            {{ person.phone }}
          </div>
          <div class="person-formatted-column__detail-item">
            <strong>{{ t('rest-api.cell') }}</strong>
            {{ person.cell }}
          </div>
          <div class="person-formatted-column__detail-item">
            <strong>{{ t('rest-api.location') }}</strong>
            {{ person.locationString }}
          </div>
          <div class="person-formatted-column__detail-item">
            <strong>{{ t('rest-api.address') }}</strong>
            {{ person.streetAddress }}
          </div>
          <div class="person-formatted-column__detail-item">
            <strong>{{ t('rest-api.username') }}</strong>
            {{ person.login.username }}
          </div>
          <div class="person-formatted-column__detail-item">
            <strong>{{ t('rest-api.registrationAge') }}</strong>
            {{ person.registrationAge }} {{ t('rest-api.years') }}
          </div>
        </div>
      </div>
    </div>
    <EmptyState v-else />
  </div>
</template>
