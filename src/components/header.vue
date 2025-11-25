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
    background-color: var(--color-bg-dark);
    z-index: var(--z-header);
    box-shadow: var(--shadow-sm);
  }

  .header__content {
    max-width: var(--container-xl);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: var(--header-height);
  }

  @media (max-width: 768px) {
    .header__content {
      padding: 0 var(--spacing-sm);
      height: var(--header-height-mobile);
    }
  }
</style>
