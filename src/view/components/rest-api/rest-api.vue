<script setup lang="ts">
  import '@/view/components/rest-api/rest-api.scss';

  import { useFancybox } from '@/view/composables/use-fancybox';
  import { useRestApiImages } from '@/view/composables/use-rest-api-images.ts';
  import UiSwiper from '@/view/ui/ui-swiper/ui-swiper.vue';

  const { images } = useRestApiImages();
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
    <div class="rest-api">
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
