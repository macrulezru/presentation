<script setup lang="ts">
  import './blog.scss';

  import { computed } from 'vue';

  import { useBlogPost, type BlogPostItem } from './blog-items';

  import blogImage from '@/view/assets/images/blog.png';
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
        <div class="blog__header">
          <a href="https://blog.macrulez.ru/" target="_blank">{{ t('blog.title') }}</a>
        </div>
        <a href="https://blog.macrulez.ru/" target="_blank">
          <img class="blog__image" :src="blogImage" />
        </a>
        <div class="blog__description">{{ t('blog.text') }}</div>
      </div>
    </div>
    <div class="blog__posts">
      <div v-for="(post, index) in postToView" :key="index" class="blog__post">
        <div class="blog__post-image-wrapper">
          <a :href="`https://blog.macrulez.ru/post/${post.url}`" target="_blank">
            <div
              class="blog__post-image"
              :style="`--post-card-image: url(${post.coverImage});`"
            />
          </a>
        </div>
        <div class="blog__post-title">
          <a :href="`https://blog.macrulez.ru/post/${post.url}`" target="_blank">
            {{ post.title }}
          </a>
        </div>
        <div class="blog__post-text" v-html="post.descriptionHtml" />
      </div>
    </div>
  </div>
</template>
