<script setup lang="ts">
  import LangSelector from '@/components/lang-selector.vue'
</script>

<template>
  <div class="header">
    <LangSelector />
  </div>
</template>

<style scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #222222;
  }
</style>
