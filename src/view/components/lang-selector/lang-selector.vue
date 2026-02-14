<script setup lang="ts">
  import { computed } from 'vue';

  import type { LanguageOption } from './types';

  import {
    LocalesEnum,
    type LocalesEnumType,
    LocalesToView,
  } from '@/enums/locales.enum.ts';
  import { useI18n } from '@/view/composables/use-i18n.ts';
  import Select from '@/view/ui/ui-select/ui-select.vue';

  import '@/view/components/lang-selector/lang-selector.scss';

  const { redirectToLocale, locale } = useI18n();

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
      redirectToLocale(option.value as LocalesEnumType);
    },
  });

  const handleLanguageChange = (option: LanguageOption) => {
    redirectToLocale(option.value as LocalesEnumType);
  };
</script>

<template>
  <div class="lang-selector">
    <Select
      v-model="currentLanguage"
      :options="languageOptions"
      :placeholder="currentLanguage?.name"
      @change="handleLanguageChange"
    />
  </div>
</template>
