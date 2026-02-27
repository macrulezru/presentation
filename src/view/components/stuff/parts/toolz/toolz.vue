<script setup lang="ts">
  import './toolz.scss';

import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();
</script>

<template>
  <div class="toolz">
    <div class="toolz__container">
      <div class="toolz__promo">
        <a href="https://toolz.macrulez.ru" target="_blank" class="toolz__promo-header">
          <span class="toolz__promo-logo" />
          <span class="toolz__promo-logo-reflect" />
        </a>
        <div class="toolz__promo-content">
          <div class="toolz__promo-title">{{ t('toolz.title') }}</div>
          <div class="toolz__promo-text">
            {{ t('toolz.text') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
