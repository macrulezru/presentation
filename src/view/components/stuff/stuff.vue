<script setup lang="ts">
  import './stuff.scss';

  import type { BlogPostItem } from '@/view/components/stuff/parts/blog/parts/blog-items';
  import type { NpmPackageItem } from '@/view/components/stuff/parts/npm-packages/npm-items';

  import Airlines from '@/view/components/stuff/parts/airlines/airlines.vue';
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
      <Airlines />
      <Blog :ssrItems="ssrBlogItems" />
    </div>
  </div>
</template>
