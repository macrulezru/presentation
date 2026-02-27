<script setup lang="ts">
const cookie = useCookie<string>('user-locale', { sameSite: 'lax', path: '/' });
const target = (cookie.value || 'ru').toLowerCase();

await navigateTo(`/${target}`, { redirectCode: 302 });
</script>

<template>
  <div />
</template>

