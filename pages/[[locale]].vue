<script setup lang="ts">
import { onMounted, onUnmounted, defineAsyncComponent, computed } from 'vue';

import { PageSectionsEnum } from '@/enums/page-sections.enum';
import Header from '@/view/components/header/header.vue';
import { useMacrulezBadge } from '~/composables/useMacrulezBadge';
import { useScrollRouting } from '@/view/composables/use-scroll-routing';
import { useSectionsConfig } from '~/composables/useSectionsConfig';

const MetricsPanel = defineAsyncComponent(() => import('@/view/components/metrics/metrics-panel.vue'));

const route = useRoute();
const locale = computed(() => String(route.params.locale || 'ru'));

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
}));

// Nuxt SSR data (попадает в payload, чтобы гидрация совпала с HTML)
const { data: experienceRes } = await usePortfolioExperience(locale);
const { data: npmRes } = await usePortfolioNpmPackages(locale);
const { data: artsRes } = await usePortfolioArts();

const { init, destroy } = useScrollRouting();
const { sectionsConfig } = useSectionsConfig();

useMacrulezBadge();

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
      <component
        :is="section.component"
        v-bind="
          section.id === PageSectionsEnum.EXPERIENCE
            ? experienceRes?.success
              ? { ssrItems: experienceRes.data || [] }
              : {}
            : section.id === PageSectionsEnum.ARTS
              ? artsRes?.success
                ? { ssrArts: artsRes.data || [] }
                : {}
              : section.id === PageSectionsEnum.STUFF
                ? npmRes?.success
                  ? { ssrNpmItems: npmRes.data || [] }
                  : {}
                : {}
        "
      />
    </section>
  </div>
  <component :is="MetricsPanel" />
</template>

