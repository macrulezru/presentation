<script setup lang="ts">
const { data, pending, error } = await usePortfolioExperience('ru');
</script>

<template>
  <main
    style="padding: 24px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  >
    <h1>Nuxt SSR smoke page</h1>
    <p style="opacity: 0.8">
      Страница должна рендериться на сервере и получать данные через Nuxt server API proxy.
    </p>

    <div v-if="pending">Loading…</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="c in data || []" :key="c.id">
        <strong>{{ c.company }}</strong> — {{ c.position }}
      </li>
    </ul>
  </main>
</template>

