<script setup lang="ts">
  import '@/view/components/travelshop-project/parts/travelshop-images/travelshop-images.scss';

  import { computed } from 'vue';

  import { useFancybox } from '@/view/composables/use-fancybox';
  import { useTravelshopImages } from '@/view/composables/use-travelshop-images.ts';
  import { type Slides } from '@/view/ui/ui-carousel/types';
  import UiCarousel from '@/view/ui/ui-carousel/ui-carousel.vue';

  const { images } = useTravelshopImages();
  const { openGallery } = useFancybox();

  interface Emits {
    (e: 'close'): void;
  }

  const emit = defineEmits<Emits>();

  const slides = computed((): Slides => {
    return images.value.map(item => {
      return {
        image: item.preview,
        description: item.preview || null,
      };
    });
  });

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
      <UiCarousel :slides="slides" closable @slide-click="openModal" @close="onClose" />
    </div>
  </Transition>
</template>
