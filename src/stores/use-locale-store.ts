import { defineStore } from 'pinia';
import { readonly, ref } from 'vue';

import { LocalesEnum, type LocalesEnumType } from '@/enums/locales.enum';

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref<LocalesEnumType>(LocalesEnum.RU);

  const setLocale = (locale: LocalesEnumType) => {
    currentLocale.value = locale;
  };

  return {
    currentLocale: readonly(currentLocale),
    setLocale,
  };
});
