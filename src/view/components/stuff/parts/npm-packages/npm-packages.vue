<script setup lang="ts">
  import './npm-packages.scss';
  import { computed } from 'vue';

  import { useNpmPackages } from './npm-items';

  import LinkArrow from '@/view/ui/ui-link-arrow/ui-link-arrow.vue';
  import UiLoading from '@/view/ui/ui-loading/ui-loading.vue';

  const npmPackages = useNpmPackages();

  const isLoading = computed(() => npmPackages.loading.value);

  const npmToView = computed(() => {
    return npmPackages.items.value;
  });
</script>

<template>
  <div class="npm-packages">
    <div class="npm-packages__container">
      <div class="npm-packages__title">
        <span class="npm-packages__logo" />
      </div>
      <div v-if="isLoading" class="npm-packages__loader">
        <UiLoading type="circle" progressColor="#d941b0" />
      </div>
      <div v-else class="npm-packages__wrapper">
        <div v-for="pkg in npmToView" :key="pkg.title" class="npm-packages__item">
          <div class="npm-packages__item-name">
            <a class="company-item__link" :href="pkg.url" target="_blank">
              {{ pkg.title }}
              <LinkArrow class="company-item__link-arrow" />
            </a>
          </div>
          <div class="npm-packages__item-description">{{ pkg.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
