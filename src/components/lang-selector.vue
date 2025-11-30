<!-- components/lang-selector.vue -->
<script setup lang="ts">
  import DlvSelect from '@/components/ui/DlvSelect.vue'
  import { computed } from 'vue'
  import { useScrollRouting } from '@/composables/useScrollRouting'

  const { changeLocale, locale, isLoading } = useI18n()
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
    if (isLoading.value) return // Предотвращаем изменение во время загрузки

    const activeSection = getActiveSection()
    const newPath =
      activeSection !== 'splash'
        ? `/${option.value}/${activeSection}`
        : `/${option.value}`

    changeLocale(option.value, newPath)
  }
</script>

<template>
  <div class="lang-selector">
    <DlvSelect
      v-model="currentLanguage"
      :options="languageOptions"
      :placeholder="currentLanguage?.name"
      :disabled="isLoading"
      @change="handleLanguageChange"
    >
      <template #arrow v-if="isLoading">
        <div class="lang-selector__loader--small"></div>
      </template>
    </DlvSelect>
  </div>
</template>

<style scoped>
  .lang-selector {
    position: relative;
    display: flex;
    align-items: center;
  }

  .lang-selector__loader--small {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 8px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
