<script setup lang="ts">
  import Header from '@/view/components/header/header.vue'

  import '@/view/pages/index.scss'

  import { onBeforeMount, onMounted, onUnmounted } from 'vue'
  import { useI18n } from '@/view/composables/use-i18n.ts'
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts'
  import { sectionConfigs } from '@/view/config/section-config'

  const { initLocale } = useI18n()

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

    <section v-for="section in sectionConfigs" :key="section.id" :id="section.id">
      <component :is="section.component" />
    </section>
  </div>
</template>
