<!-- components/lang-selector.vue -->
<script setup lang="ts">
  import DlvSelect from '@/components/ui/DlvSelect.vue'
  import { computed } from 'vue'
  import { useScrollRouting } from '@/composables/useScrollRouting'

  const { changeLocale, locale } = useI18n()
  const { getActiveSection } = useScrollRouting()

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
    // Используем актуальную секцию из useScrollRouting, а не из URL
    const activeSection = getActiveSection()

    // Формируем новый путь с актуальной секцией
    const newPath =
      activeSection !== 'splash'
        ? `/${option.value}/${activeSection}`
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
