<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';

  import artCursor from '@/view/assets/images/art-cursor.svg?url';
  import ArtItem from '@/view/components/arts/parts/art-item/art-item.vue';
  import { useFancybox } from '@/view/composables/use-fancybox';
  import Button from '@/view/ui/ui-button/ui-button.vue';
  import { useArtsImages, type ArtsImage } from '~/composables/useArtsImages';
  import { useI18n } from '~/composables/useI18n';

  import '@/view/components/arts/arts.scss';

  const { t } = useI18n();
  const { openGallery } = useFancybox();

  const props = defineProps<{
    ssrArts?: ArtsImage[];
  }>();

  const isSSR = import.meta.env.SSR;
  const showAllImages = ref(false);
  const cursorVisible = ref(false);
  const cursorX = ref(0);
  const cursorY = ref(0);
  const cursorAngle = ref(0);
  const targetCursorAngle = ref(0);
  const cursorScaleY = ref(1);
  const targetCursorScaleY = ref(1);
  const cursorScale = ref(1);
  const lastMousePosition = ref<{ x: number; y: number } | null>(null);

  const legacyArts = props.ssrArts || isSSR ? null : useArtsImages();
  const arts = computed<ArtsImage[]>(() => props.ssrArts ?? legacyArts?.arts.value ?? []);
  const isArtsLoading = computed(() => legacyArts?.loading.value ?? false);

  const PREVIEW_IMAGE_COUNT = 10;

  const displayImages = computed<ArtsImage[]>(() => {
    return showAllImages.value ? arts.value : arts.value.slice(0, PREVIEW_IMAGE_COUNT);
  });

  const cursorStyle = computed(() => ({
    left: `${cursorX.value - CURSOR_OFFSET_X}px`,
    top: `${cursorY.value - CURSOR_OFFSET_Y}px`,
    transform: `scaleY(${cursorScaleY.value}) rotate(${cursorAngle.value}deg) scale(${cursorScale.value})`,
  }));

  const onShowAllImages = () => {
    showAllImages.value = true;
  };

  const mouseMoveTracker = (e: MouseEvent) => {
    lastMousePosition.value = { x: e.clientX, y: e.clientY };
  };

  const openModal = (directory: string) => {
    const project = arts.value.find((a: ArtsImage) => a.directory === directory);
    if (!project) return;

    cursorVisible.value = false;
    lastMousePosition.value = { x: cursorX.value, y: cursorY.value };
    window.addEventListener('mousemove', mouseMoveTracker);

    const galleryImages = project.images.map((img: string, index: number) => ({
      full: img,
      preview: img,
      description: `${project.directory} - изображение ${index + 1}`,
    }));

    openGallery(galleryImages, 0, {
      showCaption: false,
      on: {
        destroy: () => {
          window.removeEventListener('mousemove', mouseMoveTracker);

          if (lastMousePosition.value) {
            cursorX.value = lastMousePosition.value.x;
            cursorY.value = lastMousePosition.value.y;
          }

          lastMousePosition.value = null;
          cursorVisible.value = true;
        },
      },
    });
  };

  const CURSOR_OFFSET_X = 40;
  const CURSOR_OFFSET_Y = 10;
  const CURSOR_MAX_ROTATE = 40;
  const CURSOR_ROTATE_SMOOTH = 0.15;
  const CURSOR_SCALE_Y_SMOOTH = 0.2;
  const STILL_TICKS_LIMIT = 6;

  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let animationFrame: number | null = null;
  let stillTicks = 0;
  let lastCursorX = 0;

  const onMouseMove = (e: MouseEvent) => {
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = now - lastTime || 16;
    const speed = dx / dt;
    const clampedSpeed = Math.max(-1, Math.min(1, speed));
    targetCursorAngle.value = clampedSpeed * CURSOR_MAX_ROTATE;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;
    cursorX.value = e.clientX;
    cursorY.value = e.clientY;
    cursorVisible.value = true;
    lastCursorX = e.clientX;
    stillTicks = 0;

    if (lastTime > 0 && Math.abs(dy) > 1) {
      targetCursorScaleY.value = Math.max(0.5, Math.min(1.6, 1 - dy / 25));
    }

    if (!animationFrame) {
      animateCursor();
    }
  };

  const onMouseDown = () => {
    cursorScale.value = 0.85;
  };
  const onMouseUp = () => {
    cursorScale.value = 1;
  };

  const animateCursor = () => {
    animationFrame = requestAnimationFrame(() => {
      cursorAngle.value +=
        (targetCursorAngle.value - cursorAngle.value) * CURSOR_ROTATE_SMOOTH;
      cursorScaleY.value +=
        (targetCursorScaleY.value - cursorScaleY.value) * CURSOR_SCALE_Y_SMOOTH;

      if (Math.abs(cursorX.value - lastCursorX) < 1) {
        stillTicks++;
      } else {
        stillTicks = 0;
        lastCursorX = cursorX.value;
      }
      if (stillTicks > STILL_TICKS_LIMIT) {
        targetCursorAngle.value = 0;
        targetCursorScaleY.value = 1;
      }

      const angleSettled =
        Math.abs(targetCursorAngle.value - cursorAngle.value) <= 0.1 &&
        Math.abs(cursorAngle.value) <= 0.1;
      const scaleYSettled =
        Math.abs(targetCursorScaleY.value - cursorScaleY.value) <= 0.01;

      if (angleSettled && scaleYSettled) {
        cursorAngle.value = 0;
        targetCursorAngle.value = 0;
        cursorScaleY.value = 1;
        targetCursorScaleY.value = 1;
        animationFrame = null;
        stillTicks = 0;
      } else {
        animateCursor();
      }
    });
  };

  const removeCursorHandlers = () => {
    cursorVisible.value = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    cursorAngle.value = 0;
    targetCursorAngle.value = 0;
    cursorScaleY.value = 1;
    targetCursorScaleY.value = 1;
  };

  const onMouseLeave = () => {
    removeCursorHandlers();
  };

  onMounted(() => {
    if (isSSR) return;

    const img = new window.Image();
    img.src = artCursor;

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousedown', onMouseDown);
  });

  onUnmounted(() => {
    removeCursorHandlers();
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('mousedown', onMouseDown);
  });
</script>

<template>
  <div
    class="arts"
    style="position: relative"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <div class="section__separator section__separator_top" />
    <div class="section__separator section__separator_bottom" />

    <div class="arts__wrapper">
      <div class="arts__header">
        <h1 class="arts__title">{{ t('design.title') }}</h1>
        <div class="arts__sub-title">{{ t('design.description') }}</div>
      </div>

      <div v-if="isArtsLoading" class="arts__loading">
        <div class="arts__loading-spinner"></div>
      </div>

      <div v-else class="arts__projects">
        <MasonryGrid :items="displayImages" :options="{ minLaneSize: 250 }">
          <template #item="{ item }">
            <ArtItem :image="item" @on-image-click="openModal(item.directory)" />
          </template>
        </MasonryGrid>
      </div>

      <div
        v-if="!showAllImages && arts.length > PREVIEW_IMAGE_COUNT && !isArtsLoading"
        class="arts__button-container"
      >
        <Button
          :text="t('design.showAll')"
          class="arts__show-all-button"
          @click="onShowAllImages"
        >
          <div class="arts__button-content">
            <span class="arts__button-text">
              {{ t('design.showAll') }}
            </span>
          </div>
        </Button>
      </div>
    </div>
  </div>

  <div v-if="cursorVisible" :style="cursorStyle" class="arts__custom-cursor">
    <img :src="artCursor" alt="cursor" draggable="false" />
  </div>
</template>
