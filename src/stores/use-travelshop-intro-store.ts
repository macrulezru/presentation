import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Типы для конфигурации
export interface TravelshopConfig {
  canvasInitHeight: number
  safeZoneMargins: {
    horizontal: number
    vertical: number
  }
  aircraft: {
    originalWidth: number
    originalHeight: number
    aspectRatio: number
    targetWidth: number
    animationDuration: number
    rotationDirection: 1 | -1
    directionChange: {
      enabled: boolean
      sensitivity: number
      minVelocityThreshold: number
      minDistanceFactor: number
      hysteresis: {
        enabled: boolean
        threshold: number
        deadZone: number
        timeDelay: number
        angleBuffer: number
      }
      smoothing: {
        enabled: boolean
        factor: number
        maxChangePerFrame: number
      }
    }
    airportEllipse: {
      horizontalRadius: number
      verticalRadius: number
      centerYOffset: number
      centerXOffset: number
    }
    mouseEllipse: {
      horizontalRadius: number
      verticalRadius: number
      roundness: number
    }
    tilt: {
      enabled: boolean
      maxAngle: number
      smoothFactor: number
    }
    followMouse: {
      enabled: boolean
      centerSmoothing: number
      ellipseSmoothing: number
      returnSpeed: number
    }
  }
  cloud: {
    originalWidth: number
    originalHeight: number
    aspectRatio: number
  }
  airport: {
    originalWidth: number
    originalHeight: number
    aspectRatio: number
    maxWidth: number
    initialMarginTop: number
  }
  clouds: {
    back: {
      minWidth: number
      maxWidth: number
      minSpeed: number
      maxSpeed: number
      adaptiveCountRatio: number
      minCount: number
      maxCount: number
    }
    middle: {
      minWidth: number
      maxWidth: number
      minSpeed: number
      maxSpeed: number
      adaptiveCountRatio: number
      minCount: number
      maxCount: number
    }
    front: {
      minWidth: number
      maxWidth: number
      minSpeed: number
      maxSpeed: number
      adaptiveCountRatio: number
      minCount: number
      maxCount: number
    }
    generationIntervals: {
      back: number
      middle: number
      front: number
    }
    yRanges: {
      back: { min: number; max: number }
      middle: { min: number; max: number }
      front: { min: number; max: number }
    }
    opacity: {
      back: { min: number; max: number }
      middle: { min: number; max: number }
      front: { min: number; max: number }
    }
  }
}

