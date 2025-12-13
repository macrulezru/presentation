<script setup lang="ts">
  import '@/view/ui/ui-image-modal/ui-image-modal.scss'
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  interface ImageObject {
    /** Путь к превью изображения */
    preview: string
    /** Путь к полноразмерному изображению */
    full: string
    /** Описание изображения (alt текст) */
    description: string
  }

  interface Props {
    /** Состояние открытия модального окна */
    isOpen: boolean

    /** Массив изображений для отображения */
    images: ImageObject[]

    /** Начальный индекс изображения */
    initialIndex?: number

    /** Показывать навигационные стрелки */
    showNavigation?: boolean

    /** Показывать счетчик изображений */
    showCounter?: boolean

    /** Показывать панель миниатюр */
    showThumbnails?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    initialIndex: 0,
    showNavigation: true,
    showCounter: true,
    showThumbnails: true,
  })

  const emit = defineEmits<{
    /** Событие обновления состояния открытия (v-model) */
    'update:isOpen': [value: boolean]
    /** Событие закрытия модального окна */
    close: []
    /** Событие изменения текущего изображения */
    change: [index: number]
  }>()

  const currentIndex = ref(props.initialIndex)
  const isLoading = ref(false)
  const imageRef = ref<HTMLImageElement | null>(null)

  /**
   * Текущее полноразмерное изображение
   */
  const currentImage = computed(() => props.images[currentIndex.value]?.full)

  /**
   * Описание текущего изображения
   */
  const currentAlt = computed(() => props.images[currentIndex.value]?.description)

  /**
   * Проверка наличия предыдущего изображения
   */
  const hasPrev = computed(() => currentIndex.value > 0)

  /**
   * Проверка наличия следующего изображения
   */
  const hasNext = computed(() => currentIndex.value < props.images.length - 1)

  /**
   * Закрывает модальное окно
   */
  const close = () => {
    emit('update:isOpen', false)
    emit('close')
  }

  /**
   * Переходит к предыдущему изображению
   */
  const prevImage = () => {
    if (hasPrev.value) {
      setImage(currentIndex.value - 1)
    }
  }

  /**
   * Переходит к следующему изображению
   */
  const nextImage = () => {
    if (hasNext.value) {
      setImage(currentIndex.value + 1)
    }
  }

  /**
   * Устанавливает изображение по индексу
   * @param index - индекс изображения
   */
  const setImage = (index: number) => {
    if (index >= 0 && index < props.images.length) {
      isLoading.value = true
      currentIndex.value = index
      emit('change', index)
    }
  }

  /**
   * Обработчик успешной загрузки изображения
   */
  const onImageLoad = () => {
    isLoading.value = false
  }

  /**
   * Обработчик ошибки загрузки изображения
   */
  const onImageError = () => {
    isLoading.value = false
    console.error(`Не удалось загрузить изображение: ${currentImage.value}`)
  }

  /**
   * Обработчик нажатий клавиш
   */
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
