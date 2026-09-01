<script setup lang="ts">
  import './airlines.scss';

  import airlinesImage from '@/view/assets/images/airlines.png';
  import WorldRoute from '@/view/components/world-route/world-route.vue';
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();
</script>

<template>
  <div class="airlines">
    <div class="airlines__container">
      <div class="airlines__promo">
        <a
          class="airlines__link"
          href="https://airlines.macrulez.ru/2d/SBI/DME?x=0.3889&y=0.2740&z=3.2100"
          target="_blank"
        >
          <img class="airlines__image" :src="airlinesImage" loading="lazy" />
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
