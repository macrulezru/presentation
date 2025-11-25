<script setup lang="ts">
  const { t } = useI18n()

  const messages = {
    welcome: t('welcome'),
  }
</script>

<template>
  <div class="splash">
    {{ messages.welcome }}
  </div>
</template>

<style scoped>
  .splash {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 100vw;
    min-height: 100vh;
  }
</style>
