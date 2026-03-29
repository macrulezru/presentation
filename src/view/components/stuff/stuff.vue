<script setup lang="ts">
  import './stuff.scss';

  import type { BlogPostItem } from '@/view/components/stuff/parts/blog/blog-items';
  import type { NpmPackageItem } from '@/view/components/stuff/parts/npm-packages/npm-items';

  import Blog from '@/view/components/stuff/parts/blog/blog.vue';
  import NpmPackages from '@/view/components/stuff/parts/npm-packages/npm-packages.vue';
  import Toolz from '@/view/components/stuff/parts/toolz/toolz.vue';

  defineProps<{
    ssrNpmItems?: NpmPackageItem[];
    ssrBlogItems?: BlogPostItem[];
  }>();
</script>

<template>
  <div class="stuff">
    <div class="stuff__container">
      <NpmPackages :ssrItems="ssrNpmItems" />
      <Toolz />
      <Blog :ssrItems="ssrBlogItems" />
    </div>
  </div>
</template>
