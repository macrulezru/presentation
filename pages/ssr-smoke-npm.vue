<script setup lang="ts">
const { data, pending, error } = await usePortfolioNpmPackages('ru');
</script>

<template>
  <main
    style="padding: 24px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  >
    <h1>Nuxt SSR smoke: npm packages</h1>

    <div v-if="pending">Loading…</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="p in data || []" :key="p.url">
        <a :href="p.url" target="_blank" rel="noreferrer noopener">{{ p.title }}</a>
        <div style="opacity: 0.8">{{ p.description }}</div>
      </li>
    </ul>
  </main>
</template>

