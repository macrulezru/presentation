<script setup lang="ts">
  import './stuff.scss';

  import NpmPackages from '@/view/components/stuff/parts/npm-packages/npm-packages.vue';
  import Toolz from '@/view/components/stuff/parts/toolz/toolz.vue';

  import type { NpmPackageItem } from '@/view/components/stuff/parts/npm-packages/npm-items';

  defineProps<{
    ssrNpmItems?: NpmPackageItem[];
  }>();
</script>

<template>
  <div class="stuff">
    <div class="stuff__container">
      <NpmPackages :ssr-items="ssrNpmItems" />
      <Toolz />
    </div>
  </div>
</template>
