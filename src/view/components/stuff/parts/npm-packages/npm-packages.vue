<script setup lang="ts">
  import './npm-packages.scss';
  import { computed } from 'vue';

  import { useNpmPackages, type NpmPackageItem } from './npm-items';

  import npmLogo from '@/view/assets/images/npm-logo.svg';
  import UiLoading from '~/components/ui/UiLoading.vue';
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    ssrItems?: NpmPackageItem[];
  }>();

  const isSSR = import.meta.env.SSR;
  const npmPackages = props.ssrItems || isSSR ? null : useNpmPackages();

  const isLoading = computed(() =>
    props.ssrItems ? false : !npmPackages ? true : (npmPackages.loading.value ?? false),
  );

  const npmToView = computed(() => {
    return props.ssrItems ?? npmPackages?.items.value ?? [];
  });
</script>

<template>
  <div class="npm-packages">
    <div class="npm-packages__container">
      <div class="npm-packages__title">
        <img class="npm-packages__logo" :src="npmLogo" />
        <span class="npm-packages__header-text">{{ t('npm.title') }}</span>
      </div>
      <div v-if="isLoading" class="npm-packages__loader">
        <UiLoading type="circle" progressColor="#d941b0" />
      </div>
      <div v-else class="npm-packages__wrapper">
        <a
          v-for="pkg in npmToView"
          :key="pkg.title"
          class="npm-packages__item"
          :href="pkg.url"
          target="_blank"
        >
          <div class="npm-packages__item-header-block">
            <div class="npm-packages__item-header-link">
              <div v-if="pkg.image" class="npm-packages__item-image-wrapper">
                <img
                  class="npm-packages__item-image"
                  :src="pkg.image"
                  :alt="pkg.title"
                  loading="lazy"
                />
              </div>
              <div class="npm-packages__item-name">
                <span class="npm-packages__item-link-wrapper">
                  {{ pkg.title }}
                </span>
              </div>
            </div>
          </div>
          <div class="npm-packages__item-description">{{ pkg.description }}</div>
        </a>
      </div>
    </div>
  </div>
</template>
