<script setup lang="ts">
  import '@/view/components/travelshop-project/parts/travelshop-images/travelshop-images.scss';

  import { useFancybox } from '@/view/composables/use-fancybox';
  import { useTravelshopImages } from '@/view/composables/use-travelshop-images.ts';
  import UiSwiper from '@/view/ui/ui-swiper/ui-swiper.vue';

  const { images } = useTravelshopImages();
  const { openGallery } = useFancybox();

  const openModal = (index: number) => {
    openGallery(images.value, index);
  };
</script>

<template>
  <Transition name="content-appear" appear>
    <div class="travelshop-images">
      <UiSwiper :slides="images" @slide-click="openModal" />
    </div>
  </Transition>
</template>
