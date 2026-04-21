<script setup lang="ts">
  import '@/view/components/experience-timeline/experience-timeline.scss';

  import { computed } from 'vue';

  import { useExperienceItems, type ExperienceItem } from './experience-items';
  import CompanyItem from './parts/company-item/company-item.vue';

  import UiLoading from '~/components/ui/UiLoading.vue';
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    ssrItems?: ExperienceItem[];
  }>();

  const isSSR = import.meta.env.SSR;
  const experienceItems = props.ssrItems || isSSR ? null : useExperienceItems();

  const items = computed(() => props.ssrItems ?? experienceItems?.items.value ?? []);

  const isLoading = computed(() =>
    props.ssrItems
      ? false
      : !experienceItems
        ? true
        : (experienceItems.loading.value ?? false),
  );

  const headCompany = computed(() => items.value.slice(0, 2));

  const overCompany = computed(() => items.value.slice(2));
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
          <span class="experience__years-text">2017 - 2025</span>
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
          <span class="experience__years-text">1998 - 2017</span>
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
