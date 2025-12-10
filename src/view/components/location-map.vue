<script setup lang="ts">
  import locationPin from '@/view/assets/images/location-pin.svg?url'

  import { onMounted, onUnmounted, ref } from 'vue'
  import { useI18n } from '@/view/composables/use-i18n.ts'

  const { t } = useI18n()

  interface YMap extends ymaps.Map {}
  interface YPlacemark extends ymaps.Placemark {}

  const mapContainer = ref<HTMLElement | null>(null)
  const map = ref<ymaps.Map | null>(null)

  const mapCenter: [number, number] = [44.895, 37.316]
  const mapZoom = 10

  const loadYandexMap = () => {
    const ymapsGlobal = (window as any).ymaps

    if (!ymapsGlobal) {
      console.error('Yandex Maps API не загружена')
      return
    }

    ymapsGlobal.ready(() => {
      if (!mapContainer.value) return

      map.value = new (ymapsGlobal as any).Map(mapContainer.value, {
        center: mapCenter,
        zoom: mapZoom,
        controls: ['zoomControl', 'fullscreenControl'],

        behaviors: ['drag', 'multiTouch', 'dblClickZoom', 'rightMouseButtonMagnifier'],
      }) as YMap

      const myPlacemark = new (ymapsGlobal as any).Placemark(
        mapCenter,
        {},
        {
          iconLayout: 'default#imageWithContent',
          iconImageHref: locationPin,
          iconImageSize: [50, 50],
          iconImageOffset: [-25, -60],
        },
      ) as YPlacemark

      map.value.geoObjects.add(myPlacemark)
    })
  }

  onMounted(() => {
    loadYandexMap()
  })

  onUnmounted(() => {
    if (map.value) {
      map.value.destroy()
      map.value = null
    }
  })
</script>

<template>
  <div class="location-map">
    <div class="location-map__title">{{ t('location') }}</div>
    <div ref="mapContainer" class="location-map__map" />
  </div>
</template>

<style lang="scss" scoped>
  .location-map__title {
    padding: var(--spacing-2xl) 0 var(--spacing-md);
    font-size: var(--font-size-xl);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
    text-align: center;
  }

  .location-map__map {
    width: 100%;
    height: 400px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  :deep([class*='map-copyrights-promo']) {
    display: none !important;
  }
</style>
