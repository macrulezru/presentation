import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  type TravelshopConfig,
  type DebugParams,
  DEFAULT_CONFIG,
  DEBUG_PARAMS_CONFIG,
  DebugCategory,
  SafeZoneParam,
  EllipseParam,
  AircraftParam
} from '@/enums/travelshop-intro.enum'

const getDefaultConfig = (): TravelshopConfig => {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG))
}

const deepMerge = <T extends Record<string, any>>(target: T, source: T): T => {
  const output = { ...target }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (isObject(source[key]) && isObject(target[key])) {
        output[key as keyof T] = deepMerge(target[key], source[key])
      } else {
        output[key as keyof T] = source[key]
      }
    }
  }

  return output
}

const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && !Array.isArray(item)
}

const initDebugParams = (config: TravelshopConfig): DebugParams => {
  const debugParams: DebugParams = {}

  Object.entries(DEBUG_PARAMS_CONFIG).forEach(([category, paramsConfig]) => {
    debugParams[category] = paramsConfig.map(paramConfig => ({
      id: paramConfig.id,
      value: paramConfig.getValue(config),
      min: paramConfig.min,
      max: paramConfig.max,
      step: paramConfig.step,
      onChange: (value: number) => {
        paramConfig.setValue(config, value)
      },
    }))
  })

  return debugParams
}

export const useTravelshopIntroStore = defineStore('travelshopIntro', () => {
  const config = ref<TravelshopConfig>(getDefaultConfig())
  const debugParams = ref<DebugParams>({})
  const showDebugControls = ref(false)

  const debugCategories = computed(() => {
    return Object.keys(debugParams.value)
  })

  const updateConfig = (newConfig: Partial<TravelshopConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  const importConfig = (newConfig: TravelshopConfig) => {
    config.value = deepMerge(getDefaultConfig(), newConfig)
    if (Object.keys(debugParams.value).length > 0) {
      debugParams.value = initDebugParams(config.value)
    }
  }

  const resetToDefaults = () => {
    config.value = getDefaultConfig()

    if (Object.keys(debugParams.value).length > 0) {
      debugParams.value = initDebugParams(config.value)
    }
  }

  const initStoreDebugParams = () => {
    debugParams.value = initDebugParams(config.value)
  }

  const toggleDebugControls = () => {
    showDebugControls.value = !showDebugControls.value
    if (showDebugControls.value && Object.keys(debugParams.value).length === 0) {
      initStoreDebugParams()
    }
  }

  const updateDebugParam = (id: string, value: number) => {
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

  const getParamsByCategory = (category: string) => {
    return debugParams.value[category] || []
  }

  const setSafeZoneMargins = (horizontal: number, vertical: number) => {
    config.value.safeZoneMargins.horizontal = horizontal
    config.value.safeZoneMargins.vertical = vertical
  }

  const setFollowMouseEnabled = (enabled: boolean) => {
    config.value.aircraft.followMouse.enabled = enabled
  }

  const setAutoRotationDirection = (enabled: boolean) => {
    config.value.aircraft.directionChange.enabled = enabled
  }

  const setRotationDirection = (direction: 1 | -1) => {
    config.value.aircraft.rotationDirection = direction
  }

  const toggleRotationDirection = () => {
    config.value.aircraft.rotationDirection =
      config.value.aircraft.rotationDirection === 1 ? -1 : 1
  }

  return {
    // Конфигурация
    config,
    updateConfig,
    importConfig,
    resetToDefaults,

    // Дебаг параметры
    debugParams,
    showDebugControls,
    debugCategories,

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

    // Константы для использования в компонентах (опционально)
    DebugCategory,
    SafeZoneParam,
    EllipseParam,
    AircraftParam,
  }
})
