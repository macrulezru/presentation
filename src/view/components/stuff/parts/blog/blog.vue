<script setup lang="ts">
  import './blog.scss';

  import { computed } from 'vue';

  import BlogItem from './parts/blog-item/blog-item.vue';
  import { useBlogPost, type BlogPostItem } from './parts/blog-items';

  import blogImage from '@/view/assets/images/blog.webp';
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    ssrItems?: BlogPostItem[];
  }>();

  const isSSR = import.meta.env.SSR;
  const blogPost = props.ssrItems || isSSR ? null : useBlogPost();

  const postToView = computed(() => {
    return props.ssrItems ?? blogPost?.items.value ?? [];
  });
</script>

<template>
  <div class="blog">
    <div class="blog__container">
      <div class="blog__promo">
        <a class="blog__link" href="https://blog.macrulez.ru/" target="_blank">
          <VImage
            class="blog__image"
            :src="blogImage"
            hazehash="MEoONvIAQH_q6UXUXG3t3WR4lp4TTIjsKpOtWw"
            :width="500"
            :height="496"
            :alt="t('blog.title')"
            :lazy="true"
          />
          <div class="blog__header">
            {{ t('blog.title') }}
          </div>
        </a>
        <div class="blog__description">{{ t('blog.text') }}</div>
      </div>
    </div>
    <div class="blog__posts">
      <MasonryGrid :items="postToView" :options="{ gap: { main: 50, cross: 40 } }">
        <template #item="{ item }">
          <BlogItem :post="item" />
        </template>
      </MasonryGrid>
    </div>
  </div>
</template>
