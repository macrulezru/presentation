<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  interface ImageObject {
    preview: string
    full: string
    description: string
  }

  interface Props {
    isOpen: boolean
    images: ImageObject[]
    initialIndex?: number
    showNavigation?: boolean
    showCounter?: boolean
    showThumbnails?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    initialIndex: 0,
    showNavigation: true,
    showCounter: true,
    showThumbnails: true,
  })

  const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    close: []
    change: [index: number]
  }>()

  const currentIndex = ref(props.initialIndex)
  const isLoading = ref(false)
  const imageRef = ref<HTMLImageElement | null>(null)

  // Вспомогательные вычисляемые свойства
  const currentImage = computed(() => props.images[currentIndex.value]?.full)
  const currentAlt = computed(() => props.images[currentIndex.value]?.description)
  const hasPrev = computed(() => currentIndex.value > 0)
  const hasNext = computed(() => currentIndex.value < props.images.length - 1)

  const close = () => {
    emit('update:isOpen', false)
    emit('close')
  }

  const prevImage = () => {
    if (hasPrev.value) {
      setImage(currentIndex.value - 1)
    }
  }

  const nextImage = () => {
    if (hasNext.value) {
      setImage(currentIndex.value + 1)
    }
  }

  const setImage = (index: number) => {
    if (index >= 0 && index < props.images.length) {
      isLoading.value = true
      currentIndex.value = index
      emit('change', index)
    }
  }

  const onImageLoad = () => {
    isLoading.value = false
  }

  const onImageError = () => {
    isLoading.value = false
    console.error(`Не удалось загрузить изображение: ${currentImage.value}`)
  }

  // Обработка клавиш
  const handleKeydown = (event: KeyboardEvent) => {
    if (!props.isOpen) return

    switch (event.key) {
      case 'Escape':
        close()
        break
      case 'ArrowLeft':
        prevImage()
        break
      case 'ArrowRight':
        nextImage()
        break
    }
  }

  // Инициализация
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  // Сброс индекса при открытии
  watch(
    () => props.isOpen,
    isOpen => {
      if (isOpen) {
        currentIndex.value = props.initialIndex
      }
    },
  )

  // Следим за изменением initialIndex
  watch(
    () => props.initialIndex,
    index => {
      if (props.isOpen) {
        setImage(index)
      }
    },
  )
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="image-modal">
        <div class="image-modal__overlay" @click="close"></div>

        <div class="image-modal__container">
          <!-- Кнопка закрытия -->
          <button
            class="image-modal__close"
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

          <!-- Навигация для десктопа -->
          <button
            v-if="showNavigation && hasPrev"
            class="image-modal__nav image-modal__nav_prev image-modal__nav_desktop"
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
            class="image-modal__nav image-modal__nav_next image-modal__nav_desktop"
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
          <div class="image-modal__content-wrapper">
            <div class="image-modal__content">
              <!-- Навигация для мобильных -->
              <button
                v-if="showNavigation && hasPrev"
                class="image-modal__nav image-modal__nav_prev image-modal__nav_mobile"
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

              <img
                ref="imageRef"
                :src="currentImage"
                :alt="currentAlt"
                class="image-modal__image"
                @load="onImageLoad"
                @error="onImageError"
              />

              <button
                v-if="showNavigation && hasNext"
                class="image-modal__nav image-modal__nav_next image-modal__nav_mobile"
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
              <div v-if="isLoading" class="image-modal__loader">
                <div class="image-modal__spinner"></div>
              </div>

              <!-- Номер изображения -->
              <div v-if="showCounter" class="image-modal__counter">
                {{ currentIndex + 1 }} / {{ images.length }}
              </div>
            </div>
          </div>

          <!-- Миниатюры -->
          <div
            v-if="showThumbnails && images.length > 1"
            class="image-modal__thumbnails-wrapper"
          >
            <div class="image-modal__thumbnails">
              <button
                v-for="(img, index) in images"
                :key="index"
                class="image-modal__thumbnail"
                :class="{ 'image-modal__thumbnail_active': index === currentIndex }"
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

