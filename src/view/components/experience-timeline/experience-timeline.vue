<script setup lang="ts">
  import '@/view/components/experience-timeline/experience-timeline.scss';

  import { computed } from 'vue';

  import { useExperienceItems } from './experience-items';
  import CompanyItem from './parts/company-item/company-item.vue';

  import { useI18n } from '@/view/composables/use-i18n';

  const { t } = useI18n();

  const experienceItems = useExperienceItems(t);

  const headCompany = computed(() => experienceItems.value.slice(0, 2));

  const overCompany = computed(() =>
    experienceItems.value.slice(2, experienceItems.value.length),
  );
</script>

<template>
  <div class="experience">
    <div class="experience__container">
      <div class="experience__title">{{ t('experience.title') }}</div>

      <div class="experience__years">
        <span class="experience__years-text">2025 - 2017</span>
      </div>
      <div class="experience__companies-header">
        <CompanyItem
          v-for="company in headCompany"
          :key="company.id"
          :company="company"
          isHeader
        />
      </div>

      <div class="experience__years">
        <span class="experience__years-text">2017 - 1998</span>
      </div>

      <div class="experience__companies">
        <CompanyItem
          v-for="company in overCompany"
          :key="company.id"
          :company="company"
        />
      </div>
    </div>
  </div>
</template>
