import {
  ICON_DIMENSIONS,
  ORBIT_ICON_SIZE,
  DETAILED_ICON_SIZE,
  MOBILE_ICON_SIZE_CONFIG,
  MOBILE_DETAIL_SCALE_CONFIG,
  DETAIL_ICON_RATIO_IN_CIRCLE,
  CLOSE_BUTTON_RATIO_OF_DIAMETER,
  CLOSE_BUTTON_MIN_SIZE,
  CLOSE_BUTTON_MAX_SIZE,
  DETAIL_FONT_RATIO_OF_DIAMETER,
  DETAIL_LINE_HEIGHT_MULTIPLIER,
  DETAIL_LINE_HEIGHT_MULTIPLIER_MOBILE,
  DETAIL_TEXT_SPACING_MULTIPLIER,
  DETAIL_TEXT_SPACING_MULTIPLIER_DESKTOP,
  DETAIL_FONT_MIN_SIZE,
  DETAIL_FONT_MAX_SIZE,
  CLOSE_BUTTON_CROSS_SIZE_RATIO,
  CLOSE_BUTTON_CROSS_LINE_WIDTH_RATIO,
  DETAIL_TEXT_SIDE_PADDING_RATIO,
  ENABLE_TECH_DEBUG,
} from './constants';
import { iconPaths } from './icon-imports';

import type { TechItem } from './types';

// Lightweight gated logger for use-tech composable
export const techDebug = (...args: unknown[]) => {
  if (import.meta.env.DEV && ENABLE_TECH_DEBUG) {
    console.log('[use-tech]', ...args);
  }
};

export const techWarn = (...args: unknown[]) => {
  if (import.meta.env.DEV && ENABLE_TECH_DEBUG) {
    console.warn('[use-tech]', ...args);
  }
};

export const techError = (...args: unknown[]) => {
  // Always surface errors in dev; minimize noise in prod

  console.error('[use-tech]', ...args);
};

export function getImagePath(iconName: string): string {
  const path = iconPaths[iconName];

  if (path) {
    return path;
  }

  // Фоллбэк для неизвестных иконок
  techWarn(`Icon not found: ${iconName}`);
  return iconPaths.git || ''; // возвращаем какую-то существующую иконку как fallback
}

export function createFallbackImage(iconName: string): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconName.toUpperCase().substring(0, 4), 32, 32);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

// Removed unused dimension helpers (calculateScaleFactor/calculateIconDimensions)

export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function isPointInRect(
  x: number,
  y: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
): boolean {
  return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 3,
): string[] {
  const words = (text ?? '').split(' ');
  const lines: string[] = [];
  let currentLine: string = words[0] ?? '';

  for (let i = 1; i < words.length; i++) {
    const testLine = `${currentLine} ${words[i]}`;
    const metrics = ctx.measureText(testLine);

    if (metrics.width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (lines.length < maxLines - 1) {
        lines.push(currentLine);
        currentLine = words[i] ?? '';
      } else {
        // Для последней строки добавляем многоточие
        let truncated = `${currentLine}...`;
        while (ctx.measureText(truncated).width > maxWidth && currentLine.length > 1) {
          currentLine = currentLine.slice(0, -1);
          truncated = `${currentLine}...`;
        }
        currentLine = truncated;
        break;
      }
    }
  }

  lines.push(currentLine);
  return lines;
}

export function calculateIconDimensionsForState(
  iconName: string,
  state: TechItem['state'] = 'path',
  trajectoryMode: 'infinity' | 'circle' = 'infinity',
  containerWidth: number = 0,
): { width: number; height: number } {
  const dims = ICON_DIMENSIONS[iconName] || { width: 89, height: 89 };

  let targetSize = state === 'detailed' ? DETAILED_ICON_SIZE : ORBIT_ICON_SIZE;

  // На мобиле (режим circle) иконки на орбите размер зависит от ширины контейнера
  if (state === 'path' && trajectoryMode === 'circle' && containerWidth > 0) {
    if (containerWidth < MOBILE_ICON_SIZE_CONFIG.breakpoint1) {
      targetSize = containerWidth * MOBILE_ICON_SIZE_CONFIG.smallScreen;
    } else if (containerWidth < MOBILE_ICON_SIZE_CONFIG.breakpoint2) {
      targetSize = containerWidth * MOBILE_ICON_SIZE_CONFIG.mediumScreen;
    } else {
      targetSize = containerWidth * MOBILE_ICON_SIZE_CONFIG.largeScreen;
    }
  } else if (state === 'path' && trajectoryMode === 'circle') {
    // Fallback if containerWidth is 0
    targetSize = ORBIT_ICON_SIZE * 0.45;
  }

  const scaleFactor = Math.min(targetSize / dims.width, targetSize / dims.height);

  return {
    width: dims.width * scaleFactor,
    height: dims.height * scaleFactor,
  };
}

