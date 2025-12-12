import { computed } from 'vue'

export interface GradientOptions {
  lightenPercent?: number // 0-100, по умолчанию 15
  direction?: 'to bottom' | 'to top' | 'to right' | 'to left' | string
  angle?: number // угол в градусах для кастомного направления
  fallbackColor?: string // цвет по умолчанию, если переменная не найдена
}

/**
 * Композиция для работы с цветовыми градиентами
 */
export function useColorGradient() {
  /**
   * Определяет, является ли значение CSS переменной
   */
  const isCssVariable = (value: string): boolean => {
    return value.trim().startsWith('var(--')
  }

  /**
   * Определяет, является ли значение HEX цветом
   */
  const isHexColor = (value: string): boolean => {
    const trimmed = value.trim()
    return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)
  }

  /**
   * Определяет тип цвета: 'hex', 'css-var' или 'unknown'
   */
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

  /**
   * Извлекает имя переменной из var(--name)
   */
  const extractCssVariableName = (value: string): string => {
    const match = value.match(/var\((--[^)]+)\)/)
    return match?.[1] || value // Используем optional chaining и значение по умолчанию
  }

  /**
   * Получает значение CSS переменной или возвращает переданное значение
   */
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

  /**
   * Нормализует HEX строку
   */
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

  /**
   * Осветляет HEX цвет на указанный процент
   */
  const lightenHex = (hex: string, percent: number): string => {
    const normalizedHex = normalizeHex(hex)
    const p = Math.max(0, Math.min(100, percent)) / 100

    const r = parseInt(normalizedHex.slice(1, 3), 16)
    const g = parseInt(normalizedHex.slice(3, 5), 16)
    const b = parseInt(normalizedHex.slice(5, 7), 16)

    const lightenChannel = (channel: number): number => {
      return Math.min(255, Math.floor(channel + (255 - channel) * p))
    }

    const newR = lightenChannel(r)
    const newG = lightenChannel(g)
    const newB = lightenChannel(b)

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  /**
   * Осветляет цвет с поддержкой CSS переменных
   */
  const lightenColor = (color: string, percent: number, fallback?: string): string => {
    const colorType = getColorType(color)

    // Если это CSS переменная
    if (colorType === 'css-var') {
      const varName = extractCssVariableName(color)
      const computedValue = getCssVariableValue(color, fallback)

      // Если получили реальное значение (не другую переменную), осветляем его
      if (computedValue && !isCssVariable(computedValue)) {
        // Осветляем и возвращаем как HEX цвет
        return lightenHex(computedValue, percent)
      }

      // Возвращаем исходную переменную с fallback или без
      return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`
    }

    // Если это HEX цвет
    if (colorType === 'hex') {
      return lightenHex(color, percent)
    }

    // Если тип неизвестен, возвращаем fallback или оригинальный цвет
    console.warn(`Unknown color type: ${color}. Using fallback or original value.`)
    return fallback || color
  }

  /**
   * Универсальный метод для создания градиента
   * Автоматически определяет тип цвета (HEX или CSS переменная)
   */
  const createGradient = (baseColor: string, options?: GradientOptions): string => {
    const {
      lightenPercent = 15,
      direction = 'to bottom',
      angle,
      fallbackColor = '#f5e477',
    } = options || {}

    // Определяем тип цвета
    const colorType = getColorType(baseColor)

    let colorValue: string
    let lightColor: string

    if (colorType === 'css-var') {
      // Для CSS переменных
      const varName = extractCssVariableName(baseColor)
      const computedValue = getCssVariableValue(baseColor, fallbackColor)

      // Если получили реальное значение
      if (computedValue && !isCssVariable(computedValue)) {
        colorValue = computedValue
        lightColor = lightenHex(computedValue, lightenPercent)
      } else {
        // Используем CSS переменные напрямую
        colorValue = `var(${varName}, ${fallbackColor})`
        lightColor = lightenHex(fallbackColor, lightenPercent)
      }
    } else if (colorType === 'hex') {
      // Для HEX цветов
      colorValue = normalizeHex(baseColor)
      lightColor = lightenHex(colorValue, lightenPercent)
    } else {
      // Для неизвестных типов используем fallback
      console.warn(`Unknown color type for ${baseColor}. Using fallback.`)
      colorValue = fallbackColor
      lightColor = lightenHex(fallbackColor, lightenPercent)
    }

    // Если указан угол, используем его
    const gradientDirection = angle ? `${angle}deg` : direction

    return `linear-gradient(${gradientDirection}, ${lightColor}, ${colorValue})`
  }

  /**
   * Создаёт объект стилей для использования в :style
   * Автоматически определяет тип цвета
   */
  const gradientStyle = (baseColor: string, options?: GradientOptions) => {
    return computed(() => ({
      background: createGradient(baseColor, options),
      backgroundImage: createGradient(baseColor, options),
    }))
  }

  /**
   * Создаёт градиент с поддержкой CSS переменных для использования в CSS
   */
  const createGradientWithCssVars = (
    baseColor: string,
    options?: GradientOptions,
  ): Record<string, string> => {
    const {
      lightenPercent = 15,
      direction = 'to bottom',
      angle,
      fallbackColor = '#f5e477',
    } = options || {}

    const colorType = getColorType(baseColor)
    let lightColor: string
    let colorValue: string

    if (colorType === 'css-var') {
      const varName = extractCssVariableName(baseColor)
      colorValue = `var(${varName}, ${fallbackColor})`
      lightColor = `var(--${varName}-light, ${fallbackColor})`
    } else if (colorType === 'hex') {
      colorValue = normalizeHex(baseColor)
      lightColor = lightenHex(baseColor, lightenPercent)
    } else {
      colorValue = fallbackColor
      lightColor = lightenHex(fallbackColor, lightenPercent)
    }

    const gradientDirection = angle ? `${angle}deg` : direction

    return {
      '--gradient-light': lightColor,
      '--gradient-base': colorValue,
      '--gradient-direction': gradientDirection,
      background: `linear-gradient(var(--gradient-direction), var(--gradient-light), var(--gradient-base))`,
    }
  }

  /**
   * Создаёт градиент с несколькими промежуточными цветами
   */
  const createMultiStepGradient = (
    baseColor: string,
    steps: number = 3,
    options?: Omit<GradientOptions, 'direction'> & { direction?: string },
  ): string => {
    const {
      lightenPercent = 15,
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
    for (let i = 0; i < steps; i++) {
      const percent = (lightenPercent / (steps - 1)) * (steps - 1 - i)
      const color = i === steps - 1 ? colorValue : lightenHex(colorValue, percent)
      colors.push(color)
    }

    const gradientDirection = angle ? `${angle}deg` : direction

    return `linear-gradient(${gradientDirection}, ${colors.join(', ')})`
  }

  /**
   * Создаёт радиальный градиент
   */
  const createRadialGradient = (
    baseColor: string,
    options?: Omit<GradientOptions, 'direction'> & {
      shape?: 'circle' | 'ellipse'
      position?: string
    },
  ): string => {
    const {
      lightenPercent = 15,
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

    const lightColor = lightenHex(colorValue, lightenPercent)

    return `radial-gradient(${shape} at ${position}, ${lightColor}, ${colorValue})`
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
    lightenHex,
    lightenColor,
    normalizeHex,

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
