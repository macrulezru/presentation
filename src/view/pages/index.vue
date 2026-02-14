<script setup lang="ts">
  import { onBeforeMount, onMounted, onUnmounted, defineAsyncComponent } from 'vue';

  import Header from '@/view/components/header/header.vue';
  import { useI18n } from '@/view/composables/use-i18n.ts';
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts';
  import { useSectionsConfig } from '@/view/composables/use-sections-config';
  import { useMacrulezBadge } from '@/view/composables/useMacrulezBadge';

  import '@/view/pages/index.scss';

  const MetricsPanel = defineAsyncComponent(
    () => import('@/view/components/metrics/metrics-panel.vue'),
  );

  const { initLocale } = useI18n();
  const { init, destroy } = useScrollRouting();

  const { sectionsConfig } = useSectionsConfig();

  useMacrulezBadge();

  onBeforeMount(() => {
    initLocale();
  });

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    destroy();
  });
</script>

<template>
  <div class="app">
    <Header />
    <section v-for="section in sectionsConfig" :id="section.id" :key="section.id">
      <component :is="section.component" />
    </section>
  </div>
  <component :is="MetricsPanel" />
</template>
