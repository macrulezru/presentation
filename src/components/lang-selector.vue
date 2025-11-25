<script setup lang="ts">
  import DlvSelect from '@/components/ui/DlvSelect.vue'

  import { computed } from 'vue'

  const { changeLocale, locale } = useI18n()

  interface LanguageOption {
    value: string
    name: string
  }

  const languageOptions: LanguageOption[] = [
    { value: 'ru', name: 'Русский' },
    { value: 'en', name: 'English' },
    { value: 'de', name: 'Deutsch' },
  ]

  const currentLanguage = computed({
    get: () =>
      languageOptions.find(opt => opt.value === locale.value) || languageOptions[0],
    set: (option: LanguageOption) => {
      changeLocale(option.value as 'ru' | 'en' | 'de')
    },
  })

  const handleLanguageChange = (option: LanguageOption) => {
    changeLocale(option.value as 'ru' | 'en' | 'de')
  }
</script>

<template>
  <DlvSelect
    v-model="currentLanguage"
    :options="languageOptions"
    placeholder="Select language"
    @change="handleLanguageChange"
  />
</template>

<style scoped></style>
