<script setup lang="ts">
import { useResponsive } from '~/composables/useResponsive';
  import { ref, computed } from 'vue';

  export interface UiVideoSource {
    src: string;
    width?: string | number;
    height?: string | number;
  }

  export interface UiVideoProps {
    src: UiVideoSource;
    tablet?: UiVideoSource;
    mobile?: UiVideoSource;
    poster?: string;
  }

  const props = withDefaults(
    defineProps<{
      video: UiVideoProps;
      controls?: boolean;
      autoplay?: boolean;
      loop?: boolean;
      muted?: boolean;
      showFullscreen?: boolean;
    }>(),
    {
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
      showFullscreen: true,
    },
  );

  const emits = defineEmits(['play', 'pause', 'ended', 'fullscreen']);

  const fullscreen = ref(false);
  const videoRef = ref<HTMLVideoElement | null>(null);

  const responsive = useResponsive();

  const currentSource = computed(() => {
    const { src, tablet, mobile } = props.video;

    if (src && !tablet && !mobile) {
      return src;
    }

    if (src && mobile && !tablet) {
      if (responsive.mobile) return mobile;
      return src;
    }

    if (src && tablet && !mobile) {
      if (responsive.mobile) return tablet;
      if (responsive.tablet) return tablet;
      return src;
    }

    if (src && tablet && mobile) {
      if (responsive.mobile) return mobile;
      if (responsive.tablet) return tablet;
      return src;
    }

    return src;
  });

  const videoStyle = computed(() => {
    const { src, tablet, mobile } = props.video;

    if (src && tablet && !mobile) {
      if (responsive.mobile || responsive.tablet) {
        return getAspectRatioStyle(tablet);
      }
      return getAspectRatioStyle(src);
    }

    return getAspectRatioStyle(currentSource.value);
  });

  const getAspectRatioStyle = (s?: UiVideoSource): Record<string, string> => {
    const style: Record<string, string> = {};

    // Не прописываем width инлайном, только aspect-ratio
    if (s?.width && s?.height) {
      const w = typeof s.width === 'number' ? s.width : parseFloat(s.width);
      const h = typeof s.height === 'number' ? s.height : parseFloat(s.height);
      if (w && h) {
        style.aspectRatio = `${w} / ${h}`;
      }
    }

    return style;
  };

  const toggleFullscreen = () => {
    if (!fullscreen.value) {
      if (videoRef.value?.requestFullscreen) {
        videoRef.value.requestFullscreen();
      }
      fullscreen.value = true;
      emits('fullscreen', true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      fullscreen.value = false;
      emits('fullscreen', false);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.value;
    if (video) {
      video.style.removeProperty('width');
      video.style.removeProperty('aspect-ratio');
    }
  };

  const onPlay = () => {
    emits('play');
  };

  const onPause = () => {
    emits('pause');
  };

  const onEnded = () => {
    emits('ended');
  };
</script>

<template>
  <div class="ui-video" :class="{ 'is-fullscreen': fullscreen }">
    <video
      ref="videoRef"
      :src="currentSource.src"
      :poster="video.poster"
      :controls="controls"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      class="ui-video__element"
      :style="videoStyle"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @loadedmetadata="handleLoadedMetadata"
    />
    <button
      v-if="showFullscreen"
      class="ui-video__fullscreen-btn"
      @click="toggleFullscreen"
    >
      <span v-if="!fullscreen">⛶</span>
      <span v-else>🗗</span>
    </button>
  </div>
</template>

<style lang="scss" src="./ui-video.scss"></style>
