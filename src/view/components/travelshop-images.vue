<script setup lang="ts">
  import ImageModal from '@/view/ui/ui-image-modal.vue'

  import 'swiper/css'

  import { ref } from 'vue'
  import { Swiper, SwiperSlide } from 'swiper/vue'
  import { Pagination, Navigation, Mousewheel, Keyboard } from 'swiper/modules'
  import { useTravelshopImages } from '@/view/composables/use-travelshop-images.ts'

  const { images } = useTravelshopImages()

  const modalOpen = ref(false)
  const currentImageIndex = ref(0)

  const swiperOptions: any = {
    modules: [Pagination, Navigation, Mousewheel, Keyboard],
    pagination: { clickable: true },
    navigation: {
      nextEl: '.travelshop-images__nav-control_next',
      prevEl: '.travelshop-images__nav-control_prev',
    },
    mousewheel: {
      releaseOnEdges: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
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
    <swiper
      class="travelshop-images__swiper"
      :slides-per-view="1"
      :space-between="50"
      v-bind="swiperOptions"
    >
      <swiper-slide v-for="(slide, index) in images" :key="index">
        <div class="travelshop-images__slide">
          <img
            :src="slide.preview"
            :alt="slide.description"
            @click.stop="openModal(index)"
            class="travelshop-images__image clickable-image"
          />
          <span class="travelshop-images__description">{{ slide.description }}</span>
        </div>
      </swiper-slide>
    </swiper>
    <span class="travelshop-images__nav-control travelshop-images__nav-control_prev" />
    <span class="travelshop-images__nav-control travelshop-images__nav-control_next" />

    <ImageModal
      v-model:isOpen="modalOpen"
      :initial-index="currentImageIndex"
      :images="images"
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
    padding: 0 40px;
  }

  .travelshop-images__nav-control {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
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
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  }

  .travelshop-images__nav-control::after {
    content: '';
    width: 20px;
    height: 20px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M15 18L9 12L15 6' stroke='%23333' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
  }

  .travelshop-images__nav-control:hover {
    background: white;
    transform: translateY(-50%) scale(1.08);
    box-shadow: 0 5px 14px rgba(0, 0, 0, 0.2);
  }

  .travelshop-images__nav-control_prev {
    left: -6px;
  }

  .travelshop-images__nav-control_next {
    right: -6px;
  }

  .travelshop-images__nav-control_next::after {
    transform: rotate(180deg);
  }

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

  .travelshop-images__slide {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .travelshop-images__image {
    width: auto;
    max-height: 590px;
    border: solid 1px var(--color-text-muted);
  }

  @mixin media-tablet {
    .travelshop-images {
      padding: 0 30px;
    }

    .travelshop-images__nav-control {
      width: 36px;
      height: 36px;
    }

    .travelshop-images__nav-control::after {
      width: 18px;
      height: 18px;
      background-size: 18px 18px;
    }
  }

  @mixin media-mobile {
    .travelshop-images {
      padding: 0 24px;
    }

    .travelshop-images__nav-control {
      width: 32px;
      height: 32px;
    }

    .travelshop-images__nav-control::after {
      width: 16px;
      height: 16px;
      background-size: 16px 16px;
    }

    .travelshop-images__image {
      max-height: 400px;
    }
  }

  .travelshop-images :deep(.swiper) {
    padding: 20px 0 0;
  }
</style>
