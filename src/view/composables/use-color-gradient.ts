import { computed } from 'vue';

export interface GradientOptions {
  offsetPercent?: number; // -100 до 100, по умолчанию 15 (осветление)
  direction?: 'to bottom' | 'to top' | 'to right' | 'to left' | string;
  angle?: number; // угол в градусах для кастомного направления
  fallbackColor?: string; // цвет по умолчанию, если переменная не найдена
}

export interface RadialGradientOptions {
  offsetPercent?: number;
  fallbackColor?: string;

  // Базовая конфигурация
  shape?: 'circle' | 'ellipse';
  size?: string | { width: string; height: string }; // '50% 50%' или { width: '80%', height: '50%' }
  position?: string; // '50% 50%', 'center', 'top left' и т.д.

  // Расширенная конфигурация с массивами цветов
  useCustomColors?: boolean;
  colors?: Array<{
    color: string;
    opacity?: number; // 0-1
    position?: string; // '0%', '50%' и т.д.
  }>;

  // Многослойные градиенты
  layers?: Array<{
    shape?: 'circle' | 'ellipse';
    size?: string | { width: string; height: string };
    position?: string;
    colors: Array<{
      color: string;
      opacity?: number;
      position?: string;
    }>;
  }>;
}

export interface ConicGradientOptions {
  // Основные параметры
  fromAngle?: number; // начальный угол в градусах (0-360)
  position?: string; // положение центра ('50% 50%', 'center', 'top left' и т.д.)
  fallbackColor?: string;

  // Кастомные цвета с позициями
  colors?: Array<{
    color: string;
    opacity?: number; // 0-1
    position?: string | number; // '0%', '50%', 0.5, 90 (градусы)
  }>;

  // Для автоматической генерации градиента
  hueRotation?: boolean; // использовать вращение оттенка вместо яркости
  steps?: number; // количество шагов цвета
  offsetPercent?: number; // регулировка яркости для каждого шага
}

/**
 * Композиция для работы с цветовыми градиентами
 */
