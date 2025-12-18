import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const currentSection = ref<string>('splash')
  const isScrolling = ref(false)
  const sections = ref<Array<{ id: string; name: string; element: HTMLElement | null }>>(
    [],
  )
  const showSectionEditor = ref<boolean>(false)

  const activeSection = computed(() => currentSection.value)

  const setCurrentSection = (section: string) => {
    if (currentSection.value !== section) {
      currentSection.value = section
    }
  }

  const setIsScrolling = (value: boolean) => {
    isScrolling.value = value
  }

  const setSections = (
    newSections: Array<{ id: string; name: string; element: HTMLElement | null }>,
  ) => {
    sections.value = newSections
  }

  const setShowSectionEditor = (value: boolean) => {
    showSectionEditor.value = value
  }

  const getSectionById = (id: string) => {
    return sections.value.find(s => s.id === id)
  }

  return {
    currentSection,
    isScrolling,
    showSectionEditor,
    sections,
    activeSection,
    setCurrentSection,
    setIsScrolling,
    setSections,
    getSectionById,
    setShowSectionEditor,
  }
})
