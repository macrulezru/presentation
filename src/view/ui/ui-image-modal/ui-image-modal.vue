<script setup lang="ts">
  import '@/view/ui/ui-image-modal/ui-image-modal.scss';

  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';

  import type { Props } from './types';

  import { bodyLock, bodyUnlock } from '@/view/composables/use-body-fix';
  import { useResponsive } from '@/view/composables/use-responsive';

  const { t } = useI18n();

  const props = withDefaults(defineProps<Props>(), {
    initialIndex: 0,
    showNavigation: true,
    showCounter: true,
    showThumbnails: true,
    allowOpenInNewTab: true,
    lazyThumbnails: true,
  });

  const emit = defineEmits<{
    /** Событие обновления состояния открытия (v-model) */
    'update:isOpen': [value: boolean];
    /** Событие закрытия модального окна */
    close: [];
    /** Событие изменения текущего изображения */
    change: [index: number];
    /** Событие открытия изображения в новой вкладке */
    openInNewTab: [imageUrl: string];
  }>();

  const { isDesktop } = useResponsive();

  const currentIndex = ref(props.initialIndex);
  const isLoading = ref(false);
  const imageWrapperRef = ref<HTMLElement | null>(null);
  const thumbnailsWrapperRef = ref<HTMLElement | null>(null);
  const thumbnailsRef = ref<HTMLElement | null>(null);
  const hasEnoughSpace = ref(true);
  const thumbnailsHeight = ref(0);

  /**
   * Текущее полноразмерное изображение
   */
  const currentImage = computed(() => props.images[currentIndex.value]?.full);

  /**
   * Описание текущего изображения
   */
  const currentAlt = computed(() => props.images[currentIndex.value]?.description);

  /**
   * Проверка наличия предыдущего изображения
   */
  const hasPrev = computed(() => currentIndex.value > 0);

  /**
   * Проверка наличия следующего изображения
   */
  const hasNext = computed(() => currentIndex.value < props.images.length - 1);

  const imageOffset = computed(() => {
    return isDesktop.value ? { width: 160, height: 160 } : { width: 60, height: 140 };
  });

  const imageStyle = computed(() => {
    return {
      maxWidth: `calc(100vw - ${imageOffset.value.width}px)`,
      maxHeight:
        props.showThumbnails && props.images.length > 1
          ? `calc(100vh - ${imageOffset.value.height}px - ${thumbnailsHeight.value - 100}px)`
          : `calc(100vh - ${imageOffset.value.height}px)`,
      objectFit: 'contain' as const,
      display: 'block',
      margin: '0 auto',
    };
  });

  /**
   * Закрывает модальное окно
   */
  const close = () => {
    emit('update:isOpen', false);
    emit('close');
  };

  /**
   * Переходит к предыдущему изображению
   */
  const prevImage = () => {
    if (hasPrev.value) {
      setImage(currentIndex.value - 1);
    }
  };

  /**
   * Переходит к следующему изображению
   */
  const nextImage = () => {
    if (hasNext.value) {
      setImage(currentIndex.value + 1);
    }
  };

  /**
   * Устанавливает изображение по индексу
   * @param index - индекс изображения
   */
  const setImage = (index: number) => {
    if (index >= 0 && index < props.images.length) {
      isLoading.value = true;
      currentIndex.value = index;
      emit('change', index);
      nextTick(() => scrollActiveThumbnailIntoView());
    }
  };

  /**
   * Скроллит активную превьюшку в зону видимости
   */
  const scrollActiveThumbnailIntoView = () => {
    if (!thumbnailsRef.value || !thumbnailsWrapperRef.value) return;
    const active = thumbnailsRef.value.querySelector(
      '.ui-image-modal__thumbnail--active',
    );
    if (active && typeof active.scrollIntoView === 'function') {
      active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  /**
   * Обработчик клика по изображению для открытия в новой вкладке
   */
  const openImageInNewTab = () => {
    if (!props.allowOpenInNewTab || !currentImage.value) return;

    // Открываем изображение в новой вкладке
    window.open(currentImage.value, '_blank', 'noopener,noreferrer');

    // Эмитим событие для родительского компонента
    emit('openInNewTab', currentImage.value);
  };

  /**
   * Обработчик успешной загрузки изображения
   */

  const onImageLoad = () => {
    isLoading.value = false;
  };

  /**
   * Обработчик ошибки загрузки изображения
   */

  const onImageError = () => {
    // Не сбрасываем isLoading, чтобы лоадер не исчезал при ошибке (можно добавить отдельный error state при необходимости)
    console.error(`Не удалось загрузить изображение: ${currentImage.value}`);
  };

  /**
   * Обработчик нажатий клавиш
   */
  const handleKeydown = (event: KeyboardEvent) => {
    if (!props.isOpen) return;

    switch (event.key) {
      case 'Escape':
        close();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case 'o':
      case 'O':
        if (props.allowOpenInNewTab && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          openImageInNewTab();
        }
        break;
    }
  };

  const checkSpace = () => {
    nextTick(() => {
      const wrapper = imageWrapperRef.value;
      if (!wrapper) return;
      const parent = wrapper.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      // Если по бокам есть хотя бы 80px свободного места — считаем, что места достаточно
      hasEnoughSpace.value =
        wrapperRect.left - parentRect.left > 80 &&
        parentRect.right - wrapperRect.right > 80;
    });
  };

  const updateThumbnailsHeight = () => {
    nextTick(() => {
      if (thumbnailsWrapperRef.value) {
        thumbnailsHeight.value = thumbnailsWrapperRef.value.offsetHeight;
      } else {
        thumbnailsHeight.value = 0;
      }
    });
  };

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', checkSpace);
    window.addEventListener('resize', updateThumbnailsHeight);
    window.addEventListener('resize', scrollActiveThumbnailIntoView);
    checkSpace();
    updateThumbnailsHeight();
    nextTick(() => scrollActiveThumbnailIntoView());
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', checkSpace);
    window.removeEventListener('resize', updateThumbnailsHeight);
    window.removeEventListener('resize', scrollActiveThumbnailIntoView);
  });

  // Сброс индекса и состояния загрузки при открытии + блокировка body
  watch(
    () => props.isOpen,
    isOpen => {
      if (isOpen) {
        currentIndex.value = props.initialIndex;
        isLoading.value = true;
        bodyLock();
      } else {
        bodyUnlock();
      }
    },
  );

  // Следим за изменением initialIndex
  watch(
    () => props.initialIndex,
    index => {
      if (props.isOpen) {
        setImage(index);
      }
    },
  );

  watch(
    () => props.isOpen,
    isOpen => {
      if (isOpen) {
        nextTick(checkSpace);
        nextTick(updateThumbnailsHeight);
        nextTick(() => scrollActiveThumbnailIntoView());
      }
    },
  );

  watch(currentIndex, () => {
    nextTick(() => scrollActiveThumbnailIntoView());
  });
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-image-modal">
      <div v-if="isOpen" class="ui-image-modal">
        <div class="ui-image-modal__overlay" @click="close"></div>
        <!-- Кнопка закрытия -->
        <button
          class="ui-image-modal__close"
          :aria-label="t('common.close')"
          @click="close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <!-- Кнопка открытия в новой вкладке -->
        <button
          v-if="allowOpenInNewTab"
          class="ui-image-modal__open-new-tab"
          :aria-label="t('common.openInNewTab')"
          :title="t('common.openInNewTab')"
          @click="openImageInNewTab"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 13V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6H11"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M15 3H21V9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M10 14L21 3"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <!-- Кнопки навигации -->
        <button
          v-if="showNavigation && hasPrev"
          class="ui-image-modal__nav ui-image-modal__nav--prev"
          :aria-label="t('common.previous_image')"
          @click="prevImage"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <button
          v-if="showNavigation && hasNext"
          class="ui-image-modal__nav ui-image-modal__nav--next"
          :aria-label="t('common.next_image')"
          @click="nextImage"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <!-- Основное изображение -->
        <div
          class="ui-image-modal__image-area"
          :style="
            showThumbnails && images.length > 1
              ? { paddingBottom: thumbnailsHeight + 'px' }
              : undefined
          "
        >
          <transition name="ui-image-modal-image" mode="out-in">
            <img
              v-if="currentImage"
              :key="currentImage"
              :src="currentImage"
              :alt="currentAlt"
              class="ui-image-modal__image"
              :class="{ 'ui-image-modal__image--clickable': allowOpenInNewTab }"
              :title="allowOpenInNewTab ? t('common.clickToOpenInNewTab') : ''"
              :style="imageStyle"
              @load="onImageLoad"
              @error="onImageError"
              @click="allowOpenInNewTab ? openImageInNewTab() : null"
            />
          </transition>
          <!-- Индикатор загрузки -->
          <div v-if="isLoading" class="ui-image-modal__loader">
            <div class="ui-image-modal__spinner"></div>
          </div>
        </div>
        <!-- Миниатюры вынесены из image-area -->
        <div
          v-if="showThumbnails && images.length > 1"
          ref="thumbnailsWrapperRef"
          class="ui-image-modal__thumbnails-wrapper"
        >
          <div ref="thumbnailsRef" class="ui-image-modal__thumbnails">
            <button
              v-for="(img, index) in images"
              :key="index"
              class="ui-image-modal__thumbnail"
              :class="{ 'ui-image-modal__thumbnail--active': index === currentIndex }"
              :aria-label="t('common.thumbnail', { number: index + 1 })"
              @click="setImage(index)"
            >
              <img
                :src="img.preview"
                :alt="img.description"
                :loading="lazyThumbnails ? 'lazy' : 'eager'"
              />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
