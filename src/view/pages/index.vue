<script setup lang="ts">
  import Header from '@/view/components/header/header.vue'
  import Splash from '@/view/components/splash/splash.vue'
  import About from '@/view/components/about/about.vue'
  import ExperienceTimeline from '@/view/components/experience-timeline/experience-timeline.vue'
  import TravelshopProject from '@/view/components/travelshop-project/travelshop-project.vue'
  import Features from '@/view/components/features/features.vue'
  import Testing from '@/view/components/testing/testing.vue'
  import RemoteWorkplace from '@/view/components/remote-workplace/remote-workplace.vue'
  import Contacts from '@/view/components/contacts/contacts.vue'

  import '@/view/pages/index.scss'

  import { onBeforeMount, onMounted, onUnmounted } from 'vue'
  import { useI18n } from '@/view/composables/use-i18n.ts'
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts'
  import { PageSectionsEnum } from '@/enums/page-sections.enum'

  const { t, initLocale } = useI18n()

  const { init, destroy } = useScrollRouting()

  onBeforeMount(() => {
    initLocale()
  })

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    destroy()
  })
</script>

<template>
  <div class="app">
    <Header />

    <section :id="PageSectionsEnum.SPLASH">
      <Splash />
    </section>

    <section :id="PageSectionsEnum.ABOUT">
      <About />
    </section>

    <section :id="PageSectionsEnum.EXPERIENCE">
      <ExperienceTimeline />
    </section>

    <section :id="PageSectionsEnum.TRAVELSHOP">
      <TravelshopProject />
    </section>

    <section :id="PageSectionsEnum.FEATURES">
      <h3 class="app__examples-title">{{ t('app.examples_title') }}</h3>
      <Testing />
      <Features />
    </section>
    <section :id="PageSectionsEnum.REMOTE_WORKPLACE">
      <RemoteWorkplace />
    </section>
    <section :id="PageSectionsEnum.CONTACTS">
      <Contacts />
    </section>
  </div>
</template>