<style scoped>
  .image-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .image-modal__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(4px);
  }

  .image-modal__container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: min(1200px, 90vw);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .image-modal__close {
    position: absolute;
    top: -50px;
    right: 0;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 20;
  }

  .image-modal__close:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .image-modal__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 15;
  }

  .image-modal__nav:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%) scale(1.1);
  }

  /* Десктопная навигация */
  .image-modal__nav_desktop {
    display: flex;
  }

  .image-modal__nav_prev.image-modal__nav_desktop {
    left: -60px;
  }

  .image-modal__nav_next.image-modal__nav_desktop {
    right: -60px;
  }

  /* Мобильная навигация */
  .image-modal__nav_mobile {
    display: none;
  }

  .image-modal__content-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    overflow: hidden;
  }

  .image-modal__content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }

  .image-modal__image {
    max-width: 100%;
    max-height: 75vh;
    object-fit: contain;
    opacity: v-bind('isLoading ? 0 : 1');
    transition: opacity 0.3s ease;
  }

  .image-modal__loader {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
  }

  .image-modal__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .image-modal__counter {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    z-index: 5;
  }

  .image-modal__thumbnails-wrapper {
    width: 100%;
    overflow: hidden;
  }

  .image-modal__thumbnails {
    display: flex;
    gap: 10px;
    padding: 10px;
    overflow-x: auto;
    justify-content: center;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  }

  .image-modal__thumbnails::-webkit-scrollbar {
    height: 6px;
  }

  .image-modal__thumbnails::-webkit-scrollbar-track {
    background: transparent;
  }

  .image-modal__thumbnails::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  .image-modal__thumbnail {
    flex: 0 0 auto;
    width: 60px;
    height: 60px;
    border: 2px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
    background: none;
    padding: 0;
  }

  .image-modal__thumbnail:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .image-modal__thumbnail_active {
    border-color: #4f46e5;
  }

  .image-modal__thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Анимации */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-active .image-modal__container,
  .modal-leave-active .image-modal__container {
    transition: transform 0.3s ease;
  }

  .modal-enter-from .image-modal__container,
  .modal-leave-to .image-modal__container {
    transform: scale(0.9);
  }

  /* Адаптивность */
  @media (max-width: 1360px) {
    /* Скрываем десктопные кнопки на средних экранах */
    .image-modal__nav_desktop {
      display: none;
    }

    /* Показываем мобильные кнопки */
    .image-modal__nav_mobile {
      display: flex;
      position: absolute;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .image-modal__nav_prev.image-modal__nav_mobile {
      left: 10px;
    }

    .image-modal__nav_next.image-modal__nav_mobile {
      right: 10px;
    }

    /* Корректируем позицию кнопки закрытия */
    .image-modal__close {
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  }

  @media (max-width: 768px) {
    .image-modal {
      padding: 10px;
    }

    .image-modal__container {
      max-width: 95vw;
      max-height: 95vh;
      gap: 15px;
    }

    .image-modal__nav_mobile {
      width: 36px;
      height: 36px;
    }

    .image-modal__nav_prev.image-modal__nav_mobile {
      left: 8px;
    }

    .image-modal__nav_next.image-modal__nav_mobile {
      right: 8px;
    }

    .image-modal__close {
      top: 8px;
      right: 8px;
      width: 36px;
      height: 36px;
    }

    .image-modal__image {
      max-height: 70vh;
    }

    .image-modal__thumbnail {
      width: 50px;
      height: 50px;
    }
  }

  @media (max-width: 480px) {
    .image-modal {
      padding: 5px;
    }

    .image-modal__container {
      max-width: 100vw;
      max-height: 100vh;
      gap: 10px;
    }

    .image-modal__nav_mobile {
      width: 32px;
      height: 32px;
    }

    .image-modal__nav_prev.image-modal__nav_mobile {
      left: 5px;
    }

    .image-modal__nav_next.image-modal__nav_mobile {
      right: 5px;
    }

    .image-modal__close {
      top: 5px;
      right: 5px;
      width: 32px;
      height: 32px;
    }

    .image-modal__counter {
      bottom: 10px;
      padding: 6px 12px;
      font-size: 12px;
    }

    .image-modal__thumbnail {
      width: 40px;
      height: 40px;
    }
  }
</style>
