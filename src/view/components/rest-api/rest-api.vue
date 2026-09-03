<script setup lang="ts">
  import '@/view/components/rest-api/rest-api.scss';

  import { useFancybox } from '@/view/composables/use-fancybox';
  import { useRestApiImages } from '@/view/composables/use-rest-api-images.ts';
  import UiSwiper from '@/view/ui/ui-swiper/ui-swiper.vue';

  const { images } = useRestApiImages();
  const { openGallery } = useFancybox();

  const openModal = (index: number) => {
    openGallery(images.value, index);
  };
</script>

<template>
  <Transition name="content-appear" appear>
    <div class="rest-api">
      <UiSwiper :slides="images" :maxHeight="600" @slide-click="openModal" />
    </div>
  </Transition>
</template>
