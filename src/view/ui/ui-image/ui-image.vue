<script setup lang="ts">
  import '@/view/ui/ui-image/ui-image.scss';

  import { ref, computed } from 'vue';

  import { PictureResponsiveBreakpoints } from '@/enums/responsive.enum';
  import { useResponsive } from '@/view/composables/use-responsive';

  export interface UiImageSource {
    src: string;
    width?: string | number;
    height?: string | number;
  }

  export interface UiImageProps {
    src: UiImageSource;
    alt?: string;
    tablet?: UiImageSource;
    mobile?: UiImageSource;
  }

  const props = withDefaults(defineProps<{ image: UiImageProps }>(), {});

  const imgRef = ref<HTMLImageElement | null>(null);

  const { isMobile, isTablet } = useResponsive();

  const currentImgSource = computed(() => {
    const { src, tablet, mobile } = props.image;

    if (src && !tablet && !mobile) {
      return src;
    }

    if (src && mobile && !tablet) {
      if (isMobile.value) return mobile;
      return src;
    }

    if (src && tablet && !mobile) {
      if (isMobile.value) return tablet;
      return src;
    }

    if (src && tablet && mobile) {
      if (isMobile.value) return mobile;
      if (isTablet.value) return tablet;
      return src;
    }

    return src;
  });

  const currentImgStyle = computed(() => {
    const { src, tablet, mobile } = props.image;

    if (src && tablet && !mobile) {
      if (isMobile.value) {
        return getAspectRatioStyle(tablet);
      }
      if (isTablet.value) {
        return getAspectRatioStyle(tablet);
      }
      return getAspectRatioStyle(src);
    }

    return getAspectRatioStyle(currentImgSource.value);
  });

  const getAspectRatioStyle = (s?: UiImageSource): Record<string, string> => {
    const style: Record<string, string> = {};

    if (s?.width) {
      style.width = typeof s.width === 'number' ? `${s.width}px` : s.width;
    }

    if (s?.width && s?.height) {
      const w = typeof s.width === 'number' ? s.width : parseFloat(s.width);
      const h = typeof s.height === 'number' ? s.height : parseFloat(s.height);
      if (w && h) {
        style.aspectRatio = `${w} / ${h}`;
      }
    }

    return style;
  };

  const handleImgLoad = () => {
    const img = imgRef.value;

    if (img) {
      img.classList.add('is-loaded');
      img.style.removeProperty('width');
      img.style.removeProperty('height');
    }
  };
</script>

<template>
  <picture>
    <source
      v-if="image.mobile"
      :srcset="image.mobile.src"
      :media="PictureResponsiveBreakpoints.mobile"
      :width="image.mobile.width"
      :height="image.mobile.height"
      :style="getAspectRatioStyle(image.mobile)"
    />
    <source
      v-if="image.tablet"
      :srcset="image.tablet.src"
      :media="PictureResponsiveBreakpoints.tablet"
      :width="image.tablet.width"
      :height="image.tablet.height"
      :style="getAspectRatioStyle(image.tablet)"
    />
    <img
      ref="imgRef"
      :src="currentImgSource.src"
      :alt="image.alt"
      loading="lazy"
      class="ui-image"
      v-bind="$attrs"
      :style="currentImgStyle"
      @load="handleImgLoad"
    />
  </picture>
</template>