// Размеры детализированной иконки для мобильного режима: вписываем в круг
export function calculateDetailedIconDimensionsForCircle(
  iconName: string,
  endDiameter: number,
): { width: number; height: number } {
  const dims = ICON_DIMENSIONS[iconName] || { width: 89, height: 89 };
  const targetSize = Math.max(0, endDiameter * DETAIL_ICON_RATIO_IN_CIRCLE);
  const scaleFactor = Math.min(targetSize / dims.width, targetSize / dims.height);
  return {
    width: dims.width * scaleFactor,
    height: dims.height * scaleFactor,
  };
}

// Адаптивный размер кнопки закрытия
export function calculateCloseButtonSize(endDiameter: number): number {
  const raw = endDiameter * CLOSE_BUTTON_RATIO_OF_DIAMETER;
  return Math.max(CLOSE_BUTTON_MIN_SIZE, Math.min(CLOSE_BUTTON_MAX_SIZE, raw));
}

// Адаптивная типографика для описания в центре
export function calculateDetailTypography(endDiameter: number): {
  fontSize: number;
  lineHeight: number;
  spacing: number;
} {
  const baseFont = endDiameter * DETAIL_FONT_RATIO_OF_DIAMETER;
  const fontSize = Math.max(
    DETAIL_FONT_MIN_SIZE,
    Math.min(DETAIL_FONT_MAX_SIZE, baseFont),
  );
  const lineHeightMultiplier =
    endDiameter <= 240
      ? DETAIL_LINE_HEIGHT_MULTIPLIER_MOBILE
      : DETAIL_LINE_HEIGHT_MULTIPLIER;
  const lineHeight = Math.round(fontSize * lineHeightMultiplier);
  const spacingMultiplier =
    endDiameter >= 320
      ? DETAIL_TEXT_SPACING_MULTIPLIER_DESKTOP
      : DETAIL_TEXT_SPACING_MULTIPLIER;
  const spacing = Math.round(fontSize * spacingMultiplier);
  return { fontSize, lineHeight, spacing };
}

// Диаметр детального круга с учетом мобильного масштаба
export function calculateDetailEndDiameter(
  trajectoryMode: 'infinity' | 'circle',
  containerWidth: number,
  baseDiameter: number,
): number {
  if (trajectoryMode !== 'circle' || containerWidth <= 0) {
    return baseDiameter;
  }

  const { breakpoint1, breakpoint2, smallScale, mediumScale, largeScale } =
    MOBILE_DETAIL_SCALE_CONFIG;

  let scale: number = largeScale;
  if (containerWidth < breakpoint1) {
    scale = smallScale;
  } else if (containerWidth < breakpoint2) {
    scale = mediumScale;
  }

  return baseDiameter * scale;
}

// Генерация случайного цвета для частиц
export function generateRandomParticleColor(): string {
  // Палитра ярких, приятных цветов для частиц
  const colors = [
    'rgba(100, 150, 255, 0.8)', // синий
    'rgba(255, 100, 150, 0.8)', // розовый
    'rgba(150, 255, 100, 0.8)', // зеленый
    'rgba(255, 200, 100, 0.8)', // оранжевый
    'rgba(200, 100, 255, 0.8)', // фиолетовый
    'rgba(100, 255, 200, 0.8)', // бирюзовый
    'rgba(255, 255, 100, 0.8)', // желтый
    'rgba(255, 100, 200, 0.8)', // пурпурный
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex] || 'rgba(100, 150, 255, 0.8)';
}

// Кэш растрированных изображений частиц
const particleImageCache = new Map<string, HTMLCanvasElement>();

// Создание растрового изображения частицы (выполняется один раз для каждого цвета)
export function createParticleRaster(color: string, size: number): HTMLCanvasElement {
  const cacheKey = `${color}-${size}`;

  // Проверяем кэш
  if (particleImageCache.has(cacheKey)) {
    return particleImageCache.get(cacheKey)!;
  }

  // Создаем offscreen canvas с отступами для свечения
  const padding = size * 3;
  const canvasSize = size * 2.4 + padding * 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;

  // Рисуем частицу с свечением
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Дополнительное яркое ядро
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Сохраняем в кэш
  particleImageCache.set(cacheKey, canvas);

  return canvas;
}

