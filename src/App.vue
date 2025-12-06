<!-- App.vue -->
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
        // Ждем обновления DOM
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

    <section id="splash">
      <Splash @scrollToAbout="navigateToSection('about')" />
    </section>

    <section id="about">
      <About />
    </section>

    <section id="experience">
      <ExperienceTimeline />
    </section>

    <section id="travelshop">
      <TravelshopProject />
    </section>

    <section id="features">
      <h3 class="examples-title">{{ t('app.examples_title') }}</h3>
      <Testing />
      <Features />
    </section>
    <section id="remote-workplace">
      <RemoteWorkplace />
    </section>
    <section id="contacts">
      <Contacts />
    </section>
  </div>
</template>

<style scoped>
  .page {
    min-height: 100vh;
  }

  .examples-title {
    margin: 3rem auto 0 auto;
    padding: 0 1rem 1rem 1rem;
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
