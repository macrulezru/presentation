<script setup lang="ts">
  import '@/view/components/travelshop-project/parts/travelshop-images/travelshop-images.scss';

  import { ref } from 'vue';

  import { useTravelshopImages } from '@/view/composables/use-travelshop-images.ts';
  import UiImageModal from '@/view/ui/ui-image-modal/ui-image-modal.vue';
  import UiSwiper from '@/view/ui/ui-swiper/ui-swiper.vue';

  const { images } = useTravelshopImages();

  const modalOpen = ref(false);
  const currentImageIndex = ref(0);

  const openModal = (index: number) => {
    currentImageIndex.value = index;
    modalOpen.value = true;
  };

  const onModalClose = () => {
    modalOpen.value = false;
  };

  const onModalChange = (index: number) => {
    currentImageIndex.value = index;
  };
</script>

<template>
  <div class="travelshop-images">
    <UiSwiper :slides="images" @slide-click="openModal" />

    <UiImageModal
      v-model:isOpen="modalOpen"
      :initialIndex="currentImageIndex"
      :images="images"
      @close="onModalClose"
      @change="onModalChange"
    />
  </div>
</template>
