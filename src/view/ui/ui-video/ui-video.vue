<script setup lang="ts">
  import { ref, computed } from 'vue';

  import { PictureResponsiveBreakpoints } from '@/enums/responsive.enum';

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

  const currentSource = computed(() => {
    if (
      props.video.mobile &&
      window.matchMedia(PictureResponsiveBreakpoints.mobile).matches
    ) {
      return props.video.mobile;
    }
    if (
      props.video.tablet &&
      window.matchMedia(PictureResponsiveBreakpoints.tablet).matches
    ) {
      return props.video.tablet;
    }
    return props.video.src;
  });

  const videoStyle = computed(() => getAspectRatioStyle(currentSource.value));

  const getAspectRatioStyle = (s?: UiVideoSource): Record<string, string> => {
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
