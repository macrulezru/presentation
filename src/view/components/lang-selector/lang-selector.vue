<script setup lang="ts">
  import { computed } from 'vue';

  import type { LanguageOption } from './types';

  import {
    LocalesEnum,
    type LocalesEnumType,
    LocalesToView,
  } from '@/enums/locales.enum.ts';
  import { useNavigationStore } from '@/stores/use-navigation-store.ts';
  import { useI18n } from '@/view/composables/use-i18n.ts';
  import Select from '@/view/ui/ui-select/ui-select.vue';

  import '@/view/components/lang-selector/lang-selector.scss';

  const { changeLocale, locale, isLoading } = useI18n();
  const navigationStore = useNavigationStore();

  const languageOptions: LanguageOption[] = (
    Object.keys(LocalesEnum) as Array<keyof typeof LocalesEnum>
  ).map(key => ({
    value: LocalesEnum[key],
    name: LocalesToView[key],
  }));

  const currentLanguage = computed({
    get: () =>
      languageOptions.find(opt => opt.value === locale.value) || languageOptions[0],
    set: (option: LanguageOption) => {
      changeLocale(option.value as LocalesEnumType);
    },
  });

  const handleLanguageChange = (option: LanguageOption) => {
    if (isLoading.value) return;

    const activeSection = navigationStore.currentSection;
    const newPath =
      activeSection !== 'splash'
        ? `/${option.value}/${activeSection}`
        : `/${option.value}`;

    changeLocale(option.value as LocalesEnumType, newPath);
  };
</script>

<template>
  <div class="lang-selector">
    <Select
      v-model="currentLanguage"
      :options="languageOptions"
      :placeholder="currentLanguage?.name"
      :disabled="isLoading"
      @change="handleLanguageChange"
    >
      <template v-if="isLoading" #arrow>
        <div class="lang-selector__loader--small"></div>
      </template>
    </Select>
  </div>
</template>
