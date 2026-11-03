<script setup lang="ts">
  import 'swiper/css';
  import 'swiper/css/pagination';
  import './ui-carousel.scss';

  import { Navigation, Pagination } from 'swiper/modules';
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { computed } from 'vue';

  import { type Slide } from './types';

  interface Props {
    slides: Slide[];
    closable?: boolean;
    maxHeight?: number;
  }

  interface Emits {
    (e: 'slide-click', index: string | number): void;
    (e: 'close'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const modules = [Navigation, Pagination];

  const styles = computed(() => {
    const result: Record<string, string> = {};
    if (props.maxHeight) {
      result['--ui-carousel-max-height'] = `${props.maxHeight}px`;
    }
    return result;
  });

  const handleImageClick = (index: string | number) => {
    emit('slide-click', index);
  };

  const onClose = () => {
    emit('close');
  };
</script>
<template>
  <div class="ui-carousel" :style="styles">
    <span v-if="props.closable" class="ui-carousel__close-btn" @click="onClose" />
    <swiper
      class="ui-carousel__swiper"
      :slidesPerView="'auto'"
      :spaceBetween="0"
      :centeredSlides="true"
      :modules="modules"
      :pagination="{
        clickable: true,
      }"
      :navigation="{
        nextEl: '.ui-carousel__button-next',
        prevEl: '.ui-carousel__button-prev',
      }"
    >
      <swiper-slide v-for="(item, index) in props.slides" :key="index">
        <div class="ui-carousel__slide">
          <img
            :src="item.image"
            :alt="item.description || `slide-${index}`"
            class="ui-carousel__image"
            draggable="false"
            role="button"
            :tabindex="index"
            @click="handleImageClick(index)"
          />
        </div>
      </swiper-slide>
    </swiper>
    <span class="ui-carousel__button-prev" aria-label="Предыдущий слайд" />
    <span class="ui-carousel__button-next" aria-label="Следующий слайд" />
  </div>
</template>
