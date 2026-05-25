<script setup lang="ts">
  import './toolz.scss';

  import { computed } from 'vue';

  import FavIcona from '@/view/assets/images/toolz/fav_icona.webp';
  import GradinetFabric from '@/view/assets/images/toolz/gradient_fabric.webp';
  import ImageCompressor from '@/view/assets/images/toolz/image_compressor.webp';
  import Stronghold from '@/view/assets/images/toolz/stronghold.webp';
  import TinySvg from '@/view/assets/images/toolz/tiny_svg.webp';
  import LinkArrow from '@/view/ui/ui-link-arrow/ui-link-arrow.vue';
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();

  const items = computed(() => {
    return [
      {
        image: TinySvg,
        title: t('toolz.modulez.tiny_svg.title'),
        sub_title: t('toolz.modulez.tiny_svg.sub_title'),
        description: t('toolz.modulez.tiny_svg.description'),
        url: 'https://toolz.macrulez.ru/ru/tiny-svg',
      },
      {
        image: ImageCompressor,
        title: t('toolz.modulez.image_compressor.title'),
        sub_title: t('toolz.modulez.image_compressor.sub_title'),
        description: t('toolz.modulez.image_compressor.description'),
        url: 'https://toolz.macrulez.ru/ru/image-compressor',
      },
      {
        image: GradinetFabric,
        title: t('toolz.modulez.gradient_fabric.title'),
        sub_title: t('toolz.modulez.gradient_fabric.sub_title'),
        description: t('toolz.modulez.gradient_fabric.description'),
        url: 'https://toolz.macrulez.ru/ru/gradient-fabric',
      },
      {
        image: FavIcona,
        title: t('toolz.modulez.fav_icona.title'),
        sub_title: t('toolz.modulez.fav_icona.sub_title'),
        description: t('toolz.modulez.fav_icona.description'),
        url: 'https://toolz.macrulez.ru/ru/fav-icona',
      },
      {
        image: Stronghold,
        title: t('toolz.modulez.stronghold.title'),
        sub_title: t('toolz.modulez.stronghold.sub_title'),
        description: t('toolz.modulez.stronghold.description'),
        url: 'https://toolz.macrulez.ru/ru/stronghold',
      },
    ];
  });
</script>

<template>
  <div class="toolz">
    <div class="toolz__container">
      <div class="toolz__promo">
        <a href="https://toolz.macrulez.ru" target="_blank" class="toolz__promo-header">
          <span class="toolz__promo-logo" />
          <span class="toolz__promo-logo-reflect" />
        </a>
        <div class="toolz__promo-content">
          <div class="toolz__promo-title">{{ t('toolz.title') }}</div>
          <div class="toolz__modules">
            <div v-for="item in items" :key="item.title" class="toolz__modules-item">
              <div class="toolz__modules-item-header-block">
                <a class="toolz__modules-item-link" :href="item.url" target="_blank">
                  <span class="toolz__modules-item-image-wrapper">
                    <img
                      class="toolz__modules-item-image"
                      :src="item.image"
                      :alt="item.title"
                      loading="lazy"
                    />
                  </span>
                  <span class="toolz__modules-item-title">
                    <span class="toolz__modules-item-link-wrapper">
                      {{ item.title }}
                      <LinkArrow class="toolz__modules-item-link-arrow" />
                    </span>
                  </span>
                </a>
              </div>
              <span class="toolz__modules-item-sub-title">{{ item.sub_title }}</span>
              <span class="toolz__modules-item-description">{{ item.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