export function useColorGradient() {
  const isCssVariable = (value: string): boolean => {
    return value.trim().startsWith('var(--');
  };

  const isHexColor = (value: string): boolean => {
    const trimmed = value.trim();
    return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed);
  };

  const isRgbColor = (value: string): boolean => {
    const trimmed = value.trim().toLowerCase();
    return trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(');
  };

  const isHslColor = (value: string): boolean => {
    const trimmed = value.trim().toLowerCase();
    return trimmed.startsWith('hsl(') || trimmed.startsWith('hsla(');
  };

  const getColorType = (
    value: string,
  ): 'hex' | 'css-var' | 'rgb' | 'hsl' | 'named' | 'unknown' => {
    const trimmed = value.trim().toLowerCase();

    if (isCssVariable(trimmed)) {
      return 'css-var';
    }

    if (isHexColor(trimmed)) {
      return 'hex';
    }

    if (isRgbColor(trimmed)) {
      return 'rgb';
    }

    if (isHslColor(trimmed)) {
      return 'hsl';
    }

    // Проверяем, является ли цвет именованным CSS цветом
    const namedColors = [
      'transparent',
      'currentcolor',
      'inherit',
      'initial',
      'unset',
      'black',
      'white',
      'red',
      'green',
      'blue',
      'yellow',
      'purple',
      'orange',
      'gray',
      'grey',
      'pink',
      'brown',
      'cyan',
      'magenta',
      'violet',
      'aqua',
      'beige',
      'coral',
      'gold',
      'indigo',
      'ivory',
      'khaki',
      'lavender',
      'lime',
      'maroon',
      'navy',
      'olive',
      'orchid',
      'plum',
      'salmon',
      'silver',
      'tan',
      'teal',
      'tomato',
      'wheat',
    ];

    if (namedColors.includes(trimmed)) {
      return 'named';
    }

    return 'unknown';
  };

  const extractCssVariableName = (value: string): string => {
    const match = value.match(/var\((--[^)]+)\)/);
    return match?.[1] || value;
  };

  const getCssVariableValue = (value: string, fallback?: string): string => {
    if (!isCssVariable(value)) {
      return value;
    }

    const varName = extractCssVariableName(value);

    // Пытаемся получить значение переменной из :root
    if (typeof window !== 'undefined') {
      try {
        const computedValue = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();

        if (computedValue) {
          return computedValue;
        }
      } catch (error) {
        console.warn(`Failed to get CSS variable ${varName}:`, error);
      }
    }

    // Возвращаем fallback если указан
    if (fallback) {
      return fallback;
    }

    // Если нет fallback, возвращаем саму переменную
    return `var(${varName})`;
  };

  const normalizeHex = (hex: string): string => {
    let cleanHex = hex.trim();

    if (!cleanHex.startsWith('#')) {
      cleanHex = `#${cleanHex}`;
    }

    // Если короткая форма (#RGB), расширяем до #RRGGBB
    if (cleanHex.length === 4) {
      cleanHex = `#${cleanHex
        .slice(1)
        .split('')
        .map(c => c + c)
        .join('')}`;
    }

    // Проверяем валидность
    if (!/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      console.warn(`Invalid HEX color provided: ${hex}. Using fallback #f5e477`);
      return '#f5e477';
    }

    return cleanHex.toLowerCase();
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const normalizedHex = normalizeHex(hex);

    const r = parseInt(normalizedHex.slice(1, 3), 16);
    const g = parseInt(normalizedHex.slice(3, 5), 16);
    const b = parseInt(normalizedHex.slice(5, 7), 16);

    return [r, g, b];
  };

  const hexToRgba = (hex: string, opacity: number = 1): string => {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const hexToHsl = (hex: string): [number, number, number] => {
    const [r, g, b] = hexToRgb(hex);

    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case red:
          h = (green - blue) / d + (green < blue ? 6 : 0);
          break;
        case green:
          h = (blue - red) / d + 2;
          break;
        case blue:
          h = (red - green) / d + 4;
          break;
      }

      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    h = h % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const adjustHexBrightness = (hex: string, offsetPercent: number): string => {
    const normalizedHex = normalizeHex(hex);
    // Ограничиваем значение от -100 до 100
    const p = Math.max(-100, Math.min(100, offsetPercent)) / 100;

    const r = parseInt(normalizedHex.slice(1, 3), 16);
    const g = parseInt(normalizedHex.slice(3, 5), 16);
    const b = parseInt(normalizedHex.slice(5, 7), 16);

    const adjustChannel = (channel: number): number => {
      if (p > 0) {
        // Осветление
        return Math.min(255, Math.floor(channel + (255 - channel) * p));
      } else if (p < 0) {
        // Затемнение
        return Math.max(0, Math.floor(channel * (1 + p)));
      }
      return channel; // Если p = 0, возвращаем исходное значение
    };

    const newR = adjustChannel(r);
    const newG = adjustChannel(g);
    const newB = adjustChannel(b);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const rotateHue = (hex: string, degrees: number): string => {
    const [h, s, l] = hexToHsl(hex);
    const newH = (h + degrees) % 360;
    return hslToHex(newH, s, l);
  };

  const adjustColorBrightness = (
    color: string,
    offsetPercent: number,
    fallback?: string,
  ): string => {
    const colorType = getColorType(color);

    // Если это CSS переменная
    if (colorType === 'css-var') {
      const varName = extractCssVariableName(color);
      const computedValue = getCssVariableValue(color, fallback);

      // Если получили реальное значение (не другую переменную), корректируем его
      if (computedValue && !isCssVariable(computedValue)) {
        // Проверяем, является ли оно HEX цветом
        if (isHexColor(computedValue)) {
          return adjustHexBrightness(computedValue, offsetPercent);
        }
      }

      // Возвращаем исходную переменную с fallback или без
      return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
    }

    // Если это HEX цвет
    if (colorType === 'hex') {
      return adjustHexBrightness(color, offsetPercent);
    }

    // Для других типов цветов возвращаем как есть
    console.warn(
      `Cannot adjust brightness for color type: ${colorType}. Returning original color.`,
    );
    return fallback || color;
  };

  const createGradient = (baseColor: string, options?: GradientOptions): string => {
    const {
      offsetPercent = 15,
      direction = 'to bottom',
      angle,
      fallbackColor = '#f5e477',
    } = options || {};

    // Определяем тип цвета
    const colorType = getColorType(baseColor);

    let colorValue: string;
    let adjustedColor: string;

    if (colorType === 'css-var') {
      // Для CSS переменных
      const varName = extractCssVariableName(baseColor);
      const computedValue = getCssVariableValue(baseColor, fallbackColor);

      // Если получили реальное значение
      if (computedValue && !isCssVariable(computedValue)) {
        colorValue = computedValue;
        adjustedColor = adjustHexBrightness(computedValue, offsetPercent);
      } else {
        // Используем CSS переменные напрямую
        colorValue = `var(${varName}, ${fallbackColor})`;
        adjustedColor = adjustHexBrightness(fallbackColor, offsetPercent);
      }
    } else if (colorType === 'hex') {
      // Для HEX цветов
      colorValue = normalizeHex(baseColor);
      adjustedColor = adjustHexBrightness(colorValue, offsetPercent);
    } else {
      // Для неизвестных типов используем fallback
      console.warn(`Unknown color type for ${baseColor}. Using fallback.`);
      colorValue = fallbackColor;
      adjustedColor = adjustHexBrightness(fallbackColor, offsetPercent);
    }

    // Всегда начинаем с измененного цвета и заканчиваем базовым
    const startColor = adjustedColor;
    const endColor = colorValue;

    // Если указан угол, используем его
    const gradientDirection = angle ? `${angle}deg` : direction;

    return `linear-gradient(${gradientDirection}, ${startColor}, ${endColor})`;
  };

  const gradientStyle = (baseColor: string, options?: GradientOptions) => {
    return computed(() => ({
      background: createGradient(baseColor, options),
      backgroundImage: createGradient(baseColor, options),
    }));
  };

  const createGradientWithCssVars = (
    baseColor: string,
    options?: GradientOptions,
  ): Record<string, string> => {
    const {
      offsetPercent = 15,
      direction = 'to bottom',
      angle,
      fallbackColor = '#f5e477',
    } = options || {};

    const colorType = getColorType(baseColor);
    let adjustedColor: string;
    let colorValue: string;

    if (colorType === 'css-var') {
      const varName = extractCssVariableName(baseColor);
      const computedValue = getCssVariableValue(baseColor, fallbackColor);

      colorValue = `var(${varName}, ${fallbackColor})`;

      if (computedValue && !isCssVariable(computedValue)) {
        adjustedColor = adjustHexBrightness(computedValue, offsetPercent);
      } else {
        adjustedColor = adjustHexBrightness(fallbackColor, offsetPercent);
      }
    } else if (colorType === 'hex') {
      colorValue = normalizeHex(baseColor);
      adjustedColor = adjustHexBrightness(baseColor, offsetPercent);
    } else {
      colorValue = fallbackColor;
      adjustedColor = adjustHexBrightness(fallbackColor, offsetPercent);
    }

    const gradientDirection = angle ? `${angle}deg` : direction;

    return {
      '--gradient-start': adjustedColor,
      '--gradient-end': colorValue,
      '--gradient-direction': gradientDirection,
      background: `linear-gradient(var(--gradient-direction), var(--gradient-start), var(--gradient-end))`,
    };
  };

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
    } = options || {};

    const colorType = getColorType(baseColor);
    let colorValue: string;

    if (colorType === 'css-var') {
      colorValue = getCssVariableValue(baseColor, fallbackColor);
      // Если получили другую переменную, используем fallback
      if (isCssVariable(colorValue)) {
        colorValue = fallbackColor;
      }
    } else if (colorType === 'hex') {
      colorValue = normalizeHex(baseColor);
    } else {
      colorValue = fallbackColor;
    }

    const colors: string[] = [];

    // Создаём цвета для каждого шага
    for (let i = 0; i < steps; i++) {
      // Распределяем offsetPercent между шагами
      const percent = offsetPercent * (1 - i / (steps - 1));
      const color = adjustHexBrightness(colorValue, percent);
      colors.push(color);
    }

    const gradientDirection = angle ? `${angle}deg` : direction;

    return `linear-gradient(${gradientDirection}, ${colors.join(', ')})`;
  };

  const processColorWithOpacity = (
    color: string,
    opacity?: number,
    fallbackColor: string = '#f5e477',
  ): string => {
    if (opacity === undefined || opacity === 1) {
      // Если opacity не указан или равен 1, возвращаем цвет как есть
      return color;
    }

    // Если opacity = 0, возвращаем transparent
    if (opacity === 0) {
      return 'transparent';
    }

    const colorType = getColorType(color);

    // Если это HEX цвет
    if (colorType === 'hex') {
      return hexToRgba(color, opacity);
    }

    // Если это CSS переменная
    if (colorType === 'css-var') {
      // Пытаемся получить значение переменной
      const computedValue = getCssVariableValue(color, fallbackColor);

      // Если получили HEX значение
      if (!isCssVariable(computedValue) && isHexColor(computedValue)) {
        return hexToRgba(computedValue, opacity);
      }

      // Если не смогли получить HEX, оставляем CSS переменную
      // Браузер сам обработает её
      return color;
    }

    // Если цвет уже в формате rgba
    const trimmedColor = color.trim().toLowerCase();

    if (trimmedColor.startsWith('rgba(')) {
      // Если уже rgba, обновляем alpha значение
      const rgbaMatch = trimmedColor.match(/rgba\(([^)]+)\)/);
      if (rgbaMatch && rgbaMatch[1]) {
        const parts = rgbaMatch[1].split(',').map(p => p.trim());
        if (parts.length === 4) {
          parts[3] = opacity.toString();
          return `rgba(${parts.join(', ')})`;
        }
      }
    } else if (trimmedColor.startsWith('rgb(')) {
      // Если rgb, конвертируем в rgba
      const rgbMatch = trimmedColor.match(/rgb\(([^)]+)\)/);
      if (rgbMatch && rgbMatch[1]) {
        return `rgba(${rgbMatch[1]}, ${opacity})`;
      }
    } else if (trimmedColor.startsWith('hsla(')) {
      // Если hsla, обновляем alpha значение
      const hslaMatch = trimmedColor.match(/hsla\(([^)]+)\)/);
      if (hslaMatch && hslaMatch[1]) {
        const parts = hslaMatch[1].split(',').map(p => p.trim());
        if (parts.length === 4) {
          parts[3] = opacity.toString();
          return `hsla(${parts.join(', ')})`;
        }
      }
    } else if (trimmedColor.startsWith('hsl(')) {
      // Если hsl, конвертируем в hsla
      const hslMatch = trimmedColor.match(/hsl\(([^)]+)\)/);
      if (hslMatch && hslMatch[1]) {
        return `hsla(${hslMatch[1]}, ${opacity})`;
      }
    }

    // Если не смогли обработать, возвращаем цвет как есть
    console.warn(`Cannot apply opacity to color: ${color}. Returning as is.`);
    return color;
  };

  const resolveColorForGradient = (
    color: string,
    fallbackColor: string = '#f5e477',
  ): string => {
    const colorType = getColorType(color);

    if (colorType === 'css-var') {
      // Для CSS переменных пытаемся получить значение
      const computedValue = getCssVariableValue(color, fallbackColor);

      // Если получили реальное значение (не другую переменную), используем его
      if (!isCssVariable(computedValue)) {
        // Рекурсивно обрабатываем полученное значение
        return resolveColorForGradient(computedValue, fallbackColor);
      }

      // Если получили другую переменную, оставляем как есть
      return computedValue;
    }

    // Для HEX цветов нормализуем
    if (colorType === 'hex') {
      return normalizeHex(color);
    }

    // Для остальных типов возвращаем как есть
    return color;
  };

  const createRadialGradient = (
    baseColor: string,
    options?: RadialGradientOptions,
  ): string => {
    const {
      offsetPercent = 15,
      shape = 'ellipse',
      size = 'farthest-corner',
      position = 'center',
      fallbackColor = '#f5e477',
      useCustomColors = false,
      colors: customColors,
      layers,
    } = options || {};

    // Если есть слои, создаем многослойный градиент
    if (layers && layers.length > 0) {
      const layerGradients = layers.map(layer => {
        const layerShape = layer.shape || shape;
        const layerSize =
          typeof layer.size === 'object'
            ? `${layer.size.width} ${layer.size.height}`
            : layer.size || size;
        const layerPosition = layer.position || position;

        const colorsStr = layer.colors
          .map(colorItem => {
            const resolvedColor = resolveColorForGradient(colorItem.color, fallbackColor);

            // Применяем opacity если нужно
            const finalColor =
              colorItem.opacity !== undefined && colorItem.opacity !== 1
                ? processColorWithOpacity(resolvedColor, colorItem.opacity, fallbackColor)
                : resolvedColor;

            return colorItem.position
              ? `${finalColor} ${colorItem.position}`
              : finalColor;
          })
          .join(', ');

        return `radial-gradient(${layerShape} ${layerSize} at ${layerPosition}, ${colorsStr})`;
      });

      return layerGradients.join(', ');
    }

    // Если указаны кастомные цвета
    if (useCustomColors && customColors && customColors.length > 0) {
      const colorsStr = customColors
        .map(colorItem => {
          // Разрешаем цвет (извлекаем значение CSS переменной если нужно)
          const resolvedColor = resolveColorForGradient(colorItem.color, fallbackColor);

          // Применяем opacity если нужно
          const finalColor =
            colorItem.opacity !== undefined && colorItem.opacity !== 1
              ? processColorWithOpacity(resolvedColor, colorItem.opacity, fallbackColor)
              : resolvedColor;

          return colorItem.position ? `${finalColor} ${colorItem.position}` : finalColor;
        })
        .join(', ');

      const sizeStr = typeof size === 'object' ? `${size.width} ${size.height}` : size;

      return `radial-gradient(${shape} ${sizeStr} at ${position}, ${colorsStr})`;
    }

    // Стандартное поведение (создание градиента из базового цвета)
    // Разрешаем базовый цвет (извлекаем значение CSS переменной если нужно)
    const resolvedBaseColor = resolveColorForGradient(baseColor, fallbackColor);

    // Получаем HEX значение для корректировки яркости
    let hexColorForAdjustment = resolvedBaseColor;
    if (!isHexColor(resolvedBaseColor)) {
      hexColorForAdjustment = fallbackColor;
    }

    const adjustedColor = adjustHexBrightness(hexColorForAdjustment, offsetPercent);

    const sizeStr = typeof size === 'object' ? `${size.width} ${size.height}` : size;

    // Правильный синтаксис radial-gradient: shape size at position, colors
    return `radial-gradient(${shape} ${sizeStr} at ${position}, ${adjustedColor}, ${resolvedBaseColor})`;
  };

  const createComplexRadialGradient = (config: {
    baseColor: string;
    layers: Array<{
      shape?: 'circle' | 'ellipse';
      size?: string | { width: string; height: string };
      position: string;
      colors: Array<{
        color: string;
        opacity?: number;
        position?: string;
      }>;
    }>;
    fallbackColor?: string;
  }): string => {
    const { layers, fallbackColor = '#f5e477' } = config;

    const gradients = layers.map(layer => {
      const shape = layer.shape || 'ellipse';
      const size =
        typeof layer.size === 'object'
          ? `${layer.size.width} ${layer.size.height}`
          : layer.size || 'farthest-corner';

      const colorsStr = layer.colors
        .map(colorItem => {
          const resolvedColor = resolveColorForGradient(colorItem.color, fallbackColor);
          let finalColor = resolvedColor;

          // Добавляем opacity если нужно
          if (colorItem.opacity !== undefined && colorItem.opacity !== 1) {
            finalColor = processColorWithOpacity(
              resolvedColor,
              colorItem.opacity,
              fallbackColor,
            );
          }

          return colorItem.position ? `${finalColor} ${colorItem.position}` : finalColor;
        })
        .join(', ');

      return `radial-gradient(${shape} ${size} at ${layer.position}, ${colorsStr})`;
    });

    return gradients.join(', ');
  };

  /**
   * Создает конический градиент
   */
  const createConicGradient = (
    baseColor: string,
    options?: ConicGradientOptions,
  ): string => {
    const {
      fromAngle = 0,
      position = '50% 50%',
      fallbackColor = '#f5e477',
      colors: customColors,
      hueRotation = false,
      steps = 8,
      offsetPercent = 20,
    } = options || {};

    // Если указаны кастомные цвета, используем их
    if (customColors && customColors.length > 0) {
      const colorsStr = customColors
        .map(colorItem => {
          const resolvedColor = resolveColorForGradient(colorItem.color, fallbackColor);
          let finalColor = resolvedColor;

          // Применяем opacity если нужно
          if (colorItem.opacity !== undefined && colorItem.opacity !== 1) {
            finalColor = processColorWithOpacity(
              resolvedColor,
              colorItem.opacity,
              fallbackColor,
            );
          }

          // Обрабатываем позицию
          let positionStr = '';
          if (colorItem.position !== undefined) {
            if (typeof colorItem.position === 'number') {
              // Если число, проверяем - если меньше 1, считаем процентом, иначе градусами
              if (colorItem.position < 1) {
                positionStr = ` ${colorItem.position * 100}%`;
              } else {
                positionStr = ` ${colorItem.position}deg`;
              }
            } else {
              positionStr = ` ${colorItem.position}`;
            }
          }

          return `${finalColor}${positionStr}`;
        })
        .join(', ');

      return `conic-gradient(from ${fromAngle}deg at ${position}, ${colorsStr})`;
    }

    // Автоматическая генерация градиента из базового цвета
    const resolvedBaseColor = resolveColorForGradient(baseColor, fallbackColor);
    let hexColorForAdjustment = resolvedBaseColor;

    if (!isHexColor(resolvedBaseColor)) {
      hexColorForAdjustment = fallbackColor;
    }

    const colors: string[] = [];

    if (hueRotation) {
      // Используем вращение оттенка
      for (let i = 0; i < steps; i++) {
        const degrees = (i * 360) / steps;
        const color = rotateHue(hexColorForAdjustment, degrees);
        const positionPercent = (i * 100) / steps;
        colors.push(`${color} ${positionPercent}%`);
      }
      // Замыкаем круг
      colors.push(`${rotateHue(hexColorForAdjustment, 0)} 100%`);
    } else {
      // Используем изменение яркости
      for (let i = 0; i < steps; i++) {
        const percent = offsetPercent * (1 - i / (steps - 1));
        const color = adjustHexBrightness(hexColorForAdjustment, percent);
        const positionPercent = (i * 100) / steps;
        colors.push(`${color} ${positionPercent}%`);
      }
      // Замыкаем круг
      colors.push(`${adjustHexBrightness(hexColorForAdjustment, 0)} 100%`);
    }

    return `conic-gradient(from ${fromAngle}deg at ${position}, ${colors.join(', ')})`;
  };

  /**
   * Создает рейнбоу (радужный) конический градиент
   */
  const createRainbowConicGradient = (options?: {
    fromAngle?: number;
    position?: string;
    saturation?: number; // 0-100
    lightness?: number; // 0-100
    steps?: number;
  }): string => {
    const {
      fromAngle = 0,
      position = '50% 50%',
      saturation = 80,
      lightness = 60,
      steps = 12,
    } = options || {};

    const colors: string[] = [];
    const stepSize = 360 / steps;

    for (let i = 0; i <= steps; i++) {
      const hue = (i * stepSize) % 360;
      const color = hslToHex(hue, saturation, lightness);
      const positionPercent = (i * 100) / steps;
      colors.push(`${color} ${positionPercent}%`);
    }

    return `conic-gradient(from ${fromAngle}deg at ${position}, ${colors.join(', ')})`;
  };

  /**
   * Создает симметричный конический градиент
   */
  const createSymmetricConicGradient = (
    baseColor: string,
    options?: Omit<ConicGradientOptions, 'colors'> & {
      symmetry?: 'mirror' | 'repeat' | 'alternate';
    },
  ): string => {
    const {
      fromAngle = 0,
      position = '50% 50%',
      fallbackColor = '#f5e477',
      hueRotation = false,
      steps = 6,
      offsetPercent = 30,
      symmetry = 'mirror',
    } = options || {};

    const resolvedBaseColor = resolveColorForGradient(baseColor, fallbackColor);
    let hexColorForAdjustment = resolvedBaseColor;

    if (!isHexColor(resolvedBaseColor)) {
      hexColorForAdjustment = fallbackColor;
    }

    const colors: string[] = [];
    const halfSteps = Math.floor(steps / 2);

    // Создаем цвета для первой половины
    const firstHalfColors: string[] = [];
    for (let i = 0; i < halfSteps; i++) {
      let color: string;
      if (hueRotation) {
        const degrees = (i * 180) / halfSteps;
        color = rotateHue(hexColorForAdjustment, degrees);
      } else {
        const percent = offsetPercent * (1 - i / (halfSteps - 1));
        color = adjustHexBrightness(hexColorForAdjustment, percent);
      }
      const positionPercent = (i * 50) / halfSteps;
      firstHalfColors.push(color);
      colors.push(`${color} ${positionPercent}%`);
    }

    // Добавляем средний цвет
    const middleColor = hueRotation
      ? rotateHue(hexColorForAdjustment, 180)
      : adjustHexBrightness(hexColorForAdjustment, -offsetPercent);

    colors.push(`${middleColor} 50%`);

    // Добавляем вторую половину в зависимости от типа симметрии
    for (let i = 0; i < halfSteps; i++) {
      let color: string | undefined;
      const index = symmetry === 'alternate' ? halfSteps - 1 - i : i;

      if (symmetry === 'mirror') {
        color = firstHalfColors[halfSteps - 1 - i];
      } else if (symmetry === 'alternate') {
        if (hueRotation) {
          const degrees = 180 + (index * 180) / halfSteps;
          color = rotateHue(hexColorForAdjustment, degrees);
        } else {
          const percent = -offsetPercent * (index / (halfSteps - 1));
          color = adjustHexBrightness(hexColorForAdjustment, percent);
        }
      } else {
        // repeat
        color = firstHalfColors[i];
      }

      const positionPercent = 50 + ((i + 1) * 50) / halfSteps;
      colors.push(`${color} ${positionPercent}%`);
    }

    return `conic-gradient(from ${fromAngle}deg at ${position}, ${colors.join(', ')})`;
  };

  /**
   * Создает многослойный конический градиент
   */
  const createMultiLayerConicGradient = (
    layers: Array<{
      colors: Array<{
        color: string;
        opacity?: number;
        position?: string | number;
      }>;
      fromAngle?: number;
      position?: string;
      fallbackColor?: string;
    }>,
  ): string => {
    const gradients = layers.map(layer => {
      const {
        colors,
        fromAngle = 0,
        position = '50% 50%',
        fallbackColor = '#f5e477',
      } = layer;

      const colorsStr = colors
        .map(colorItem => {
          const resolvedColor = resolveColorForGradient(colorItem.color, fallbackColor);
          let finalColor = resolvedColor;

          // Применяем opacity если нужно
          if (colorItem.opacity !== undefined && colorItem.opacity !== 1) {
            finalColor = processColorWithOpacity(
              resolvedColor,
              colorItem.opacity,
              fallbackColor,
            );
          }

          // Обрабатываем позицию
          let positionStr = '';
          if (colorItem.position !== undefined) {
            if (typeof colorItem.position === 'number') {
              positionStr =
                colorItem.position < 1
                  ? ` ${colorItem.position * 100}%`
                  : ` ${colorItem.position}deg`;
            } else {
              positionStr = ` ${colorItem.position}`;
            }
          }

          return `${finalColor}${positionStr}`;
        })
        .join(', ');

      return `conic-gradient(from ${fromAngle}deg at ${position}, ${colorsStr})`;
    });

    return gradients.join(', ');
  };

  const lightenHex = (hex: string, percent: number): string => {
    return adjustHexBrightness(hex, Math.abs(percent));
  };

  const darkenHex = (hex: string, percent: number): string => {
    return adjustHexBrightness(hex, -Math.abs(percent));
  };

  return {
    createGradient,
    gradientStyle,

    createGradientWithCssVars,

    getColorType,
    isCssVariable,
    isHexColor,
    isRgbColor,
    isHslColor,
    extractCssVariableName,
    getCssVariableValue,

    createMultiStepGradient,
    createRadialGradient,
    createComplexRadialGradient,

    createConicGradient,
    createRainbowConicGradient,
    createSymmetricConicGradient,
    createMultiLayerConicGradient,

    adjustHexBrightness,
    adjustColorBrightness,
    rotateHue,
    normalizeHex,
    hexToRgb,
    hexToRgba,
    hexToHsl,
    hslToHex,
    processColorWithOpacity,
    resolveColorForGradient,

    lightenHex,
    darkenHex,

    // Утилиты для CSS custom properties
    gradientCssVar: (baseColor: string, options?: GradientOptions) => {
      const gradient = createGradient(baseColor, options);
      return {
        '--gradient-bg': gradient,
        background: `var(--gradient-bg)`,
      };
    },
  };
}
