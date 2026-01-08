<script setup lang="ts">
  import '@/view/ui/ui-image/ui-image.scss';

  import { PictureResponsiveBreakpoints } from '@/enums/responsive.enum';

  export interface UiImageProps {
    src: string;
    alt?: string;
    tablet?: string;
    mobile?: string;
  }

  withDefaults(defineProps<{ image: UiImageProps }>(), {});
</script>

<template>
  <picture>
    <source
      v-if="image.mobile"
      :srcset="image.mobile"
      :media="PictureResponsiveBreakpoints.mobile"
    />
    <source
      v-if="image.tablet"
      :srcset="image.tablet"
      :media="PictureResponsiveBreakpoints.tablet"
    />
    <img
      :src="image.src"
      :alt="image.alt"
      loading="lazy"
      class="ui-image"
      v-bind="$attrs"
      @load="($event.target as HTMLImageElement).classList.add('is-loaded')"
    />
  </picture>
</template>
