<script setup lang="ts">
  import Select from '@/view/ui/ui-select.vue'

  import { computed } from 'vue'
  import { useNavigationStore } from '@/stores/use-navigation-store.ts'
  import { LocalesEnum, type LocalesEnumType, LocalesToView } from '@/enums/locales.enum'

  const { changeLocale, locale, isLoading } = useI18n()
  const navigationStore = useNavigationStore()

  interface LanguageOption {
    value: string
    name: string
  }

  const languageOptions: LanguageOption[] = (
    Object.keys(LocalesEnum) as Array<keyof typeof LocalesEnum>
  ).map(key => ({
    value: LocalesEnum[key],
    name: LocalesToView[key],
  }))

  const currentLanguage = computed({
    get: () =>
      languageOptions.find(opt => opt.value === locale.value) || languageOptions[0],
    set: (option: LanguageOption) => {
      changeLocale(option.value as LocalesEnumType)
    },
  })

  const handleLanguageChange = (option: LanguageOption) => {
    if (isLoading.value) return

    const activeSection = navigationStore.currentSection
    const newPath =
      activeSection !== 'splash'
        ? `/${option.value}/${activeSection}`
        : `/${option.value}`

    changeLocale(option.value as LocalesEnumType, newPath)
  }
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
      <template #arrow v-if="isLoading">
        <div class="lang-selector__loader--small"></div>
      </template>
    </Select>
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
