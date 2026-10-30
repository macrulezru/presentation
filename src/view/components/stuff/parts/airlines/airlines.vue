<script setup lang="ts">
  import './airlines.scss';

  import airlinesImage from '@/view/assets/images/airlines.webp';
  import WorldRoute from '@/view/components/world-route/world-route.vue';
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();
</script>

<template>
  <div class="airlines">
    <div class="airlines__container">
      <div class="airlines__promo">
        <a class="airlines__link" href="https://airlines.macrulez.ru" target="_blank">
          <VImage
            class="airlines__image"
            :src="airlinesImage"
            hazehash="MP_vMvuYQI_gFKbotmOgSmZqt477DcHw9KmRT1n7yGtAzc2EESGGziWdBJCSsA"
            :width="641"
            :height="600"
            :alt="t('airlines.title')"
            :lazy="true"
          />
          <div class="airlines__header">
            {{ t('airlines.title') }}
          </div>
        </a>
        <div class="airlines__description">{{ t('airlines.text') }}</div>
      </div>

      <WorldRoute />
    </div>
  </div>
</template>
