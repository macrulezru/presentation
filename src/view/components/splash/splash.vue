<script setup lang="ts">
  import '@/view/components/splash/splash.scss';

  import { onMounted, onUnmounted } from 'vue';

  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();

  const hidePreloader = () => {
    const loader = document.getElementById('app-loader');
    if (loader) loader.remove();
  };

  onMounted(() => {
    hidePreloader();
  });

  onUnmounted(() => {});
</script>

<template>
  <section ref="splashRef" class="splash">
    <div class="splash__dimmer" />
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
      </div>
    </div>
  </section>
</template>
