<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

  import artCursor from '@/view/assets/images/art-cursor.svg?url';
  import ArtItem from '@/view/components/arts/parts/art-item/art-item.vue';
  import { useArtsImages, type ArtsImage } from '@/view/composables/use-arts-images';
  import { useI18n } from '@/view/composables/use-i18n.ts';
  import Button from '@/view/ui/ui-button/ui-button.vue';
  import UiImageModal from '@/view/ui/ui-image-modal/ui-image-modal.vue';

  import '@/view/components/arts/arts.scss';

  const { t } = useI18n();

  const isModalOpen = ref(false);
  const currentImageIndex = ref(0);
  const selectedFolder = ref<string | null>(null);
  const selectedProject = ref<ArtsImage | null>(null);
  const isLoading = ref(false);
  const loadingProgress = ref(0);
  const currentMasonryKey = ref(0);
  const showAllImages = ref(false);
  const isPreviewLoaded = ref(false);
  const areAllImagesLoaded = ref(false);
  const cursorVisible = ref(false);
  const cursorX = ref(0);
  const cursorY = ref(0);
  const cursorAngle = ref(0);
  const targetCursorAngle = ref(0);
  const cursorScaleY = ref(1);
  const targetCursorScaleY = ref(1);
  const cursorScale = ref(1);
  const lastMousePosition = ref<{ x: number; y: number } | null>(null);

  const { arts } = useArtsImages();

  const PREVIEW_IMAGE_COUNT = 10;

  const loadedImagesMap = new Map<string, HTMLImageElement>();

  const allImageUrls = computed(() => {
    return arts.value.map((img: ArtsImage) => img.preview).filter(Boolean);
  });

  const previewImageUrls = computed(() => {
    return allImageUrls.value.slice(0, PREVIEW_IMAGE_COUNT);
  });

  const remainingImageUrls = computed(() => {
    return allImageUrls.value.slice(PREVIEW_IMAGE_COUNT);
  });

  const displayImages = computed<ArtsImage[]>(() => {
    return showAllImages.value ? arts.value : arts.value.slice(0, PREVIEW_IMAGE_COUNT);
  });

  const modalImages = computed(() => {
    if (!selectedProject.value) return [];
    return selectedProject.value.images.map((img: string, index: number) => ({
      preview: img,
      full: img,
      description: `${selectedProject.value?.directory} - изображение ${index + 1}`,
    }));
  });

  const cursorStyle = computed(() => ({
    left: `${cursorX.value - CURSOR_OFFSET_X}px`,
    top: `${cursorY.value - CURSOR_OFFSET_Y}px`,
    transform: `scaleY(${cursorScaleY.value}) rotate(${cursorAngle.value}deg) scale(${cursorScale.value})`,
  }));

  const loadImageForCache = async (url: string): Promise<void> => {
    if (loadedImagesMap.has(url)) return;

    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        loadedImagesMap.set(url, img);
        resolve();
      };
      img.onerror = () => {
        console.warn(`Не удалось предзагрузить изображение: ${url}`);
        resolve();
      };
      img.src = url;
    });
  };

  const initializePreview = async () => {
    isPreviewLoaded.value = false;

    const previewUrls = previewImageUrls.value;

    if (previewUrls.length > 0) {
      await Promise.all(previewUrls.map(url => loadImageForCache(url)));
    }

    isPreviewLoaded.value = true;
  };

  const loadRemainingImages = async (): Promise<void> => {
    isLoading.value = true;
    loadingProgress.value = 0;

    try {
      const remainingUrls = remainingImageUrls.value;

      if (remainingUrls.length === 0) {
        areAllImagesLoaded.value = true;
        isLoading.value = false;
        return;
      }

      const total = remainingUrls.length;
      let loaded = 0;

      const batchSize = 3;

      for (let i = 0; i < remainingUrls.length; i += batchSize) {
        const batch = remainingUrls.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async url => {
            await loadImageForCache(url);
            loaded++;
            loadingProgress.value = Math.round((loaded / total) * 100);
          }),
        );
      }

      areAllImagesLoaded.value = true;
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const onShowAllImages = async () => {
    if (isLoading.value || showAllImages.value) return;

    if (areAllImagesLoaded.value) {
      showAllImages.value = true;
      currentMasonryKey.value += 1;
      return;
    }

    await loadRemainingImages();

    showAllImages.value = true;
    currentMasonryKey.value += 1;

    setTimeout(() => {
      loadingProgress.value = 0;
    }, 300);
  };

  const mouseMoveTracker = (e: MouseEvent) => {
    lastMousePosition.value = { x: e.clientX, y: e.clientY };
  };

  const openModal = (directory: string) => {
    selectedFolder.value = directory;
    selectedProject.value =
      arts.value.find((a: ArtsImage) => a.directory === directory) || null;

    if (selectedProject.value) {
      isModalOpen.value = true;
      currentImageIndex.value = 0;
      lastMousePosition.value = { x: cursorX.value, y: cursorY.value };
      window.addEventListener('mousemove', mouseMoveTracker);
    }
  };

  const closeModal = () => {
    isModalOpen.value = false;
    selectedFolder.value = null;
    selectedProject.value = null;

    if (mouseMoveTracker) {
      window.removeEventListener('mousemove', mouseMoveTracker);
    }

    if (lastMousePosition.value) {
      cursorX.value = lastMousePosition.value.x;
      cursorY.value = lastMousePosition.value.y;
    }

    lastMousePosition.value = null;
    cursorVisible.value = true;
  };

  const handleImageChange = (index: number) => {
    currentImageIndex.value = index;
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
      const scaleYSettled = Math.abs(targetCursorScaleY.value - cursorScaleY.value) <= 0.01;

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

  watch(isModalOpen, val => {
    if (val) {
      cursorVisible.value = false;
    }
  });

  onMounted(async () => {
    const img = new window.Image();
    img.src = artCursor;
    await initializePreview();
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
    <div class="arts__separator arts__separator_top" />
    <div class="arts__separator arts__separator_bottom" />

    <div class="arts__wrapper">
      <div class="arts__header">
        <h1 class="arts__title">{{ t('design.title') }}</h1>
        <div class="arts__sub-title">{{ t('design.description') }}</div>
      </div>

      <div v-if="!isPreviewLoaded" class="arts__loading">
        <div class="arts__loading-spinner"></div>
      </div>

      <div v-else class="arts__projects">
        <masonry-wall
          :key="currentMasonryKey"
          :items="displayImages"
          :ssrColumns="1"
          :columnWidth="250"
          :gap="16"
          :minColumns="2"
        >
          <template #default="{ item }">
            <ArtItem :image="item" @on-image-click="openModal(item.directory)" />
          </template>
        </masonry-wall>
      </div>

      <div
        v-if="!showAllImages && arts.length > PREVIEW_IMAGE_COUNT && isPreviewLoaded"
        class="arts__button-container"
      >
        <Button
          v-if="!isLoading"
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

        <div v-else class="arts__progress-wrapper">
          <div class="arts__progress-overlay">
            <div class="arts__progress-container">
              <div class="arts__progress-text">
                {{ t('design.loadingImages') }}
              </div>
              <div class="arts__progress-bar">
                <div
                  class="arts__progress-fill"
                  :style="{ width: `${loadingProgress}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <UiImageModal
    v-model:isOpen="isModalOpen"
    :images="modalImages"
    :initialIndex="currentImageIndex"
    :showCounter="modalImages.length > 1"
    @close="closeModal"
    @change="handleImageChange"
  />

  <div v-if="cursorVisible" :style="cursorStyle" class="arts__custom-cursor">
    <img :src="artCursor" alt="cursor" draggable="false" />
  </div>
</template>
