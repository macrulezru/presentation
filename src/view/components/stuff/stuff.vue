<script setup lang="ts">
  import './stuff.scss';

  import NpmPackages from '@/view/components/stuff/parts/npm-packages/npm-packages.vue';
  import Toolz from '@/view/components/stuff/parts/toolz/toolz.vue';
</script>

<template>
  <div class="stuff">
    <div class="stuff__container">
      <NpmPackages />
      <Toolz />
    </div>
  </div>
</template>
