<script setup lang="ts">
  import '@/view/ui/ui-image-modal/ui-image-modal.scss';

  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import type { Props } from './types';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = withDefaults(defineProps<Props>(), {
    initialIndex: 0,
    showNavigation: true,
    showCounter: true,
    showThumbnails: true,
    allowOpenInNewTab: true,
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

  const currentIndex = ref(props.initialIndex);
  const isLoading = ref(false);
  const imageRef = ref<HTMLImageElement | null>(null);

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
    isLoading.value = false;
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

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  // Сброс индекса при открытии
  watch(
    () => props.isOpen,
    isOpen => {
      if (isOpen) {
        currentIndex.value = props.initialIndex;
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
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="ui-image-modal">
        <div class="ui-image-modal__overlay" @click="close"></div>

        <div class="ui-image-modal__container">
          <!-- Кнопка закрытия -->
          <button
            class="ui-image-modal__close"
            @click="close"
            :aria-label="t('common.close')"
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
            @click="openImageInNewTab"
            :aria-label="t('common.openInNewTab')"
            :title="t('common.openInNewTab')"
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

          <!-- Навигация для десктопа -->
          <button
            v-if="showNavigation && hasPrev"
            class="ui-image-modal__nav ui-image-modal__nav--prev ui-image-modal__nav--desktop"
            @click="prevImage"
            :aria-label="t('common.previous_image')"
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
            class="ui-image-modal__nav ui-image-modal__nav--next ui-image-modal__nav--desktop"
            @click="nextImage"
            :aria-label="t('common.next_image')"
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
          <div class="ui-image-modal__content-wrapper">
            <div class="ui-image-modal__content">
              <!-- Навигация для мобильных -->
              <button
                v-if="showNavigation && hasPrev"
                class="ui-image-modal__nav ui-image-modal__nav--prev ui-image-modal__nav--mobile"
                @click="prevImage"
                :aria-label="t('common.previous_image')"
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

              <!-- Обернем изображение в кликабельный элемент -->
              <div class="ui-image-modal__image-wrapper">
                <img
                  ref="imageRef"
                  :src="currentImage"
                  :alt="currentAlt"
                  class="ui-image-modal__image"
                  :class="{ 'ui-image-modal__image--clickable': allowOpenInNewTab }"
                  @load="onImageLoad"
                  @error="onImageError"
                  @click="allowOpenInNewTab ? openImageInNewTab() : null"
                  :title="allowOpenInNewTab ? t('common.clickToOpenInNewTab') : ''"
                />
              </div>

              <button
                v-if="showNavigation && hasNext"
                class="ui-image-modal__nav ui-image-modal__nav--next ui-image-modal__nav--mobile"
                @click="nextImage"
                :aria-label="t('common.next_image')"
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

              <!-- Индикатор загрузки -->
              <div v-if="isLoading" class="ui-image-modal__loader">
                <div class="ui-image-modal__spinner"></div>
              </div>
            </div>
          </div>

          <!-- Миниатюры -->
          <div
            v-if="showThumbnails && images.length > 1"
            class="ui-image-modal__thumbnails-wrapper"
          >
            <div class="ui-image-modal__thumbnails">
              <button
                v-for="(img, index) in images"
                :key="index"
                class="ui-image-modal__thumbnail"
                :class="{ 'ui-image-modal__thumbnail--active': index === currentIndex }"
                @click="setImage(index)"
                :aria-label="t('common.thumbnail', { number: index + 1 })"
              >
                <img :src="img.preview" :alt="img.description" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
