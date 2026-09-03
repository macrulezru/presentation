<script setup lang="ts">
  import '@/view/components/travelshop-project/parts/travelshop-images/travelshop-images.scss';

  import { useFancybox } from '@/view/composables/use-fancybox';
  import { useTravelshopImages } from '@/view/composables/use-travelshop-images.ts';
  import UiSwiper from '@/view/ui/ui-swiper/ui-swiper.vue';

  const { images } = useTravelshopImages();
  const { openGallery } = useFancybox();

  interface Emits {
    (e: 'close'): void;
  }

  const emit = defineEmits<Emits>();

  const openModal = (index: number) => {
    openGallery(images.value, index);
  };

  const onClose = () => {
    emit('close');
  };
</script>

<template>
  <Transition name="content-appear" appear>
    <div class="travelshop-images">
      <UiSwiper
        showCloseButton
        :slides="images"
        @slide-click="openModal"
        @close="onClose"
      />
    </div>
  </Transition>
</template>
