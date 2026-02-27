import { ref, computed, type Component } from 'vue';

import { PageSectionsEnum } from '@/enums/page-sections.enum';
import About from '@/view/components/about/about.vue';
import Arts from '@/view/components/arts/arts.vue';
import Contacts from '@/view/components/contacts/contacts.vue';
import Examples from '@/view/components/examples/examples.vue';
import ExperienceTimeline from '@/view/components/experience-timeline/experience-timeline.vue';
import RemoteWorkplace from '@/view/components/remote-workplace/remote-workplace.vue';
import Splash from '@/view/components/splash/splash.vue';
import Stuff from '@/view/components/stuff/stuff.vue';
import TravelshopProject from '@/view/components/travelshop-project/travelshop-project.vue';

export interface SectionConfig {
  id: PageSectionsEnum;
  component: Component;
  order?: number;
}

// Все доступные секции (без порядка)
const allSections: Partial<Record<PageSectionsEnum, Component>> = {
  [PageSectionsEnum.SPLASH]: Splash,
  [PageSectionsEnum.ABOUT]: About,
  [PageSectionsEnum.EXPERIENCE]: ExperienceTimeline,
  [PageSectionsEnum.TRAVELSHOP]: TravelshopProject,
  [PageSectionsEnum.FEATURES]: Examples,
  [PageSectionsEnum.STUFF]: Stuff,
  [PageSectionsEnum.ARTS]: Arts,
  [PageSectionsEnum.REMOTE_WORKPLACE]: RemoteWorkplace,
  [PageSectionsEnum.CONTACTS]: Contacts,
};

// Реактивное состояние порядка секций
const sectionOrder = ref<PageSectionsEnum[]>([
  PageSectionsEnum.SPLASH,
  PageSectionsEnum.ABOUT,
  PageSectionsEnum.EXPERIENCE,
  PageSectionsEnum.TRAVELSHOP,
  PageSectionsEnum.FEATURES,
  PageSectionsEnum.STUFF,
  PageSectionsEnum.ARTS,
  PageSectionsEnum.REMOTE_WORKPLACE,
  PageSectionsEnum.CONTACTS,
  PageSectionsEnum.BLOG,
]);

export const sectionsConfig = computed<SectionConfig[]>(() => {
  return sectionOrder.value
    .filter(id => Boolean(allSections[id]))
    .map(id => ({
      id,
      component: allSections[id] as Component,
    }));
});

export function useSectionsConfig() {
  const setSectionsOrder = (newOrder: PageSectionsEnum[]) => {
    sectionOrder.value = newOrder;
  };

  const insertSection = (sectionId: PageSectionsEnum, position: number) => {
    const newOrder = [...sectionOrder.value];
    const existingIndex = newOrder.indexOf(sectionId);
    if (existingIndex !== -1) {
      newOrder.splice(existingIndex, 1);
    }
    newOrder.splice(position, 0, sectionId);
    sectionOrder.value = newOrder;
  };

  const removeSection = (sectionId: PageSectionsEnum) => {
    sectionOrder.value = sectionOrder.value.filter(id => id !== sectionId);
  };

  const moveSection = (sectionId: PageSectionsEnum, direction: 'up' | 'down') => {
    const currentOrder = [...sectionOrder.value];
    const currentIndex = currentOrder.indexOf(sectionId);

    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < currentOrder.length) {
      const element1 = currentOrder[currentIndex];
      const element2 = currentOrder[newIndex];

      if (element1 !== undefined && element2 !== undefined) {
        currentOrder[currentIndex] = element2;
        currentOrder[newIndex] = element1;
      }

      sectionOrder.value = currentOrder;
    }
  };

  const resetToDefault = () => {
    sectionOrder.value = [
      PageSectionsEnum.SPLASH,
      PageSectionsEnum.ABOUT,
      PageSectionsEnum.EXPERIENCE,
      PageSectionsEnum.TRAVELSHOP,
      PageSectionsEnum.FEATURES,
      PageSectionsEnum.STUFF,
      PageSectionsEnum.ARTS,
      PageSectionsEnum.REMOTE_WORKPLACE,
      PageSectionsEnum.CONTACTS,
    ];
  };

  return {
    sectionsConfig,
    setSectionsOrder,
    insertSection,
    removeSection,
    moveSection,
    resetToDefault,
    getAllSectionIds: () => Object.keys(allSections) as PageSectionsEnum[],
    getSectionOrder: () => sectionOrder.value,
  };
}

