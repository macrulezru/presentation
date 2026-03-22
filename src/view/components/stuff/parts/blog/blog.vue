<script setup lang="ts">
  import './blog.scss';

  import blogImage from '@/view/assets/images/blog.png';
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();
</script>

<template>
  <div class="blog">
    <div class="blog__container">
      <div class="blog__promo">
        <div class="blog__header">
          <a href="https://blog.macrulez.ru/" target="_blank">{{ t('blog.title') }}</a>
        </div>
        <a href="https://blog.macrulez.ru/" target="_blank">
          <img class="blog__image" :src="blogImage" />
        </a>
        <div class="blog__description">{{ t('blog.text') }}</div>
      </div>
    </div>
  </div>
</template>
