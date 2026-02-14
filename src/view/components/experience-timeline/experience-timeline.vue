<script setup lang="ts">
  import '@/view/components/experience-timeline/experience-timeline.scss';

  import { computed } from 'vue';

  import { useExperienceItems } from './experience-items';
  import CompanyItem from './parts/company-item/company-item.vue';

  import { useI18n } from '@/view/composables/use-i18n';
  import UiLoading from '@/view/ui/ui-loading/ui-loading.vue';

  const { t } = useI18n();

  const experienceItems = useExperienceItems();

  const isLoading = computed(() => experienceItems.loading.value);

  const headCompany = computed(() => experienceItems.items.value.slice(0, 2));

  const overCompany = computed(() => experienceItems.items.value.slice(2));
</script>

<template>
  <div class="experience">
    <div class="experience__container">
      <div class="experience__title">{{ t('experience.title') }}</div>
      <div v-if="isLoading" class="experience__loader">
        <UiLoading type="circle" progressColor="#d941b0" />
      </div>
      <template v-else>
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
      </template>
    </div>
  </div>
</template>
