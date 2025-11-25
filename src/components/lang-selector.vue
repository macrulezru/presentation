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
    { value: 'zh', name: '中文' },
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
  <div class="lang-selector">
    <DlvSelect
      v-model="currentLanguage"
      :options="languageOptions"
      :placeholder="currentLanguage?.name"
      @change="handleLanguageChange"
    />
  </div>
</template>

<style scoped>
  .lang-selector {
    display: flex;
    align-items: center;
  }
</style>
