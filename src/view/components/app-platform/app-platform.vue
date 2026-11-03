<script setup lang="ts">
  import '@/view/components/app-platform/app-platform.scss';

  import { computed } from 'vue';

  import { useAppPlatformImages } from '@/view/composables/use-app-platform-images.ts';
  import { useFancybox } from '@/view/composables/use-fancybox';
  import { type Slides } from '@/view/ui/ui-carousel/types';
  import UiCarousel from '@/view/ui/ui-carousel/ui-carousel.vue';

  const { images } = useAppPlatformImages();
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
    <div class="app-platform">
      <UiCarousel
        :slides="slides"
        :max-height="650"
        closable
        @slide-click="openModal"
        @close="onClose"
      />
    </div>
  </Transition>
</template>
