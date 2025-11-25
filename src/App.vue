<script setup lang="ts">
  import Header from '@/components/header.vue'
  import Splash from '@/components/splash.vue'
  import About from '@/components/about.vue'

  import { ref } from 'vue'

  const splashSection = ref('splashSection')
  const aboutSection = ref('aboutSection')

  const scrollToAbout = () => {}
</script>

<template>
  <div class="page">
    <Header />
    <Splash ref="splashSection" @scrollToAbout="scrollToAbout" />
    <About ref="aboutSection" />
  </div>
</template>

<style scoped></style>
