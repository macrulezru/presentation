<script setup lang="ts">
  import ImageModal from '@/view/ui/ui-image-modal/ui-image-modal.vue'

  import '@/view/components/travelshop-project/parts/travelshop-images/travelshop-images.scss'

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
