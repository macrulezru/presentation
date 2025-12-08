<script setup lang="ts">
  import Header from '@/components/header.vue'
  import Splash from '@/components/splash.vue'
  import About from '@/components/about.vue'
  import ExperienceTimeline from '@/components/experience-timeline.vue'
  import TravelshopProject from '@/components/travelshop-project.vue'
  import Features from '@/components/features.vue'
  import Testing from '@/components/testing.vue'
  import RemoteWorkplace from '@/components/remote-workplace.vue'
  import Contacts from '@/components/contacts.vue'

  import { onMounted, onUnmounted, watch, nextTick, ref } from 'vue'
  import { useI18n } from '@/composables/useI18n'
  import { useRoute } from 'vue-router'
  import { useScrollRouting } from '@/composables/useScrollRouting'
  import { pageSectionsEnum } from '@/enums/page-sections'

  const { t, initLocale } = useI18n()
  const route = useRoute()

  const scrollRouting = useScrollRouting()
  const { navigateToSection, scrollToSection, init, destroy } = scrollRouting

  // Флаг для отслеживания смены языка
  const isChangingLocale = ref(false)

  onMounted(() => {
    initLocale()
    setTimeout(() => {
      init()
    }, 100)
  })

  onUnmounted(() => {
    destroy()
  })

  // Обработчик изменения секции
  watch(
    () => route.params.section,
    async (newSection, oldSection) => {
      if (newSection !== oldSection && !isChangingLocale.value) {
        await nextTick()

        if (newSection) {
          setTimeout(() => {
            scrollToSection(newSection as string)
          }, 100)
        } else {
          // Если секции нет - это главная страница
          setTimeout(() => {
            scrollToSection('splash')
          }, 100)
        }
      }
    },
  )
</script>

<template>
  <div class="page">
    <Header />

    <section :id="pageSectionsEnum.SPLASH">
      <Splash @scrollToAbout="navigateToSection('about')" />
    </section>

    <section :id="pageSectionsEnum.ABOUT">
      <About />
    </section>

    <section :id="pageSectionsEnum.EXPERIENCE">
      <ExperienceTimeline />
    </section>

    <section :id="pageSectionsEnum.TRAVELSHOP">
      <TravelshopProject />
    </section>

    <section :id="pageSectionsEnum.FEATURES">
      <h3 class="examples-title">{{ t('app.examples_title') }}</h3>
      <Testing />
      <Features />
    </section>
    <section :id="pageSectionsEnum.REMOTE_WORKPLACE">
      <RemoteWorkplace />
    </section>
    <section :id="pageSectionsEnum.CONTACTS">
      <Contacts />
    </section>
  </div>
</template>

<style scoped>
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

  @media (max-width: 768px) {
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
