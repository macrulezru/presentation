<script setup lang="ts">
  import './blog.scss';

  import { computed } from 'vue';

  import BlogItem from './parts/blog-item/blog-item.vue';
  import { useBlogPost, type BlogPostItem } from './parts/blog-items';

  import blogImage from '@/view/assets/images/blog.png';
  import { useI18n } from '~/composables/useI18n';
  import { useResponsive } from '~/composables/useResponsive';

  const { t } = useI18n();

  const props = defineProps<{
    ssrItems?: BlogPostItem[];
  }>();

  const responsive = useResponsive();

  const isSSR = import.meta.env.SSR;
  const blogPost = props.ssrItems || isSSR ? null : useBlogPost();

  const postToView = computed(() => {
    return props.ssrItems ?? blogPost?.items.value ?? [];
  });

  const mainPosts = computed(() => {
    return postToView.value.slice(0, 3);
  });

  const secondaryPosts = computed(() => {
    return postToView.value.slice(3, 7);
  });
</script>

<template>
  <div class="blog">
    <div class="blog__container">
      <div class="blog__promo">
        <div class="blog__header">
          <a href="https://blog.macrulez.ru/" target="_blank">{{ t('blog.title') }}</a>
        </div>
        <a href="https://blog.macrulez.ru/" target="_blank">
          <img class="blog__image" :src="blogImage" loading="lazy" />
        </a>
        <div class="blog__description">{{ t('blog.text') }}</div>
      </div>
    </div>
    <div class="blog__posts">
      <BlogItem v-for="(post, index) in mainPosts" :key="index" :post="post" />
    </div>
    <div v-if="responsive.desktop" class="blog__posts blog__posts_secondary">
      <BlogItem
        v-for="(post, index) in secondaryPosts"
        :key="index"
        :post="post"
        hideDescription
      />
    </div>
  </div>
</template>
