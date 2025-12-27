<script setup lang="ts">
  import '@/view/components/splash/splash.scss';

  import { onMounted, onUnmounted, ref, nextTick } from 'vue';

  import { PageSectionsEnum } from '@/enums/page-sections.enum.ts';
  import { useI18n } from '@/view/composables/use-i18n';
  import { usePlasmaBackground } from '@/view/composables/use-plasma-background';
  import { useScrollRouting } from '@/view/composables/use-scroll-routing.ts';
  import Button from '@/view/ui/ui-button/ui-button.vue';

  const { t } = useI18n();

  const splashRef = ref<HTMLElement>();

  const { navigateToSection } = useScrollRouting();
  const { startAnimation, stopAnimation } = usePlasmaBackground(splashRef);

  let observer: IntersectionObserver | undefined;

  const createObserver = () => {
    const element = splashRef.value;
    if (!element || observer) return;

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        (entry.isIntersecting ? startAnimation : stopAnimation)();
      },
      {
        threshold: 0,
      },
    );

    observer.observe(element);
  };

  const hidePreloader = () => {
    const loader = document.getElementById('app-loader');
    if (loader) loader.remove();
  };

  onMounted(() => {
    nextTick(createObserver);
    startAnimation();
    hidePreloader();
  });

  onUnmounted(() => {
    observer?.disconnect();
    stopAnimation();
  });
</script>

<template>
  <section ref="splashRef" class="splash">
    <div class="splash__main">
      <div class="splash__animation" />

      <div class="splash__content">
        <div class="splash__title">
          {{ t('splash.welcome') }}
        </div>

        <div class="splash__subtitle">
          <span class="splash__vue">{{ t('splash.vue') }}</span>
          <span class="splash__dot" />
          <span class="splash__developer">{{ t('splash.developer') }}</span>
        </div>

        <div class="splash__description">
          {{ t('splash.description') }}
        </div>
        <div class="splash__content-footer">
          <Button
            class="splash__button"
            :text="t('splash.more')"
            @click="navigateToSection(PageSectionsEnum.ABOUT)"
          />
        </div>
      </div>
    </div>
  </section>
</template>
