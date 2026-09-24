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
          <VImage
            class="blog-item__image"
            :src="props.post.coverImage"
            :alt="props.post.title"
            :lazy="true"
            thumbhash="1+cNHYI3iHeFh3iPh5d4h7ZwZQl4"
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
