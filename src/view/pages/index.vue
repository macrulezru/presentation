<script setup lang="ts">
  import Header from '@/view/components/header/header.vue'
  import SectionEditor from '@/view/components/section-editor/section-editor.vue'
  import RestApi from '@/view/components/rest-api/rest-api.vue'

  import '@/view/pages/index.scss'

  import { onBeforeMount, onMounted, onUnmounted } from 'vue'
  import { useI18n } from '@/view/composables/use-i18n.ts'
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts'
  import { useSectionsConfig } from '@/view/composables/use-sections-config'
  import { useNavigationStore } from '@/stores/use-navigation-store.ts'
  import { storeToRefs } from 'pinia'

  const { initLocale } = useI18n()
  const { init, destroy } = useScrollRouting()

  const { sectionsConfig } = useSectionsConfig()

  const navigationStore = useNavigationStore()
  const { showSectionEditor } = storeToRefs(navigationStore)

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
    <SectionEditor v-model="showSectionEditor" />
    <section v-for="section in sectionsConfig" :key="section.id" :id="section.id">
      <component :is="section.component" />
    </section>
    <RestApi />
  </div>
</template>
