<script setup lang="ts">
  import '@/view/components/splash/splash.scss'

  import { onMounted, onUnmounted, ref } from 'vue'
  import { usePlasmaBackground } from '@/view/composables/use-plasma-background'
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts'
  import { PageSectionsEnum } from '@/enums/page-sections.enum.ts'

  const { t } = useI18n()

  const splashRef = ref<HTMLElement>()

  const { navigateToSection } = useScrollRouting()
  const { startAnimation, stopAnimation } = usePlasmaBackground(splashRef)

  let observer: IntersectionObserver

  const createObserver = () => {
    const element = splashRef.value
    if (!element || observer) return // предотвращаем создание нескольких observer'ов

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        entry.isIntersecting ? startAnimation() : stopAnimation()
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      },
    )

    observer.observe(element)
  }

  onMounted(() => {
    nextTick(() => {
      createObserver()
    })
    startAnimation()
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
    stopAnimation()
  })
</script>

<template>
  <div ref="splashRef" class="splash">
    <div class="splash__animation" />
    <div class="splash__content">
      <h1 class="splash__title">{{ t('splash.welcome') }}</h1>
      <p class="splash__subtitle">{{ t('splash.subtitle') }}</p>
      <p class="splash__description">{{ t('splash.description') }}</p>
    </div>
    <div class="compact-chevron" @click="navigateToSection(PageSectionsEnum.ABOUT)">
      <div class="compact-chevron-group">
        <span class="compact-chevron-icon" />
        <span class="compact-chevron-icon" />
        <span class="compact-chevron-icon" />
      </div>
      <span class="compact-label">{{ t('splash.more') }}</span>
    </div>
  </div>
</template>
