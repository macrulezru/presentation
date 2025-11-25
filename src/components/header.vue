<script setup lang="ts">
  import LangSelector from '@/components/lang-selector.vue'
</script>

<template>
  <div class="header">
    <div class="header__content">
      <LangSelector />
    </div>
  </div>
</template>

<style scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #2c3e50;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .header__content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 60px;
  }

  @media (max-width: 768px) {
    .header__content {
      padding: 0 0.5rem;
      height: 50px;
    }
  }
</style>
