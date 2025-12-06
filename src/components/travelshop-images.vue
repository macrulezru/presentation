<script setup lang="ts">
  import DlvImageModal from '@/components/ui/DlvImageModal.vue'

  import 'swiper/css'

  import { ref } from 'vue'
  import { Swiper, SwiperSlide } from 'swiper/vue'
  import { Pagination, Navigation, Mousewheel, Keyboard } from 'swiper/modules'
  import { travelshopImages } from '@/components/data/travelshop-images.data'
  const { t } = useI18n()

  const modalOpen = ref(false)
  const currentImageIndex = ref(0)

  const swiperOptions: any = {
    modules: [Pagination, Navigation, Mousewheel, Keyboard],
    pagination: { clickable: true },
    navigation: {
      nextEl: '.travelshop-images__nav-control_next',
      prevEl: '.travelshop-images__nav-control_prev',
    },
    mousewheel: {},
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
  }

  const getImageDescription = (index: number): string => {
    const imageKey = `desktop_${index + 1}`
    return (
      t(`travelshop.images.description.${imageKey}`) ||
      t('travelshop.images.description.default', { number: index + 1 })
    )
  }

  const getImageUrl = (name: string) => {
    return new URL(`/src/assets/images/travelshop/${name}`, import.meta.url).href
  }

  const openModal = (index: number) => {
    currentImageIndex.value = index
    modalOpen.value = true
  }

  const onModalClose = () => {
    modalOpen.value = false
  }

  const onModalChange = (index: number) => {
    currentImageIndex.value = index
  }
</script>

<template>
  <div class="travelshop-images">
    <swiper :slides-per-view="1" :space-between="50" v-bind="swiperOptions">
      <swiper-slide v-for="(slide, index) in travelshopImages" :key="index">
        <img
          :src="getImageUrl(slide.preview)"
          :alt="slide.description"
          @click.stop="openModal(index)"
          class="clickable-image"
        />
        <div class="travelshop-images__description">{{ getImageDescription(index) }}</div>
      </swiper-slide>
    </swiper>
    <span class="travelshop-images__nav-control travelshop-images__nav-control_prev" />
    <span class="travelshop-images__nav-control travelshop-images__nav-control_next" />

    <DlvImageModal
      v-model:isOpen="modalOpen"
      :initial-index="currentImageIndex"
      :images="travelshopImages"
      @close="onModalClose"
      @change="onModalChange"
    />
  </div>
</template>

<style scoped>
  .clickable-image {
    cursor: pointer;
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 8px;
  }

  .travelshop-images {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    padding: 0 40px; /* Уменьшили отступы для меньших кнопок */
  }

  /* Общие стили для кнопок навигации (уменьшенные) */
  .travelshop-images__nav-control {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px; /* Уменьшили с 50px */
    height: 40px; /* Уменьшили с 50px */
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15); /* Уменьшили тень */
  }

  .travelshop-images__nav-control::after {
    content: '';
    width: 20px; /* Уменьшили с 24px */
    height: 20px; /* Уменьшили с 24px */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M15 18L9 12L15 6' stroke='%23333' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }

  .travelshop-images__nav-control:hover {
    background: white;
    transform: translateY(-50%) scale(1.08); /* Уменьшили масштаб */
    box-shadow: 0 5px 14px rgba(0, 0, 0, 0.2); /* Уменьшили тень */
  }

  /* Кнопка "назад" */
  .travelshop-images__nav-control_prev {
    left: -6px;
  }

  /* Кнопка "вперед" */
  .travelshop-images__nav-control_next {
    right: -6px;
  }

  .travelshop-images__nav-control_next::after {
    transform: rotate(180deg);
  }

  /* Стили для отключенных кнопок */
  .travelshop-images__nav-control.swiper-button-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: translateY(-50%);
  }

  .travelshop-images__nav-control.swiper-button-disabled:hover {
    transform: translateY(-50%) scale(1);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  }

  .travelshop-images__description {
    padding: 20px 0 10px;
    font-size: 14px;
    font-style: italic;
    text-align: center;
    color: var(--color-text-muted);
  }

  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    .travelshop-images {
      padding: 0 30px; /* Уменьшили отступы для мобильных */
    }

    .travelshop-images__nav-control {
      width: 36px; /* Уменьшили с 40px */
      height: 36px; /* Уменьшили с 40px */
    }

    .travelshop-images__nav-control::after {
      width: 18px; /* Уменьшили с 20px */
      height: 18px; /* Уменьшили с 20px */
      background-size: 18px 18px;
    }
  }

  @media (max-width: 480px) {
    .travelshop-images {
      padding: 0 24px; /* Еще меньше отступы на очень маленьких экранах */
    }

    .travelshop-images__nav-control {
      width: 32px; /* Уменьшили с 36px */
      height: 32px; /* Уменьшили с 36px */
    }

    .travelshop-images__nav-control::after {
      width: 16px; /* Уменьшили с 18px */
      height: 16px; /* Уменьшили с 18px */
      background-size: 16px 16px;
    }
  }

  /* Стили для свайпера (только для контейнера) */
  .travelshop-images :deep(.swiper) {
    padding: 20px 0;
  }

  /* Булеты оставляем как есть (стили не меняем) */
</style>
