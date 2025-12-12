import { computed } from 'vue'

export interface GradientOptions {
  offsetPercent?: number // -100 до 100, по умолчанию 15 (осветление)
  direction?: 'to bottom' | 'to top' | 'to right' | 'to left' | string
  angle?: number // угол в градусах для кастомного направления
  fallbackColor?: string // цвет по умолчанию, если переменная не найдена
}

/**
 * Композиция для работы с цветовыми градиентами
 */
export function useColorGradient() {
  const isCssVariable = (value: string): boolean => {
    return value.trim().startsWith('var(--')
  }

  const isHexColor = (value: string): boolean => {
    const trimmed = value.trim()
    return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)
  }

  const getColorType = (value: string): 'hex' | 'css-var' | 'unknown' => {
    const trimmed = value.trim()

    if (isCssVariable(trimmed)) {
      return 'css-var'
    }

    if (isHexColor(trimmed)) {
      return 'hex'
    }

    return 'unknown'
  }

  const extractCssVariableName = (value: string): string => {
    const match = value.match(/var\((--[^)]+)\)/)
    return match?.[1] || value // Используем optional chaining и значение по умолчанию
  }

  const getCssVariableValue = (value: string, fallback?: string): string => {
    if (!isCssVariable(value)) {
      return value
    }

    const varName = extractCssVariableName(value)

    // Пытаемся получить значение переменной из :root
    if (typeof window !== 'undefined') {
      try {
        const computedValue = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim()

        if (computedValue) {
          return computedValue
        }
      } catch (error) {
        console.warn(`Failed to get CSS variable ${varName}:`, error)
      }
    }

    // Возвращаем fallback если указан
    if (fallback) {
      return fallback
    }

    // Если нет fallback, возвращаем саму переменную
    return `var(${varName})`
  }

  const normalizeHex = (hex: string): string => {
    let cleanHex = hex.trim()

    if (!cleanHex.startsWith('#')) {
      cleanHex = '#' + cleanHex
    }

    // Если короткая форма (#RGB), расширяем до #RRGGBB
    if (cleanHex.length === 4) {
      cleanHex =
        '#' +
        cleanHex
          .slice(1)
          .split('')
          .map(c => c + c)
          .join('')
    }

    // Проверяем валидность
    if (!/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      console.warn(`Invalid HEX color provided: ${hex}. Using fallback #f5e477`)
      return '#f5e477'
    }

    return cleanHex.toLowerCase()
  }

  const adjustHexBrightness = (hex: string, offsetPercent: number): string => {
    const normalizedHex = normalizeHex(hex)
    // Ограничиваем значение от -100 до 100
    const p = Math.max(-100, Math.min(100, offsetPercent)) / 100

    const r = parseInt(normalizedHex.slice(1, 3), 16)
    const g = parseInt(normalizedHex.slice(3, 5), 16)
    const b = parseInt(normalizedHex.slice(5, 7), 16)

    const adjustChannel = (channel: number): number => {
      if (p > 0) {
        // Осветление
        return Math.min(255, Math.floor(channel + (255 - channel) * p))
      } else if (p < 0) {
        // Затемнение
        return Math.max(0, Math.floor(channel * (1 + p)))
      }
      return channel // Если p = 0, возвращаем исходное значение
    }

    const newR = adjustChannel(r)
    const newG = adjustChannel(g)
    const newB = adjustChannel(b)

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  const adjustColorBrightness = (
    color: string,
    offsetPercent: number,
    fallback?: string,
  ): string => {
    const colorType = getColorType(color)

    // Если это CSS переменная
    if (colorType === 'css-var') {
      const varName = extractCssVariableName(color)
      const computedValue = getCssVariableValue(color, fallback)

      // Если получили реальное значение (не другую переменную), корректируем его
      if (computedValue && !isCssVariable(computedValue)) {
        // Корректируем яркость и возвращаем как HEX цвет
        return adjustHexBrightness(computedValue, offsetPercent)
      }

      // Возвращаем исходную переменную с fallback или без
      return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`
    }

    // Если это HEX цвет
    if (colorType === 'hex') {
      return adjustHexBrightness(color, offsetPercent)
    }

    // Если тип неизвестен, возвращаем fallback или оригинальный цвет
    console.warn(`Unknown color type: ${color}. Using fallback or original value.`)
    return fallback || color
  }

  const createGradient = (baseColor: string, options?: GradientOptions): string => {
    const {
      offsetPercent = 15,
      direction = 'to bottom',
      angle,
      fallbackColor = '#f5e477',
    } = options || {}

    // Определяем тип цвета
    const colorType = getColorType(baseColor)

    let colorValue: string
    let adjustedColor: string

    if (colorType === 'css-var') {
      // Для CSS переменных
      const varName = extractCssVariableName(baseColor)
      const computedValue = getCssVariableValue(baseColor, fallbackColor)

      // Если получили реальное значение
      if (computedValue && !isCssVariable(computedValue)) {
        colorValue = computedValue
        adjustedColor = adjustHexBrightness(computedValue, offsetPercent)
      } else {
        // Используем CSS переменные напрямую
        colorValue = `var(${varName}, ${fallbackColor})`
        adjustedColor = adjustHexBrightness(fallbackColor, offsetPercent)
      }
    } else if (colorType === 'hex') {
      // Для HEX цветов
      colorValue = normalizeHex(baseColor)
      adjustedColor = adjustHexBrightness(colorValue, offsetPercent)
    } else {
      // Для неизвестных типов используем fallback
      console.warn(`Unknown color type for ${baseColor}. Using fallback.`)
      colorValue = fallbackColor
      adjustedColor = adjustHexBrightness(fallbackColor, offsetPercent)
    }

    // Всегда начинаем с измененного цвета и заканчиваем базовым
    // Если offsetPercent > 0: светлый → базовый
    // Если offsetPercent < 0: темный → базовый
    // Если offsetPercent = 0: тот же цвет → базовый (однородная заливка)
    const startColor = adjustedColor
    const endColor = colorValue

    // Если указан угол, используем его
    const gradientDirection = angle ? `${angle}deg` : direction

    return `linear-gradient(${gradientDirection}, ${startColor}, ${endColor})`
  }

  const gradientStyle = (baseColor: string, options?: GradientOptions) => {
    return computed(() => ({
      background: createGradient(baseColor, options),
      backgroundImage: createGradient(baseColor, options),
    }))
  }

  const createGradientWithCssVars = (
    baseColor: string,
    options?: GradientOptions,
  ): Record<string, string> => {
    const {
      offsetPercent = 15,
      direction = 'to bottom',
      angle,
      fallbackColor = '#f5e477',
    } = options || {}

    const colorType = getColorType(baseColor)
    let adjustedColor: string
    let colorValue: string

    if (colorType === 'css-var') {
      const varName = extractCssVariableName(baseColor)
      const computedValue = getCssVariableValue(baseColor, fallbackColor)

      colorValue = `var(${varName}, ${fallbackColor})`

      if (computedValue && !isCssVariable(computedValue)) {
        adjustedColor = adjustHexBrightness(computedValue, offsetPercent)
      } else {
        adjustedColor = adjustHexBrightness(fallbackColor, offsetPercent)
      }
    } else if (colorType === 'hex') {
      colorValue = normalizeHex(baseColor)
      adjustedColor = adjustHexBrightness(baseColor, offsetPercent)
    } else {
      colorValue = fallbackColor
      adjustedColor = adjustHexBrightness(fallbackColor, offsetPercent)
    }

    const gradientDirection = angle ? `${angle}deg` : direction

    return {
      '--gradient-start': adjustedColor,
      '--gradient-end': colorValue,
      '--gradient-direction': gradientDirection,
      background: `linear-gradient(var(--gradient-direction), var(--gradient-start), var(--gradient-end))`,
    }
  }

  const createMultiStepGradient = (
    baseColor: string,
    steps: number = 3,
    options?: Omit<GradientOptions, 'direction'> & { direction?: string },
  ): string => {
    const {
      offsetPercent = 15,
      direction = 'to bottom',
      angle,
      fallbackColor = '#f5e477',
    } = options || {}

    const colorType = getColorType(baseColor)
    let colorValue: string

    if (colorType === 'css-var') {
      colorValue = getCssVariableValue(baseColor, fallbackColor)
      // Если получили другую переменную, используем fallback
      if (isCssVariable(colorValue)) {
        colorValue = fallbackColor
      }
    } else if (colorType === 'hex') {
      colorValue = normalizeHex(baseColor)
    } else {
      colorValue = fallbackColor
    }

    const colors: string[] = []

    // Создаём цвета для каждого шага
    // Для положительных offsetPercent: от светлого к базовому
    // Для отрицательных offsetPercent: от темного к базовому
    for (let i = 0; i < steps; i++) {
      // Распределяем offsetPercent между шагами
      const percent = offsetPercent * (1 - i / (steps - 1))
      const color = adjustHexBrightness(colorValue, percent)
      colors.push(color)
    }

    const gradientDirection = angle ? `${angle}deg` : direction

    return `linear-gradient(${gradientDirection}, ${colors.join(', ')})`
  }

  const createRadialGradient = (
    baseColor: string,
    options?: Omit<GradientOptions, 'direction'> & {
      shape?: 'circle' | 'ellipse'
      position?: string
    },
  ): string => {
    const {
      offsetPercent = 15,
      shape = 'ellipse',
      position = 'center',
      fallbackColor = '#f5e477',
    } = options || {}

    const colorType = getColorType(baseColor)
    let colorValue: string

    if (colorType === 'css-var') {
      colorValue = getCssVariableValue(baseColor, fallbackColor)
      // Если получили другую переменную, используем fallback
      if (isCssVariable(colorValue)) {
        colorValue = fallbackColor
      }
    } else if (colorType === 'hex') {
      colorValue = normalizeHex(baseColor)
    } else {
      colorValue = fallbackColor
    }

    const adjustedColor = adjustHexBrightness(colorValue, offsetPercent)

    return `radial-gradient(${shape} at ${position}, ${adjustedColor}, ${colorValue})`
  }

  const lightenHex = (hex: string, percent: number): string => {
    return adjustHexBrightness(hex, Math.abs(percent))
  }

  const darkenHex = (hex: string, percent: number): string => {
    return adjustHexBrightness(hex, -Math.abs(percent))
  }

  return {
    // Основные методы (автоматически определяют тип цвета)
    createGradient,
    gradientStyle,

    // Методы с поддержкой CSS переменных
    createGradientWithCssVars,

    // Утилиты для определения типа цвета
    getColorType,
    isCssVariable,
    isHexColor,
    extractCssVariableName,
    getCssVariableValue,

    // Дополнительные методы
    createMultiStepGradient,
    createRadialGradient,
    adjustHexBrightness,
    adjustColorBrightness,
    normalizeHex,

    // Для обратной совместимости
    lightenHex,
    darkenHex,

    // Утилиты для CSS custom properties
    gradientCssVar: (baseColor: string, options?: GradientOptions) => {
      const gradient = createGradient(baseColor, options)
      return {
        '--gradient-bg': gradient,
        background: `var(--gradient-bg)`,
      }
    },
  }
}
