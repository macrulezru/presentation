<script setup lang="ts">
  import Header from '@/view/components/header.vue'
  import Splash from '@/view/components/splash.vue'
  import About from '@/view/components/about.vue'
  import ExperienceTimeline from '@/view/components/experience-timeline.vue'
  import TravelshopProject from '@/view/components/travelshop-project.vue'
  import Features from '@/view/components/features.vue'
  import Testing from '@/view/components/testing.vue'
  import RemoteWorkplace from '@/view/components/remote-workplace.vue'
  import Contacts from '@/view/components/contacts.vue'

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
  <div class="page">
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
      <h3 class="examples-title">{{ t('app.examples_title') }}</h3>
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

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
  }

  .examples-title {
    margin: 0 auto;
    padding: 3rem 1rem 1rem;
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
    color: #2c3e50;
    max-width: 1200px;
  }

  section {
    scroll-margin-top: 80px;
  }

  @mixin media-tablet {
    .examples-title {
      font-size: 1.5rem;
      margin-top: 2rem;
      padding: 0 0.5rem 0.75rem 0.5rem;
    }

    section {
      scroll-margin-top: 60px;
    }
  }
</style>
