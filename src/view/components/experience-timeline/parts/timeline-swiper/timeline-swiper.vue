<script setup lang="ts">
  import './timeline-swiper.scss';
  import 'swiper/css';
  import 'swiper/css/pagination';

  import { Navigation, Pagination } from 'swiper/modules';
  import { Swiper, SwiperSlide } from 'swiper/vue';

  import { type ExperienceItem } from './../../experience-items';
  import CompanyItem from './../company-item/company-item.vue';

  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    items?: ExperienceItem[];
  }>();

  const modules = [Pagination, Navigation];

  const breakpoints = {
    380: {
      slidesPerView: 1,
      slidesPerGroup: 1,
    },

    680: {
      slidesPerView: 2,
      slidesPerGroup: 2,
    },

    1000: {
      slidesPerView: 3,
      slidesPerGroup: 3,
    },
  };
</script>

<template>
  <div class="timeline-swiper">
    <swiper
      class="timeline-swiper__swiper"
      :slidesPerView="3"
      :slidesPerGroup="3"
      :modules="modules"
      :pagination="{
        clickable: true,
      }"
      :navigation="{
        nextEl: '.timeline-swiper__button-next',
        prevEl: '.timeline-swiper__button-prev',
      }"
      :breakpoints="breakpoints"
    >
      <swiper-slide
        v-for="item in props.items"
        :key="item.id"
        class="timeline-swiper__slide"
      >
        <CompanyItem class="" :company="item" />
      </swiper-slide>
    </swiper>
    <button class="timeline-swiper__button-prev" :aria-label="t('swiper.prevSlide')" />
    <button class="timeline-swiper__button-next" :aria-label="t('swiper.nextSlide')" />
  </div>
</template>
