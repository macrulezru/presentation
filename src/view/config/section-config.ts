import Splash from '@/view/components/splash/splash.vue'
import About from '@/view/components/about/about.vue'
import ExperienceTimeline from '@/view/components/experience-timeline/experience-timeline.vue'
import TravelshopProject from '@/view/components/travelshop-project/travelshop-project.vue'
import Examples from '@/view/components/examples/examples.vue'
import Arts from '@/view/components/arts/arts.vue'
import RemoteWorkplace from '@/view/components/remote-workplace/remote-workplace.vue'
import Contacts from '@/view/components/contacts/contacts.vue'

import type { Component } from 'vue'
import { PageSectionsEnum } from '@/enums/page-sections.enum'

export interface SectionConfig {
  id: PageSectionsEnum
  component: Component
}

export const sectionConfigs: SectionConfig[] = [
  { id: PageSectionsEnum.SPLASH, component: Splash },
  { id: PageSectionsEnum.ABOUT, component: About },
  { id: PageSectionsEnum.EXPERIENCE, component: ExperienceTimeline },
  { id: PageSectionsEnum.TRAVELSHOP, component: TravelshopProject },
  { id: PageSectionsEnum.FEATURES, component: Examples },
  { id: PageSectionsEnum.ARTS, component: Arts },
  { id: PageSectionsEnum.REMOTE_WORKPLACE, component: RemoteWorkplace },
  { id: PageSectionsEnum.CONTACTS, component: Contacts },
]
