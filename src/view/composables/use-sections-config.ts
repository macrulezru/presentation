// use-sections-config.ts
import { ref, computed, type Component } from 'vue'
import Splash from '@/view/components/splash/splash.vue'
import About from '@/view/components/about/about.vue'
import ExperienceTimeline from '@/view/components/experience-timeline/experience-timeline.vue'
import TravelshopProject from '@/view/components/travelshop-project/travelshop-project.vue'
import Examples from '@/view/components/examples/examples.vue'
import Arts from '@/view/components/arts/arts.vue'
import RemoteWorkplace from '@/view/components/remote-workplace/remote-workplace.vue'
import Contacts from '@/view/components/contacts/contacts.vue'
import { PageSectionsEnum } from '@/enums/page-sections.enum'

export interface SectionConfig {
  id: PageSectionsEnum
  component: Component
  order?: number
}

// Все доступные секции (без порядка)
const allSections: Record<PageSectionsEnum, Component> = {
  [PageSectionsEnum.SPLASH]: Splash,
  [PageSectionsEnum.ABOUT]: About,
  [PageSectionsEnum.EXPERIENCE]: ExperienceTimeline,
  [PageSectionsEnum.TRAVELSHOP]: TravelshopProject,
  [PageSectionsEnum.FEATURES]: Examples,
  [PageSectionsEnum.ARTS]: Arts,
  [PageSectionsEnum.REMOTE_WORKPLACE]: RemoteWorkplace,
  [PageSectionsEnum.CONTACTS]: Contacts,
}

// Реактивное состояние порядка секций
const sectionOrder = ref<PageSectionsEnum[]>([
  PageSectionsEnum.SPLASH,
  PageSectionsEnum.ABOUT,
  PageSectionsEnum.EXPERIENCE,
  PageSectionsEnum.TRAVELSHOP,
  PageSectionsEnum.FEATURES,
  PageSectionsEnum.ARTS,
  PageSectionsEnum.REMOTE_WORKPLACE,
  PageSectionsEnum.CONTACTS,
])

// Реактивный список конфигураций секций
export const sectionsConfig = computed<SectionConfig[]>(() => {
  return sectionOrder.value.map(id => ({
    id,
    component: allSections[id],
  }))
})

// Функции для управления порядком
export function useSectionsConfig() {
  // Установить новый порядок секций
  const setSectionsOrder = (newOrder: PageSectionsEnum[]) => {
    sectionOrder.value = newOrder
  }

  // Добавить секцию в определенную позицию
  const insertSection = (sectionId: PageSectionsEnum, position: number) => {
    const newOrder = [...sectionOrder.value]
    // Удаляем если уже есть
    const existingIndex = newOrder.indexOf(sectionId)
    if (existingIndex !== -1) {
      newOrder.splice(existingIndex, 1)
    }
    // Вставляем на новую позицию
    newOrder.splice(position, 0, sectionId)
    sectionOrder.value = newOrder
  }

  // Удалить секцию
  const removeSection = (sectionId: PageSectionsEnum) => {
    sectionOrder.value = sectionOrder.value.filter(id => id !== sectionId)
  }

  // Переместить секцию вверх/вниз
  const moveSection = (sectionId: PageSectionsEnum, direction: 'up' | 'down') => {
    const currentOrder = [...sectionOrder.value]
    const currentIndex = currentOrder.indexOf(sectionId)

    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex >= 0 && newIndex < currentOrder.length) {
      const element1 = currentOrder[currentIndex]
      const element2 = currentOrder[newIndex]

      if (element1 !== undefined && element2 !== undefined) {
        currentOrder[currentIndex] = element2
        currentOrder[newIndex] = element1
      }

      sectionOrder.value = currentOrder
    }
  }

  // Сбросить к порядку по умолчанию
  const resetToDefault = () => {
    sectionOrder.value = [
      PageSectionsEnum.SPLASH,
      PageSectionsEnum.ABOUT,
      PageSectionsEnum.EXPERIENCE,
      PageSectionsEnum.TRAVELSHOP,
      PageSectionsEnum.FEATURES,
      PageSectionsEnum.ARTS,
      PageSectionsEnum.REMOTE_WORKPLACE,
      PageSectionsEnum.CONTACTS,
    ]
  }

  return {
    sectionsConfig,
    setSectionsOrder,
    insertSection,
    removeSection,
    moveSection,
    resetToDefault,
    getAllSectionIds: () => Object.keys(allSections) as PageSectionsEnum[],
  }
}
