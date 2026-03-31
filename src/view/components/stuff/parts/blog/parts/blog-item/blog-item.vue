<script setup lang="ts">
  import './blog-item.scss';

  import type { BlogPostItem } from '../blog-items';

  interface Props {
    post: BlogPostItem;
    hideDescription?: boolean;
  }

  const props = defineProps<Props>();
</script>

<template>
  <div class="blog-item">
    <a :href="`https://blog.macrulez.ru/post/${props.post.url}`" target="_blank">
      <div class="blog-item__post">
        <div class="blog-item__post-image-wrapper">
          <div
            class="blog-item__image"
            :style="`--post-card-image: url(${props.post.coverImage});`"
          />
        </div>
        <div class="blog-item__title">
          {{ props.post.title }}
        </div>
        <div
          v-if="!props.hideDescription"
          class="blog-item__text"
          v-html="props.post.descriptionHtml"
        />
      </div>
    </a>
  </div>
</template>