// Очистка кэша (если нужно освободить память)
export function clearParticleCache(): void {
  particleImageCache.clear();
}

// Кэш растрированных логотипов
const logoRasterCache = new Map<string, HTMLCanvasElement>();

// Кэш растрированных круглых подложек
const circleBackgroundCache = new Map<string, HTMLCanvasElement>();

// Кэш растрированных кнопок закрытия
const closeButtonCache = new Map<string, HTMLCanvasElement>();

// Кэш растрированных заголовков сцены
const sceneTitleCache = new Map<string, HTMLCanvasElement>();

// Растеризация заголовка сцены
export function rasterizeSceneTitle(
  text: string,
  fontSize: number,
  fontWeight: string,
  fontFamily: string,
  maxWidth: number | undefined,
  gradient: ReadonlyArray<{ offset: number; color: string }> | undefined,
  fallbackColor: string,
): HTMLCanvasElement {
  // Получаем devicePixelRatio для качественного рендеринга
  const dpr = window.devicePixelRatio || 1;

  // Дополнительный scale factor для supersampling (как с иконками)
  const supersampleScale = 2;
  const totalScale = dpr * supersampleScale;

  // Формируем ключ кеша с учётом всех параметров, DPR и supersampling
  const cacheKey = `title-${text}-${fontSize}-${maxWidth ?? 'full'}-${fontWeight}-${gradient ? 'grad' : 'solid'}-dpr${dpr}-ss${supersampleScale}`;

  // Проверяем кэш
  if (sceneTitleCache.has(cacheKey)) {
    return sceneTitleCache.get(cacheKey)!;
  }

  // Создаем временный контекст для измерения (без масштабирования)
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return tempCanvas;

  tempCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  tempCtx.textAlign = 'center';
  tempCtx.textBaseline = 'middle';

  // Разбиваем текст на строки
  const lineHeight = Math.round(fontSize * 1.2);
  const lines = maxWidth ? wrapText(tempCtx, text, maxWidth, 3) : [text];
  const blockHeight = lines.length * lineHeight;

  // Измеряем максимальную ширину строк
  let maxLineWidth = 0;
  lines.forEach(line => {
    const { width } = tempCtx.measureText(line);
    if (width > maxLineWidth) maxLineWidth = width;
  });

  // Создаем canvas с запасом для градиента и сглаживания
  const padding = 4;
  const logicalWidth = Math.ceil(maxLineWidth) + padding * 2;
  const logicalHeight = Math.ceil(blockHeight) + padding * 2;

  // Создаём canvas с увеличенным разрешением (DPR + supersampling)
  const canvas = document.createElement('canvas');
  canvas.width = logicalWidth * totalScale;
  canvas.height = logicalHeight * totalScale;
  // CSS размеры остаются логическими
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Масштабируем контекст для учёта DPR и supersampling
  ctx.setTransform(totalScale, 0, 0, totalScale, 0, 0);

  // Настройка текста с масштабированными параметрами
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = logicalWidth / 2;
  const blockCenterY = logicalHeight / 2;
  const blockTopY = blockCenterY - blockHeight / 2;
  const blockBottomY = blockCenterY + blockHeight / 2;

  // Применяем градиент или сплошной цвет
  if (gradient && gradient.length > 0) {
    const grad = ctx.createLinearGradient(centerX, blockTopY, centerX, blockBottomY);
    gradient.forEach(stop => grad.addColorStop(stop.offset, stop.color));
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = fallbackColor;
  }

  // Рисуем все строки
  lines.forEach((line, i) => {
    const offsetFromCenter = (i - (lines.length - 1) / 2) * lineHeight;
    const lineY = blockCenterY + offsetFromCenter;
    ctx.fillText(line, centerX, lineY);
  });

  // Сохраняем в кэш
  sceneTitleCache.set(cacheKey, canvas);

  return canvas;
}

// Очистка кэша заголовков (вызывать при смене локали или значительном изменении размера)
export function clearSceneTitleCache(): void {
  sceneTitleCache.clear();
}

