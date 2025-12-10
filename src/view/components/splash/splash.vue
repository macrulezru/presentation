<script setup lang="ts">
  import '@/view/components/splash/splash.scss'

  import { ref } from 'vue'
  import { usePlasmaBackground } from '@/view/composables/use-three-splash.ts'
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts'
  import { PageSectionsEnum } from '@/enums/page-sections.enum.ts'

  const { t } = useI18n()
  const { navigateToSection } = useScrollRouting()

  const messages = computed(() => {
    return {
      welcome: t('splash.welcome'),
      subtitle: t('splash.subtitle'),
      description: t('splash.description'),
      more: t('splash.more'),
    }
  })

  const splashRef = ref<HTMLElement>()

  usePlasmaBackground(splashRef)
</script>

<template>
  <div ref="splashRef" class="splash">
    <div class="splash__animation" />
    <div class="splash__content">
      <h1 class="splash__title">{{ messages.welcome }}</h1>
      <p class="splash__subtitle">{{ messages.subtitle }}</p>
      <p class="splash__description">{{ messages.description }}</p>
    </div>
    <div class="compact-chevron" @click="navigateToSection(PageSectionsEnum.ABOUT)">
      <div class="compact-chevron-group">
        <span class="compact-chevron-icon" />
        <span class="compact-chevron-icon" />
        <span class="compact-chevron-icon" />
      </div>
      <span class="compact-label">{{ messages.more }}</span>
    </div>
  </div>
</template>
