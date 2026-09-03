<script setup lang="ts">
  import '@/view/components/app-platform/app-platform.scss';

  import { useAppPlatformImages } from '@/view/composables/use-app-platform-images.ts';
  import { useFancybox } from '@/view/composables/use-fancybox';
  import UiSwiper from '@/view/ui/ui-swiper/ui-swiper.vue';

  const { images } = useAppPlatformImages();
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
    <div class="app-platform">
      <UiSwiper
        showCloseButton
        :slides="images"
        :maxHeight="600"
        @slide-click="openModal"
        @close="onClose"
      />
    </div>
  </Transition>
</template>