// Растеризация кнопки закрытия
export function rasterizeCloseButton(
  buttonSize: number,
  isHovered: boolean,
): HTMLCanvasElement {
  const cacheKey = `close-button-${buttonSize}-${isHovered ? 'hover' : 'normal'}`;

  // Проверяем кэш
  if (closeButtonCache.has(cacheKey)) {
    return closeButtonCache.get(cacheKey)!;
  }

  // Создаем canvas с запасом для тени
  const shadowPadding = 10;
  const canvasSize = buttonSize + shadowPadding * 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Центр кнопки на canvas
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  const radius = buttonSize / 2;

  // Цвета для кнопки
  const red = '#e53935';
  const baseFill = isHovered ? red : 'rgba(255, 255, 255, 1)';
  const crossColor = isHovered ? '#ffffff' : red;
  const borderColor = red;

  // Фон кнопки
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = baseFill;
  ctx.fill();

  // Бордюр кнопки (масштабируем толщину относительно размера)
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = Math.max(
    1,
    Math.round(buttonSize * CLOSE_BUTTON_CROSS_LINE_WIDTH_RATIO),
  );
  ctx.stroke();

  // Тень
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  // Крестик (масштабируем размер и толщину линий)
  ctx.strokeStyle = crossColor;
  ctx.lineWidth = Math.max(
    1,
    Math.round(buttonSize * CLOSE_BUTTON_CROSS_LINE_WIDTH_RATIO),
  );
  ctx.lineCap = 'round';

  const crossSize = Math.round(buttonSize * CLOSE_BUTTON_CROSS_SIZE_RATIO);
  ctx.beginPath();
  ctx.moveTo(centerX - crossSize, centerY - crossSize);
  ctx.lineTo(centerX + crossSize, centerY + crossSize);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX + crossSize, centerY - crossSize);
  ctx.lineTo(centerX - crossSize, centerY + crossSize);
  ctx.stroke();

  // Сохраняем в кэш
  closeButtonCache.set(cacheKey, canvas);

  return canvas;
}

// Очистка кэша кнопок закрытия
export function clearCloseButtonCache(): void {
  closeButtonCache.clear();
}

// Растеризация круглой подложки для детального элемента
export function rasterizeCircleBackground(diameter: number): HTMLCanvasElement {
  const cacheKey = `circle-${diameter}`;

  // Проверяем кэш
  if (circleBackgroundCache.has(cacheKey)) {
    return circleBackgroundCache.get(cacheKey)!;
  }

  // Создаем canvas с запасом для тени
  const padding = 12 + 3 + 10; // shadowBlur + shadowOffsetY + запас
  const canvasSize = diameter + padding * 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Центр круга на canvas
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  const radius = diameter / 2;

  // Настройка тени (постоянные значения)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;

  // Рисуем круг с белым фоном
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Сбрасываем тень перед рисованием обводки
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Рисуем красную обводку
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.lineWidth = 2; // Максимальная толщина обводки
  ctx.strokeStyle = 'rgba(229, 57, 53, 1)'; // Красный цвет
  ctx.stroke();

  // Сохраняем в кэш
  circleBackgroundCache.set(cacheKey, canvas);

  return canvas;
}

// Адаптивные боковые отступы текстового блока (в пикселях), зависят от диаметра круга
export function calculateDetailSidePadding(endDiameter: number): number {
  return Math.round(endDiameter * DETAIL_TEXT_SIDE_PADDING_RATIO);
}

// Очистка кэша круглых подложек
export function clearCircleBackgroundCache(): void {
  circleBackgroundCache.clear();
}

// Растеризация логотипа в высококачественный спрайт для HiDPI экранов
export function rasterizeIconImage(
  sourceImage: HTMLImageElement,
  iconName: string,
  targetHeight: number = 200,
): HTMLCanvasElement {
  const cacheKey = `${iconName}-${targetHeight}`;

  // Проверяем кэш
  if (logoRasterCache.has(cacheKey)) {
    return logoRasterCache.get(cacheKey)!;
  }

  // Получаем оригинальные размеры или из справочника
  const iconDims = ICON_DIMENSIONS[iconName] || { width: 89, height: 89 };
  const aspectRatio = iconDims.width / iconDims.height;

  // Вычисляем размеры для растра
  const rasterHeight = targetHeight;
  const rasterWidth = Math.round(rasterHeight * aspectRatio);

  // Создаем offscreen canvas с высоким разрешением
  const canvas = document.createElement('canvas');
  canvas.width = rasterWidth;
  canvas.height = rasterHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Включаем сглаживание для качественной отрисовки
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Рисуем исходное изображение в высоком разрешении
  ctx.drawImage(sourceImage, 0, 0, rasterWidth, rasterHeight);

  // Сохраняем в кэш
  logoRasterCache.set(cacheKey, canvas);

  return canvas;
}

// Очистка кэша растрированных логотипов
export function clearLogoCache(): void {
  logoRasterCache.clear();
}
