<script setup lang="ts">
  import Header from '@/components/header.vue'
  import Splash from '@/components/splash.vue'
  import About from '@/components/about.vue'
  import ExperienceTimeline from '@/components/experience-timeline.vue'
  import TravelshopProject from '@/components/travelshop-project.vue'
  import Pipeline from '@/components/pipeline.vue'
  import Localization from '@/components/localization.vue'
  import SeatMap from '@/components/seat-map.vue'

  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const splashSection = ref('splashSection')
  const aboutSection = ref('aboutSection')

  const scrollToAbout = () => {}
</script>

<template>
  <div class="page">
    <Header />
    <Splash ref="splashSection" @scrollToAbout="scrollToAbout" />
    <About ref="aboutSection" />
    <ExperienceTimeline />
    <TravelshopProject />
    <h3 class="examples-title">{{ t('app.examples_title') }}</h3>
    <Pipeline />
    <Localization />
    <SeatMap />
  </div>
</template>

<style scoped>
  .examples-title {
    margin-top: 30px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e1e5e9;
    font-size: 30px;
    text-align: center;
  }
</style>
