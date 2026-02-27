<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  const loaderVisible = ref(true);

  onMounted(() => {
    // Даем Nuxt подхватить стили/данные и потом убираем лоадер
    setTimeout(() => {
      loaderVisible.value = false;
    }, 300);
  });
</script>

<template>
  <div class="app-root">
    <NuxtPage />
    <div v-show="loaderVisible" id="app-loader" class="app-loader__wrapper">
      <div class="app-loader__spinner"></div>
    </div>
  </div>
</template>
