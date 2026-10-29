<script setup lang="ts">
  import '@/view/components/travelshop-project/travelshop-project.scss';

  import { ref, computed, defineAsyncComponent, h, Transition, watch } from 'vue';

  import type {
    SystemModule,
    Feature,
    Project,
    ITravelshopImage,
  } from '@/view/components/travelshop-project/types';

  import TravelshopImageBooking from '@/view/assets/images/travelshop-booking.webp';
  import TravelshopImageCabinet from '@/view/assets/images/travelshop-cabinet.webp';
  import TravelshopImageCheckin from '@/view/assets/images/travelshop-checkin.webp';
  import TravelshopImageExchange from '@/view/assets/images/travelshop-exchange.webp';
  import TravelshopImage from '@/view/assets/images/travelshop-head.webp';
  import TravelshopImageServices from '@/view/assets/images/travelshop-services.webp';
  import TravelshopImageArchitecture from '@/view/assets/images/travelshop-tech.webp';
  import Button from '@/view/ui/ui-button/ui-button.vue';
  import LinkArrow from '@/view/ui/ui-link-arrow/ui-link-arrow.vue';
  import UiLoading from '@/view/ui/ui-loading/ui-loading.vue';
  import { useI18n } from '~/composables/useI18n';

  const TravelshopImages = defineAsyncComponent({
    loader: () =>
      import('@/view/components/travelshop-project/parts/travelshop-images/travelshop-images.vue'),
    loadingComponent: () =>
      h(
        Transition,
        { name: 'loader-appear', appear: true },
        {
          default: () =>
            h('div', { class: 'travelshop__gallery-loader' }, [
              h(UiLoading, {
                type: 'circle',
                circleRadius: 60,
                thickness: 5,
                strokeColor: '#151515',
                progressColor: '#78cf05',
              }),
            ]),
        },
      ),
    delay: 0,
    suspensible: false,
  });

  const TravelshopIntro = defineAsyncComponent({
    loader: () =>
      import('@/view/components/travelshop-project/parts/travelshop-intro/travelshop-intro.vue'),
    loadingComponent: () =>
      h('div', { class: 'travelshop__animation-loader' }, [
        h(UiLoading, {
          type: 'circle',
          circleRadius: 60,
          thickness: 5,
          strokeColor: '#151515',
          progressColor: '#78cf05',
        }),
      ]),
    delay: 0,
    suspensible: false,
  });

  const { t, tm } = useI18n();

  const responsive = useResponsive();

  const showSwiper = ref<boolean>(false);
  const isShowAnimation = ref<boolean>(false);
  const travelshopRef = ref<HTMLElement>();

  const introVisibility = useElementVisibility(travelshopRef, { once: true });

  const isIntroVisible = computed(() => introVisibility.isVisible);

  const moduleImages: Record<string, ITravelshopImage> = {
    booking: {
      image: TravelshopImageBooking,
      hazehash: 'MP9PMPKJQo_ycZx0Q4C3kY1dQa3tuFVq8cxrrvoXc5mzldApirMNus3dugyw84OJ',
    },
    checkin: {
      image: TravelshopImageCheckin,
      hazehash: 'MP_PMvuYypfomp1jNaaCcThy1hRuffQprYZipcYslvUQtXCXCs0mLdTLcUZlXRCL',
    },
    services: {
      image: TravelshopImageServices,
      hazehash: 'MP9QrvqASo_yjSWhxDWmVNZptrV1F5mtZ3c6lS96mHXDOSGeoB8KnQ1UlyHceYqM',
    },
    exchange: {
      image: TravelshopImageExchange,
      hazehash: 'MP9QrwIAQH_wfFa6W04kTjOqHP3Op65URzt8Xz06v1yFMneeMrWtavGt3k3YLF62',
    },
    cabinet: {
      image: TravelshopImageCabinet,
      hazehash: 'MP9OMvMISpfqnB1xHOgbnKg3OBmdqNVcYV3PG7heKyrHLiiMuqYFNKoWWS1jnLdZ',
    },
    architecture: {
      image: TravelshopImageArchitecture,
      hazehash: 'MP9yLvoAQIfgicTA00YYq8mYlz77G1pBLvGqHO4vjFqr085jZOMLZ3s9bUsXjMxg',
    },
  };

  const systemModules = computed<SystemModule[]>(() => {
    const raw = tm('travelshop.modules') as unknown;

    if (!raw || typeof raw !== 'object') return [];

    const list = Array.isArray(raw) ? raw : Object.entries(raw);

    return list
      .filter(
        (item): item is [string, Record<string, unknown>] =>
          Array.isArray(item) && !!item[1] && typeof item[1] === 'object',
      )
      .map(([key, item]) => ({
        image: moduleImages[key] || moduleImages.booking!,
        title: typeof item.title === 'string' ? item.title : '',
        subTitle: typeof item.subTitle === 'string' ? item.subTitle : '',
        description: typeof item.description === 'string' ? item.description : '',
        itemsTitle: typeof item.itemsTitle === 'string' ? item.itemsTitle : '',
        items: Array.isArray(item.items)
          ? item.items.filter((x): x is string => typeof x === 'string')
          : [],
      }));
  });

  const features = computed<Feature[]>(() => {
    const items = tm('travelshop.features.items') as Record<string, unknown>[];
    return Array.isArray(items)
      ? items.map(item => ({
          icon: typeof item?.icon === 'string' ? item.icon : '',
          title: typeof item?.title === 'string' ? item.title : '',
          text: typeof item?.text === 'string' ? item.text : '',
        }))
      : [];
  });

  const projects = computed<Project[]>(() => {
    const items = tm('travelshop.projects.items') as Record<string, unknown>[];
    return Array.isArray(items)
      ? items.map(item => ({
          name: typeof item?.name === 'string' ? item.name : '',
          url: typeof item?.url === 'string' ? item.url : '',
          description: typeof item?.description === 'string' ? item.description : '',
        }))
      : [];
  });

  const toggleSwiper = () => {
    showSwiper.value = !showSwiper.value;
  };

  watch(
    isIntroVisible.value,
    () => {
      isShowAnimation.value = true;
    },
    { once: true },
  );
