// use-ellipse-manager.ts (полностью исправленная версия)
import { ref, type Ref, computed, watch } from 'vue'
import type { Point, EllipseParams, EllipseCenter, Size } from './types'
import { useTravelshopIntroStore } from '@/stores/use-travelshop-intro-store'

export interface UseEllipseManagerReturn {
  currentEllipseCenter: Ref<EllipseCenter>
  airportEllipseCenter: Ref<EllipseCenter>
  currentEllipse: Ref<EllipseParams>
  targetEllipse: Ref<EllipseParams>
  adaptiveAirportEllipse: Ref<any>
  adaptiveMouseEllipse: Ref<any>
  responsiveAirportEllipse: Ref<any>
  updateEllipseCenter: (options: {
    bounds: { minX: number; maxX: number; minY: number; maxY: number }
    isMouseOverCanvas: boolean
    mousePosition: Point | null
  }) => void
  updateEllipseParameters: () => void
  updateTargetEllipseForMouse: () => void
  updateTargetEllipseForAirport: () => void
  forceUpdateEllipses: () => void // Добавим метод принудительного обновления
}

export function useEllipseManager(containerSize: Ref<Size>): UseEllipseManagerReturn {
  const travelshopIntroStore = useTravelshopIntroStore()

  // Reactive refs
  const currentEllipseCenter = ref<EllipseCenter>({ x: 0, y: 0 })
  const airportEllipseCenter = ref<EllipseCenter>({ x: 0, y: 0 })
  const currentEllipse = ref<EllipseParams>({
    semiMajorAxis: 0,
    semiMinorAxis: 0,
  })
  const targetEllipse = ref<EllipseParams>({
    semiMajorAxis: 0,
    semiMinorAxis: 0,
  })

  // Computed properties - они будут реактивными
  const adaptiveAirportEllipse = computed(() => {
    if (!containerSize.value.width) {
      return travelshopIntroStore.config.aircraft.airportEllipse
    }

    const baseEllipse = travelshopIntroStore.config.aircraft.airportEllipse

    if (containerSize.value.width < 768) {
      return {
        ...baseEllipse,
        horizontalRadius: containerSize.value.width * 0.5,
        verticalRadius: 60,
        centerYOffset: 10,
      }
    } else if (containerSize.value.width < 1024) {
      return {
        ...baseEllipse,
        horizontalRadius: containerSize.value.width * 0.4,
        verticalRadius: 70,
        centerYOffset: 15,
      }
    } else {
      return baseEllipse
    }
  })

  const adaptiveMouseEllipse = computed(() => {
    if (!containerSize.value.width) {
      return travelshopIntroStore.config.aircraft.mouseEllipse
    }

    const baseEllipse = travelshopIntroStore.config.aircraft.mouseEllipse

    if (containerSize.value.width < 768) {
      return {
        ...baseEllipse,
        horizontalRadius: 150,
        verticalRadius: 75,
        roundness: 0.7,
      }
    } else if (containerSize.value.width < 1024) {
      return {
        ...baseEllipse,
        horizontalRadius: 180,
        verticalRadius: 90,
        roundness: 0.8,
      }
    } else {
      return baseEllipse
    }
  })

  const responsiveAirportEllipse = computed(() => {
    if (!containerSize.value.width) {
      return travelshopIntroStore.config.aircraft.airportEllipse
    }

    const baseEllipse = travelshopIntroStore.config.aircraft.airportEllipse

    if (travelshopIntroStore.config.airport.maxWidth > containerSize.value.width - 60) {
      return {
        ...baseEllipse,
        horizontalRadius: containerSize.value.width * 0.35,
        verticalRadius: 60,
        centerYOffset: 15,
      }
    } else {
      return baseEllipse
    }
  })

  // Методы теперь НЕ принимают config как параметр
  const updateTargetEllipseForMouse = () => {
    if (!travelshopIntroStore.config.aircraft.followMouse.enabled) {
      updateTargetEllipseForAirport()
      return
    }

    const mouseEllipse = adaptiveMouseEllipse.value
    const mouseHorizontal = mouseEllipse.horizontalRadius
    const mouseVertical = mouseEllipse.verticalRadius
    const roundness = mouseEllipse.roundness
    const baseRadius = Math.min(mouseHorizontal, mouseVertical)

    targetEllipse.value.semiMajorAxis =
      baseRadius + (mouseHorizontal - baseRadius) * roundness
    targetEllipse.value.semiMinorAxis =
      baseRadius + (mouseVertical - baseRadius) * roundness
  }

  const updateTargetEllipseForAirport = () => {
    const ellipse = adaptiveAirportEllipse.value
    targetEllipse.value.semiMajorAxis = ellipse.horizontalRadius
    targetEllipse.value.semiMinorAxis = ellipse.verticalRadius
  }

  const updateEllipseCenter = (options: {
    bounds: { minX: number; maxX: number; minY: number; maxY: number }
    isMouseOverCanvas: boolean
    mousePosition: Point | null
  }) => {
    const { bounds, isMouseOverCanvas, mousePosition } = options

    if (!travelshopIntroStore.config.aircraft.followMouse.enabled) {
      const safeAirportCenter = {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, airportEllipseCenter.value.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, airportEllipseCenter.value.y)),
      }
      currentEllipseCenter.value = { ...safeAirportCenter }
      return
    }

    if (isMouseOverCanvas && mousePosition) {
      const safeMousePos = {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, mousePosition.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, mousePosition.y)),
      }

      const smoothing = travelshopIntroStore.config.aircraft.followMouse.centerSmoothing
      currentEllipseCenter.value.x +=
        (safeMousePos.x - currentEllipseCenter.value.x) * smoothing
      currentEllipseCenter.value.y +=
        (safeMousePos.y - currentEllipseCenter.value.y) * smoothing

      const safeCurrent = {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, currentEllipseCenter.value.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, currentEllipseCenter.value.y)),
      }
      currentEllipseCenter.value.x = safeCurrent.x
      currentEllipseCenter.value.y = safeCurrent.y
    } else {
      const returnSpeed = travelshopIntroStore.config.aircraft.followMouse.returnSpeed
      const safeAirportCenter = {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, airportEllipseCenter.value.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, airportEllipseCenter.value.y)),
      }

      currentEllipseCenter.value.x +=
        (safeAirportCenter.x - currentEllipseCenter.value.x) * returnSpeed
      currentEllipseCenter.value.y +=
        (safeAirportCenter.y - currentEllipseCenter.value.y) * returnSpeed

      const safeCurrent = {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, currentEllipseCenter.value.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, currentEllipseCenter.value.y)),
      }
      currentEllipseCenter.value.x = safeCurrent.x
      currentEllipseCenter.value.y = safeCurrent.y
    }
  }

  const updateEllipseParameters = () => {
    if (!travelshopIntroStore.config.aircraft.followMouse.enabled) {
      const ellipse = adaptiveAirportEllipse.value
      currentEllipse.value.semiMajorAxis = ellipse.horizontalRadius
      currentEllipse.value.semiMinorAxis = ellipse.verticalRadius
      return
    }

    const smoothing = travelshopIntroStore.config.aircraft.followMouse.ellipseSmoothing
    currentEllipse.value.semiMajorAxis +=
      (targetEllipse.value.semiMajorAxis - currentEllipse.value.semiMajorAxis) * smoothing
    currentEllipse.value.semiMinorAxis +=
      (targetEllipse.value.semiMinorAxis - currentEllipse.value.semiMinorAxis) * smoothing
  }

  const forceUpdateEllipses = () => {
    // Принудительное обновление при изменении конфига
    updateTargetEllipseForAirport()
    updateEllipseParameters()
  }

  // Watcher для обновления при изменении конфига
  watch(
    () => travelshopIntroStore.config,
    () => {
      forceUpdateEllipses()
    },
    { deep: true },
  )

  // Watcher для обновления при изменении размеров контейнера
  watch(
    () => containerSize.value.width,
    () => {
      forceUpdateEllipses()
    },
  )

  return {
    currentEllipseCenter,
    airportEllipseCenter,
    currentEllipse,
    targetEllipse,
    adaptiveAirportEllipse,
    adaptiveMouseEllipse,
    responsiveAirportEllipse,
    updateEllipseCenter,
    updateEllipseParameters,
    updateTargetEllipseForMouse,
    updateTargetEllipseForAirport,
    forceUpdateEllipses,
  }
}