export interface ControlParam {
  id: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

export interface DebugParams {
  [category: string]: ControlParam[]
}

export const useTravelshopIntroStore = defineStore('travelshopIntro', () => {
  // Реактивная конфигурация
  const config = ref<TravelshopConfig>(getDefaultConfig())

  // Дебаг параметры в новой структуре
  const debugParams = ref<DebugParams>({})
  const showDebugControls = ref(false)

  // Вычисляемые категории дебаг параметров
  const debugCategories = computed(() => {
    return Object.keys(debugParams.value)
  })

  // Получение конфигурации по умолчанию
  function getDefaultConfig(): TravelshopConfig {
    return {
      canvasInitHeight: 560,
      safeZoneMargins: {
        horizontal: 100,
        vertical: 50,
      },
      aircraft: {
        originalWidth: 433,
        originalHeight: 163,
        aspectRatio: 163 / 433,
        targetWidth: 190,
        animationDuration: 16000,
        rotationDirection: 1,
        directionChange: {
          enabled: true,
          sensitivity: 0.8,
          minVelocityThreshold: 0.3,
          minDistanceFactor: 0.2,
          hysteresis: {
            enabled: true,
            threshold: 0.15,
            deadZone: 0.05,
            timeDelay: 200,
            angleBuffer: 0.1,
          },
          smoothing: {
            enabled: true,
            factor: 0.05,
            maxChangePerFrame: 0.3,
          },
        },
        airportEllipse: {
          horizontalRadius: 450,
          verticalRadius: 80,
          centerYOffset: 20,
          centerXOffset: 0,
        },
        mouseEllipse: {
          horizontalRadius: 200,
          verticalRadius: 100,
          roundness: 0.8,
        },
        tilt: {
          enabled: true,
          maxAngle: 0.3,
          smoothFactor: 0.8,
        },
        followMouse: {
          enabled: true,
          centerSmoothing: 0.05,
          ellipseSmoothing: 0.1,
          returnSpeed: 0.02,
        },
      },
      cloud: {
        originalWidth: 394,
        originalHeight: 237,
        aspectRatio: 237 / 394,
      },
      airport: {
        originalWidth: 800,
        originalHeight: 472,
        aspectRatio: 472 / 800,
        maxWidth: 600,
        initialMarginTop: 170,
      },
      clouds: {
        back: {
          minWidth: 30,
          maxWidth: 60,
          minSpeed: 10,
          maxSpeed: 20,
          adaptiveCountRatio: 60,
          minCount: 3,
          maxCount: 15,
        },
        middle: {
          minWidth: 60,
          maxWidth: 80,
          minSpeed: 15,
          maxSpeed: 25,
          adaptiveCountRatio: 120,
          minCount: 2,
          maxCount: 10,
        },
        front: {
          minWidth: 100,
          maxWidth: 130,
          minSpeed: 20,
          maxSpeed: 30,
          adaptiveCountRatio: 200,
          minCount: 1,
          maxCount: 5,
        },
        generationIntervals: {
          back: 10000,
          middle: 6000,
          front: 3000,
        },
        yRanges: {
          back: { min: 0.05, max: 0.25 },
          middle: { min: 0.1, max: 0.35 },
          front: { min: 0.15, max: 0.45 },
        },
        opacity: {
          back: { min: 0.2, max: 1 },
          middle: { min: 0.6, max: 1 },
          front: { min: 0.8, max: 1 },
        },
      },
    }
  }

  // Обновление конфигурации (без изменений)
  function updateConfig(newConfig: Partial<TravelshopConfig>) {
    config.value = { ...config.value, ...newConfig }
  }

  // Сброс к значениям по умолчанию
  function resetToDefaults() {
    config.value = getDefaultConfig()

    // Сброс дебаг параметров
    if (Object.keys(debugParams.value).length > 0) {
      initDebugParams()
    }
  }

  // Инициализация дебаг параметров с новой структурой
  function initDebugParams() {
    debugParams.value = {
      safeZone: [
        {
          id: 'safeZoneHorizontal',
          value: config.value.safeZoneMargins.horizontal,
          min: 0,
          max: 500,
          step: 10,
          onChange: (value: number) => {
            config.value.safeZoneMargins.horizontal = value
          },
        },
        {
          id: 'safeZoneVertical',
          value: config.value.safeZoneMargins.vertical,
          min: 0,
          max: 500,
          step: 10,
          onChange: (value: number) => {
            config.value.safeZoneMargins.vertical = value
          },
        },
      ],
      airportEllipse: [
        {
          id: 'airportEllipseHorizontalRadius',
          value: config.value.aircraft.airportEllipse.horizontalRadius,
          min: 100,
          max: 800,
          step: 10,
          onChange: (value: number) => {
            config.value.aircraft.airportEllipse.horizontalRadius = value
          },
        },
        {
          id: 'airportEllipseVerticalRadius',
          value: config.value.aircraft.airportEllipse.verticalRadius,
          min: 20,
          max: 200,
          step: 5,
          onChange: (value: number) => {
            config.value.aircraft.airportEllipse.verticalRadius = value
          },
        },
        {
          id: 'airportEllipseCenterXOffset',
          value: config.value.aircraft.airportEllipse.centerXOffset,
          min: -200,
          max: 200,
          step: 5,
          onChange: (value: number) => {
            config.value.aircraft.airportEllipse.centerXOffset = value
          },
        },
        {
          id: 'airportEllipseCenterYOffset',
          value: config.value.aircraft.airportEllipse.centerYOffset,
          min: -200,
          max: 200,
          step: 5,
          onChange: (value: number) => {
            config.value.aircraft.airportEllipse.centerYOffset = value
          },
        },
      ],
      mouseEllipse: [
        {
          id: 'mouseEllipseHorizontalRadius',
          value: config.value.aircraft.mouseEllipse.horizontalRadius,
          min: 50,
          max: 400,
          step: 10,
          onChange: (value: number) => {
            config.value.aircraft.mouseEllipse.horizontalRadius = value
          },
        },
        {
          id: 'mouseEllipseVerticalRadius',
          value: config.value.aircraft.mouseEllipse.verticalRadius,
          min: 30,
          max: 200,
          step: 5,
          onChange: (value: number) => {
            config.value.aircraft.mouseEllipse.verticalRadius = value
          },
        },
        {
          id: 'mouseEllipseRoundness',
          value: config.value.aircraft.mouseEllipse.roundness,
          min: 0.1,
          max: 1,
          step: 0.05,
          onChange: (value: number) => {
            config.value.aircraft.mouseEllipse.roundness = value
          },
        },
      ],
      aircraft: [
        {
          id: 'animationDuration',
          value: config.value.aircraft.animationDuration,
          min: 5000,
          max: 30000,
          step: 500,
          onChange: (value: number) => {
            config.value.aircraft.animationDuration = value
          },
        },
        {
          id: 'aircraftTargetWidth',
          value: config.value.aircraft.targetWidth,
          min: 50,
          max: 400,
          step: 10,
          onChange: (value: number) => {
            config.value.aircraft.targetWidth = value
          },
        },
      ],
      smoothness: [
        {
          id: 'centerSmoothing',
          value: config.value.aircraft.followMouse.centerSmoothing,
          min: 0.01,
          max: 0.3,
          step: 0.01,
          onChange: (value: number) => {
            config.value.aircraft.followMouse.centerSmoothing = value
          },
        },
        {
          id: 'ellipseSmoothing',
          value: config.value.aircraft.followMouse.ellipseSmoothing,
          min: 0.01,
          max: 0.5,
          step: 0.01,
          onChange: (value: number) => {
            config.value.aircraft.followMouse.ellipseSmoothing = value
          },
        },
        {
          id: 'returnSpeed',
          value: config.value.aircraft.followMouse.returnSpeed,
          min: 0.001,
          max: 0.1,
          step: 0.001,
          onChange: (value: number) => {
            config.value.aircraft.followMouse.returnSpeed = value
          },
        },
      ],
      autoDirection: [
        {
          id: 'sensitivity',
          value: config.value.aircraft.directionChange.sensitivity,
          min: 0.1,
          max: 2,
          step: 0.1,
          onChange: (value: number) => {
            config.value.aircraft.directionChange.sensitivity = value
          },
        },
        {
          id: 'minVelocityThreshold',
          value: config.value.aircraft.directionChange.minVelocityThreshold,
          min: 0.1,
          max: 2,
          step: 0.05,
          onChange: (value: number) => {
            config.value.aircraft.directionChange.minVelocityThreshold = value
          },
        },
        {
          id: 'minDistanceFactor',
          value: config.value.aircraft.directionChange.minDistanceFactor,
          min: 0.1,
          max: 1,
          step: 0.05,
          onChange: (value: number) => {
            config.value.aircraft.directionChange.minDistanceFactor = value
          },
        },
      ],
      hysteresis: [
        {
          id: 'hysteresisThreshold',
          value: config.value.aircraft.directionChange.hysteresis.threshold,
          min: 0.05,
          max: 0.5,
          step: 0.01,
          onChange: (value: number) => {
            config.value.aircraft.directionChange.hysteresis.threshold = value
          },
        },
        {
          id: 'hysteresisDeadZone',
          value: config.value.aircraft.directionChange.hysteresis.deadZone,
          min: 0.01,
          max: 0.3,
          step: 0.01,
          onChange: (value: number) => {
            config.value.aircraft.directionChange.hysteresis.deadZone = value
          },
        },
        {
          id: 'hysteresisTimeDelay',
          value: config.value.aircraft.directionChange.hysteresis.timeDelay,
          min: 50,
          max: 1000,
          step: 50,
          onChange: (value: number) => {
            config.value.aircraft.directionChange.hysteresis.timeDelay = value
          },
        },
        {
          id: 'hysteresisAngleBuffer',
          value: config.value.aircraft.directionChange.hysteresis.angleBuffer,
          min: 0.05,
          max: 0.5,
          step: 0.01,
          onChange: (value: number) => {
            config.value.aircraft.directionChange.hysteresis.angleBuffer = value
          },
        },
      ],
      smoothing: [
        {
          id: 'smoothingFactor',
          value: config.value.aircraft.directionChange.smoothing.factor,
          min: 0.01,
          max: 0.3,
          step: 0.01,
          onChange: (value: number) => {
            config.value.aircraft.directionChange.smoothing.factor = value
          },
        },
        {
          id: 'maxChangePerFrame',
          value: config.value.aircraft.directionChange.smoothing.maxChangePerFrame,
          min: 0.1,
          max: 1,
          step: 0.05,
          onChange: (value: number) => {
            config.value.aircraft.directionChange.smoothing.maxChangePerFrame = value
          },
        },
      ],
      tilt: [
        {
          id: 'maxTiltAngle',
          value: config.value.aircraft.tilt.maxAngle,
          min: 0.1,
          max: 1,
          step: 0.05,
          onChange: (value: number) => {
            config.value.aircraft.tilt.maxAngle = value
          },
        },
        {
          id: 'tiltSmoothFactor',
          value: config.value.aircraft.tilt.smoothFactor,
          min: 0.1,
          max: 0.95,
          step: 0.05,
          onChange: (value: number) => {
            config.value.aircraft.tilt.smoothFactor = value
          },
        },
      ],
    }
  }

  // Управление дебаг панелью
  function toggleDebugControls() {
    showDebugControls.value = !showDebugControls.value
    if (showDebugControls.value && Object.keys(debugParams.value).length === 0) {
      initDebugParams()
    }
  }

  function updateDebugParam(id: string, value: number) {
    for (const categoryKey in debugParams.value) {
      const category = debugParams.value[categoryKey]
      if (category) {
        const param = category.find(p => p.id === id)
        if (param) {
          param.value = value
          param.onChange(value)
          break
        }
      }
    }
  }

  function getParamsByCategory(category: string) {
    return debugParams.value[category] || []
  }

  // Вспомогательные методы для работы с конфигом (без изменений)
  function setSafeZoneMargins(horizontal: number, vertical: number) {
    config.value.safeZoneMargins.horizontal = horizontal
    config.value.safeZoneMargins.vertical = vertical
  }

  function setFollowMouseEnabled(enabled: boolean) {
    config.value.aircraft.followMouse.enabled = enabled
  }

  function setAutoRotationDirection(enabled: boolean) {
    config.value.aircraft.directionChange.enabled = enabled
  }

  function setRotationDirection(direction: 1 | -1) {
    config.value.aircraft.rotationDirection = direction
  }

  function toggleRotationDirection() {
    config.value.aircraft.rotationDirection =
      config.value.aircraft.rotationDirection === 1 ? -1 : 1
  }

  return {
    // Конфигурация
    config,
    updateConfig,
    resetToDefaults,

    // Дебаг параметры
    debugParams: computed(() => debugParams.value),
    showDebugControls: computed(() => showDebugControls.value),
    debugCategories: computed(() => debugCategories.value),

    // Методы управления
    toggleDebugControls,
    updateDebugParam,
    getParamsByCategory,

    // Вспомогательные методы
    setSafeZoneMargins,
    setFollowMouseEnabled,
    setAutoRotationDirection,
    setRotationDirection,
    toggleRotationDirection,
  }
})
