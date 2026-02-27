<script setup lang="ts">
const { data, pending, error } = await usePortfolioArts();
</script>

<template>
  <main
    style="padding: 24px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  >
    <h1>Nuxt SSR smoke: arts</h1>

    <div v-if="pending">Loading…</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="a in data || []" :key="a.directory">
        <strong>{{ a.directory }}</strong>
        <div style="opacity: 0.8">images: {{ a.images.length }}</div>
      </li>
    </ul>
  </main>
</template>

