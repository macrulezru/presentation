<script setup lang="ts">
  import { ref, computed } from 'vue';

  import { PictureResponsiveBreakpoints } from '@/enums/responsive.enum';

  export interface UiVideoProps {
    src: string;
    tablet?: string;
    mobile?: string;
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

  // Определяем текущий src для видео по media query
  const currentSrc = computed(() => {
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

  function toggleFullscreen() {
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
  }

  function onPlay() {
    emits('play');
  }
  function onPause() {
    emits('pause');
  }
  function onEnded() {
    emits('ended');
  }
</script>

<template>
  <div class="ui-video" :class="{ 'is-fullscreen': fullscreen }">
    <video
      ref="videoRef"
      :src="currentSrc"
      :poster="video.poster"
      :controls="controls"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      class="ui-video__element"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
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