</script>

<template>
  <div ref="travelshopRef" class="travelshop">
    <template v-if="isShowAnimation">
      <TravelshopIntro />
    </template>
    <div v-else class="travelshop__animation-loader">
      <UiLoading
        type="circle"
        :circleRadius="60"
        :thickness="5"
        strokeColor="#151515"
        progressColor="#78cf05"
      />
    </div>
    <div class="travelshop__intro">
      <div class="travelshop__container travelshop__airplane_top">
        <div class="travelshop__intro-description">
          <div>
            <span class="travelshop__role">{{ t('travelshop.role') }}</span>
          </div>
          <div class="travelshop__title">{{ t('travelshop.title') }}</div>
          <div class="travelshop__subtitle">{{ t('travelshop.description') }}</div>
        </div>
      </div>
    </div>

    <div class="travelshop__container travelshop__airplane_bottom">
      <div class="travelshop__content">
        <div>
          <div class="travelshop__section-title">
            {{ t('travelshop.features.title') }}
          </div>
          <div class="travelshop__features">
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="travelshop__feature"
            >
              <span
                class="travelshop__feature-icon"
                :class="`travelshop__feature-icon_${feature.icon}`"
              />
              <span class="travelshop__feature-title">{{ feature.title }}</span>
              <span class="travelshop__feature-text">{{ feature.text }}</span>
            </div>
          </div>
        </div>

        <div v-if="!responsive.smallTablet">
          <VImage
            :src="TravelshopImage"
            hazehash="E__mOuwYqnb9-uL5PkZcx7x5zdS7lkww4tndzJeEjkzVkyWtY5wiZGWX"
            :width="1400"
            :height="560"
            alt="TravelShop 2.0"
            class="travelshop__tsh-image"
          />
        </div>
        <div class="travelshop__modules">
          <div
            v-for="(item, index) in systemModules"
            :key="index"
            class="travelshop__module"
          >
            <VImage
              :src="item.image.image"
              :hazehash="item.image.hazehash"
              :width="300"
              :height="264"
              :alt="item.title"
              class="travelshop__module-image"
            />
            <div class="travelshop__module-head">
              <div class="travelshop__module-title">{{ item.title }}</div>
              <div class="travelshop__module-subtitle">{{ item.subTitle }}</div>
            </div>
            <div class="travelshop__module-description">
              {{ item.description }}
            </div>
            <div class="travelshop__module-items">
              <div class="travelshop__module-items-title">{{ item.itemsTitle }}</div>
              <ul class="travelshop__module-items-list">
                <li
                  v-for="(listItem, listIndex) in item.items"
                  :key="listIndex"
                  class="travelshop__module-items-list-item"
                >
                  {{ listItem }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Проекты -->
        <div class="travelshop__projects">
          <a
            v-for="(project, index) in projects"
            :key="index"
            class="travelshop__project"
            :href="project.url"
            target="_blank"
          >
            <span class="travelshop__project-header">
              <span class="travelshop__project-name">
                {{ project.name }}
                <LinkArrow class="travelshop__project-arrow" />
              </span>
            </span>
            <div class="travelshop__project-description">{{ project.description }}</div>
          </a>
        </div>

        <div
          v-if="!showSwiper"
          class="travelshop__section travelshop__section_images-button"
        >
          <Button :text="t('travelshop.view_screenshots')" @click="toggleSwiper" />
        </div>
        <div v-if="showSwiper" class="travelshop__section travelshop__section_images">
          <div class="travelshop__ts-slideshow">
            <TravelshopImages
              size="large"
              :textKey="t('travelshop.loading_screenshots')"
              @close="showSwiper = false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
