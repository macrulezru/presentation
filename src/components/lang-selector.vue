<!-- components/lang-selector.vue -->
<script setup lang="ts">
  import DlvSelect from '@/components/ui/DlvSelect.vue'
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const { changeLocale, locale } = useI18n()
  const route = useRoute()

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
      changeLocale(option.value)
    },
  })

  const handleLanguageChange = (option: LanguageOption) => {
    // Получаем текущую секцию из URL
    const currentSection = route.params.section as string

    // Формируем новый путь с сохранением секции
    const newPath = currentSection
      ? `/${option.value}/${currentSection}`
      : `/${option.value}`

    // Вызываем changeLocale с путем для сохранения секции
    changeLocale(option.value, newPath)
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
