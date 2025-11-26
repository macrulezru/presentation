<script setup lang="ts">
  import Header from '@/components/header.vue'
  import Splash from '@/components/splash.vue'
  import About from '@/components/about.vue'
  import ExperienceTimeline from '@/components/experience-timeline.vue'
  import TravelshopProject from '@/components/travelshop-project.vue'
  import Features from '@/components/features.vue'

  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const aboutSection = ref<InstanceType<typeof About>>()

  const scrollToAbout = () => {
    if (aboutSection.value?.container) {
      const headerHeight = 60
      const elementPosition = aboutSection.value.container.offsetTop
      const offsetPosition = elementPosition - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }
</script>

<template>
  <div class="page">
    <Header />
    <Splash ref="splashSection" @scrollToAbout="scrollToAbout" />
    <About ref="aboutSection" />
    <ExperienceTimeline />
    <TravelshopProject />
    <h3 class="examples-title">{{ t('app.examples_title') }}</h3>
    <Features />
  </div>
</template>

<style scoped>
  .page {
    min-height: 100vh;
  }

  .examples-title {
    margin: 3rem auto 0 auto;
    padding: 0 1rem 1rem 1rem;
    border-bottom: 1px solid #e1e5e9;
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
    color: #2c3e50;
    max-width: 1200px;
  }

  @media (max-width: 768px) {
    .examples-title {
      font-size: 1.5rem;
      margin-top: 2rem;
      padding: 0 0.5rem 0.75rem 0.5rem;
    }
  }
</style>
