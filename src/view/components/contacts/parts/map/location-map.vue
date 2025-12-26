<script setup lang="ts">
  import '@/view/components/contacts/parts/map/location-map.scss';

  import locationPin from '@/view/assets/images/location-pin.svg?url';

  import { onMounted, onUnmounted, ref } from 'vue';
  import type { YMap, YPlacemark } from './types';
  import { useI18n } from '@/view/composables/use-i18n.ts';

  const { t } = useI18n();

  const mapContainer = ref<HTMLElement | null>(null);
  const map = ref<ymaps.Map | null>(null);

  const mapCenter: [number, number] = [44.895, 37.316];
  const mapZoom = 10;

  const loadYandexMap = () => {
    const ymapsGlobal = (window as any).ymaps;

    if (!ymapsGlobal) {
      console.error('Yandex Maps API не загружена');
      return;
    }

    ymapsGlobal.ready(() => {
      if (!mapContainer.value) return;

      map.value = new (ymapsGlobal as any).Map(mapContainer.value, {
        center: mapCenter,
        zoom: mapZoom,
        controls: ['zoomControl', 'fullscreenControl'],

        behaviors: ['drag', 'multiTouch', 'dblClickZoom', 'rightMouseButtonMagnifier'],
      }) as YMap;

      const myPlacemark = new (ymapsGlobal as any).Placemark(
        mapCenter,
        {},
        {
          iconLayout: 'default#imageWithContent',
          iconImageHref: locationPin,
          iconImageSize: [50, 50],
          iconImageOffset: [-25, -60],
        },
      ) as YPlacemark;

      map.value.geoObjects.add(myPlacemark);
    });
  };

  onMounted(() => {
    loadYandexMap();
  });

  onUnmounted(() => {
    if (map.value) {
      map.value.destroy();
      map.value = null;
    }
  });
</script>

<template>
  <div class="location-map">
    <div class="location-map__title">{{ t('location') }}</div>
    <div ref="mapContainer" class="location-map__map" />
  </div>
</template>
