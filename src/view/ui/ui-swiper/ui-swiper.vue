<script setup lang="ts">
  /**
   * UI Swiper Component
   *
   * Полнофункциональный компонент карусели с поддержкой:
   * - Keyboard навигация (ArrowLeft/ArrowRight)
   * - Touch/swipe жесты на мобильных
   * - Drag мышкой с плавным перемещением
   * - Lazy loading изображений (опционально)
   * - Адаптивная высота контейнера
   * - Accessibility ARIA атрибуты
   * - Кэширование высот для оптимизации
   *
   * @example
   * <!-- Без lazy loading - все изображения загружаются сразу -->
   * <UiSwiper :slides="images" @slide-click="handleClick" :lazyLoad="false" />
   *
   * <!-- С lazy loading (по умолчанию) - загружаются только видимые -->
   * <UiSwiper :slides="images" @slide-click="handleClick" />
   */
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import './ui-swiper.scss';

  interface Slide {
    preview: string;
    description: string;
  }

  interface Props {
    slides: Slide[];
    lazyLoad?: boolean;
    animationDuration?: number; // Длительность анимации переходов (ms)
    autoplay?: boolean; // Автоматическое переключение слайдов
    autoplayDelay?: number; // Задержка между автопроигрыванием (ms)
    loop?: boolean; // Циклическое переключение слайдов
    initialIndex?: number; // Начальный индекс слайда
    dragThreshold?: number; // Минимальное расстояние для drag (px)
    dragVelocityThreshold?: number; // Процент ширины для автоперехода при драге (0-1)
  }

  interface Emits {
    (e: 'slide-click', index: number): void;
    (e: 'slide-start', index: number): void;
    (e: 'slide-end', index: number): void;
    (e: 'drag-start', event: { startX: number; currentIndex: number }): void;
    (e: 'drag-end', event: { endX: number; currentIndex: number; moved: boolean }): void;
    (e: 'swipe', event: { direction: 'left' | 'right'; index: number }): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const lazyLoadEnabled = computed(() => props.lazyLoad !== false);
  const animDuration = computed(() => props.animationDuration ?? 300);
  const isLoopEnabled = computed(() => props.loop ?? true);
  const dragThresholdValue = computed(() => props.dragThreshold ?? 5);
  const dragVelocityThresholdValue = computed(() => props.dragVelocityThreshold ?? 0.25);

  const currentIndex = ref(props.initialIndex ?? 0);
  const containerHeight = ref<number | null>(null);
  const viewportRef = ref<HTMLDivElement | null>(null);

  // Cache высот слайдов для оптимизации
  const heightCache = ref<Map<number, number>>(new Map());

  let imageResizeObserver: ResizeObserver | null = null;
  let windowResizeTimeout: number | null = null;
  let touchStartX = 0;
  let touchStartY = 0;
  const touchThreshold = 50; // минимальное расстояние для срабатывания swipe

  // Drag переменные
  const isDragging = ref(false);
  let dragStartX = 0;
  const dragOffset = ref(0);
  let isDragInitiated = false;

  // Autoplay переменные
  let autoplayTimer: number | null = null;

  const slidesCount = computed(() => props.slides?.length || 0);

  // Lazy loading
  const visibleSlides = computed(() => {
    const visible = new Set<number>();
    // Всегда загружаем текущий слайд
    visible.add(currentIndex.value);
    // Загружаем соседние слайды для плавного переходов
    if (currentIndex.value > 0) visible.add(currentIndex.value - 1);
    if (currentIndex.value < slidesCount.value - 1) visible.add(currentIndex.value + 1);
    return visible;
  });

  const shouldLoadImage = (index: number): boolean => {
    // Если lazy load отключен - загружаем все изображения
    if (!lazyLoadEnabled.value) {
      return true;
    }
    // Если lazy load включен - загружаем только видимые и соседние
    return visibleSlides.value.has(index);
  };

  const updateHeight = () => {
    if (!viewportRef.value) return;

    const slideElements = viewportRef.value.querySelectorAll('.ui-swiper__slide');
    const activeSlide = slideElements[currentIndex.value] as HTMLElement | undefined;

    if (activeSlide) {
      // Проверяем кэш перед расчетом
      const cachedHeight = heightCache.value.get(currentIndex.value);
      if (cachedHeight) {
        containerHeight.value = cachedHeight;
        return;
      }

      const img = activeSlide.querySelector('.ui-swiper__image') as HTMLElement;
      const desc = activeSlide.querySelector('.ui-swiper__description') as HTMLElement;

      if (img && img.offsetHeight > 0) {
        // Берём высоту изображения + высоту описания + gap (16px) + padding (24px*2)
        const imgHeight = img.offsetHeight;
        const descHeight = desc ? desc.offsetHeight : 0;
        const gap = 16;
        const padding = 24 * 2;

        const calculatedHeight = imgHeight + descHeight + gap + padding;

        // Сохраняем в кэш
        heightCache.value.set(currentIndex.value, calculatedHeight);
        containerHeight.value = calculatedHeight;
      }
    }
  };

  const debouncedUpdateHeight = () => {
    if (windowResizeTimeout) {
      clearTimeout(windowResizeTimeout);
    }
    windowResizeTimeout = window.setTimeout(() => {
      // Очищаем кэш при resize, т.к. размеры изображений могут измениться
      heightCache.value.clear();
      updateHeight();
    }, 50);
  };

  const setupImageObserver = () => {
    if (!viewportRef.value) return;

    const images = viewportRef.value.querySelectorAll('.ui-swiper__image');

    // Отключаем старый observer
    if (imageResizeObserver) {
      imageResizeObserver.disconnect();
    }

    // Создаём новый observer для отслеживания изменений размера изображений
    imageResizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    images.forEach(img => {
      imageResizeObserver?.observe(img);
    });
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slidesCount.value) {
      const prevIndex = currentIndex.value;
      if (prevIndex !== index) {
        emit('slide-start', index);
      }
      currentIndex.value = index;
      updateHeight();
      if (prevIndex !== index) {
        // Используем nextTick чтобы событие вызвалось после завершения анимации
        setTimeout(() => {
          emit('slide-end', index);
        }, animDuration.value); // Используем configurable duration
      }
    }
  };

  const nextSlide = () => {
    if (slidesCount.value > 0) {
      const isLastSlide = currentIndex.value === slidesCount.value - 1;
      if (isLastSlide && !isLoopEnabled.value) {
        return; // Не переходим если loop отключен и это последний слайд
      }
      const newIndex = (currentIndex.value + 1) % slidesCount.value;
      emit('slide-start', newIndex);
      currentIndex.value = newIndex;
      updateHeight();
      setTimeout(() => {
        emit('slide-end', newIndex);
      }, animDuration.value);
    }
  };

  const prevSlide = () => {
    if (slidesCount.value > 0) {
      const isFirstSlide = currentIndex.value === 0;
      if (isFirstSlide && !isLoopEnabled.value) {
        return; // Не переходим если loop отключен и это первый слайд
      }
      const newIndex = (currentIndex.value - 1 + slidesCount.value) % slidesCount.value;
      emit('slide-start', newIndex);
      currentIndex.value = newIndex;
      updateHeight();
      setTimeout(() => {
        emit('slide-end', newIndex);
      }, animDuration.value);
    }
  };

  const handleImageClick = (index: number) => {
    // Не открываем модалку если был drag
    if (!isDragging.value && !isDragInitiated) {
      emit('slide-click', index);
    }
  };

  // Autoplay функции
  const startAutoplay = () => {
    if (!props.autoplay || slidesCount.value <= 1) return;

    stopAutoplay();
    autoplayTimer = window.setInterval(() => {
      nextSlide();
    }, props.autoplayDelay ?? 3000);
  };

  const stopAutoplay = () => {
    if (autoplayTimer !== null) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const resetAutoplay = () => {
    if (props.autoplay) {
      stopAutoplay();
      startAutoplay();
    }
  };

  // Следим за изменением пропсов slides
  watch(
    () => props.slides,
    () => {
      currentIndex.value = 0;
      // Очищаем кэш при изменении слайдов
      heightCache.value.clear();
      // Даём время на рендер
      setTimeout(() => {
        setupImageObserver();
        updateHeight();
      }, 0);
    },
    { deep: true },
  );

  onMounted(() => {
    setupImageObserver();
    updateHeight();
    startAutoplay(); // Запускаем autoplay при монтировании
    window.addEventListener('resize', debouncedUpdateHeight);
    window.addEventListener('keydown', handleKeyDown);
    if (viewportRef.value) {
      viewportRef.value.addEventListener('touchstart', handleTouchStart, false);
      viewportRef.value.addEventListener('touchend', handleTouchEnd, false);
      viewportRef.value.addEventListener('mousedown', handleMouseDown, false);
      viewportRef.value.addEventListener('mousemove', handleMouseMove, false);
      viewportRef.value.addEventListener('mouseup', handleMouseUp, false);
      viewportRef.value.addEventListener('mouseleave', handleMouseUp, false);
      // Отключаем выделение текста при драге
      viewportRef.value.style.userSelect = 'none';
    }
  });

  onUnmounted(() => {
    stopAutoplay(); // Останавливаем autoplay при размонтировании
    window.removeEventListener('resize', debouncedUpdateHeight);
    window.removeEventListener('keydown', handleKeyDown);
    if (viewportRef.value) {
      viewportRef.value.removeEventListener('touchstart', handleTouchStart);
      viewportRef.value.removeEventListener('touchend', handleTouchEnd);
      viewportRef.value.removeEventListener('mousedown', handleMouseDown);
      viewportRef.value.removeEventListener('mousemove', handleMouseMove);
      viewportRef.value.removeEventListener('mouseup', handleMouseUp);
      viewportRef.value.removeEventListener('mouseleave', handleMouseUp);
    }
    if (imageResizeObserver) {
      imageResizeObserver.disconnect();
    }
    if (windowResizeTimeout) {
      clearTimeout(windowResizeTimeout);
    }
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevSlide();
      resetAutoplay(); // Сбрасываем autoplay при ручной навигации
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
      resetAutoplay(); // Сбрасываем autoplay при ручной навигации
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    stopAutoplay(); // Останавливаем autoplay при начале touch
    touchStartX = e.touches[0]?.clientX || 0;
    touchStartY = e.touches[0]?.clientY || 0;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndX = e.changedTouches[0]?.clientX || 0;
    const touchEndY = e.changedTouches[0]?.clientY || 0;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Проверяем, что это горизонтальный свайп (не вертикальный скролл)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > touchThreshold) {
      if (diffX > 0) {
        // Свайп влево - показываем следующий слайд
        emit('swipe', { direction: 'left', index: currentIndex.value });
        nextSlide();
      } else {
        // Свайп вправо - показываем предыдущий слайд
        emit('swipe', { direction: 'right', index: currentIndex.value });
        prevSlide();
      }
    }
    startAutoplay(); // Возобновляем autoplay после touch
  };

  const handleMouseDown = (e: MouseEvent) => {
    // Отключаем стандартный drag браузера
    e.preventDefault();
    stopAutoplay(); // Останавливаем autoplay при начале drag
    dragStartX = e.clientX;
    isDragInitiated = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    if (e.buttons === 1) {
      // Левая кнопка мыши нажата
      const diff = e.clientX - dragStartX;

      // Инициализируем drag только если смещение больше threshold
      if (!isDragging.value && Math.abs(diff) > dragThresholdValue.value) {
        isDragging.value = true;
        isDragInitiated = true;
        emit('drag-start', { startX: dragStartX, currentIndex: currentIndex.value });
      }

      if (isDragging.value) {
        dragOffset.value = diff;
      }
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging.value && isDragInitiated) {
      const dragDistance = e.clientX - dragStartX;
      const dragPercent = Math.abs(dragDistance) / (viewportRef.value?.offsetWidth || 1);

      let moved = false;
      // Если смещение больше threshold от ширины viewport - переходим на следующий/предыдущий слайд
      if (dragPercent > dragVelocityThresholdValue.value) {
        moved = true;
        if (dragDistance > 0) {
          // Перетащили вправо - показываем предыдущий слайд
          prevSlide();
        } else {
          // Перетащили влево - показываем следующий слайд
          nextSlide();
        }
      }

      emit('drag-end', { endX: e.clientX, currentIndex: currentIndex.value, moved });

      // Сбрасываем drag состояние
      isDragging.value = false;
      dragOffset.value = 0;
      startAutoplay(); // Возобновляем autoplay после drag
    }
  };
</script>

<template>
  <div
    class="ui-swiper"
    role="region"
    aria-label="Image carousel"
    aria-roledescription="carousel"
    :style="{ '--swiper-duration': `${animDuration}ms` }"
  >
    <!-- Viewport с адаптивной высотой -->
    <div
      ref="viewportRef"
      class="ui-swiper__viewport"
      :style="{ height: containerHeight ? `${containerHeight}px` : 'auto' }"
      role="presentation"
    >
      <!-- Track для слайдов -->
      <div
        class="ui-swiper__track"
        :class="{ 'ui-swiper__track_dragging': isDragging }"
        :style="{
          transform: isDragging
            ? `translateX(calc(-${currentIndex} * 100% + ${dragOffset}px))`
            : `translateX(calc(-${currentIndex} * 100%))`,
        }"
      >
        <!-- Слайды -->
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="ui-swiper__slide"
          role="group"
          :aria-label="`Slide ${index + 1} of ${slidesCount}`"
          :aria-roledescription="`slide`"
        >
          <div class="ui-swiper__slide-content">
            <img
              v-if="shouldLoadImage(index)"
              :src="slide.preview"
              :alt="slide.description || `Slide ${index + 1}`"
              class="ui-swiper__image"
              draggable="false"
              role="button"
              tabindex="0"
              @click="handleImageClick(index)"
              @keydown.enter="handleImageClick(index)"
              @keydown.space="handleImageClick(index)"
              @dragstart.prevent
            />
            <div v-else class="ui-swiper__image-placeholder" aria-hidden="true" />
            <p v-if="slide.description" class="ui-swiper__description">
              {{ slide.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопки навигации -->
    <button
      class="ui-swiper__nav-btn ui-swiper__nav-btn_prev"
      aria-label="Previous slide"
      :aria-disabled="slidesCount <= 1"
      @click="
        () => {
          prevSlide();
          resetAutoplay();
        }
      "
    />
    <button
      class="ui-swiper__nav-btn ui-swiper__nav-btn_next"
      aria-label="Next slide"
      :aria-disabled="slidesCount <= 1"
      @click="
        () => {
          nextSlide();
          resetAutoplay();
        }
      "
    />

    <!-- Пагинация (точки) -->
    <div class="ui-swiper__pagination" role="tablist" aria-label="Slide navigation">
      <button
        v-for="(_, index) in slides"
        :key="index"
        class="ui-swiper__dot"
        :class="{ 'ui-swiper__dot_active': index === currentIndex }"
        :aria-label="`Go to slide ${index + 1}`"
        :aria-selected="index === currentIndex"
        role="tab"
        :tabindex="index === currentIndex ? 0 : -1"
        @click="
          () => {
            goToSlide(index);
            resetAutoplay();
          }
        "
      />
    </div>
  </div>
</template>
