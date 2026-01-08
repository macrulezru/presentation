import {
  ITEM_WIDTH,
  ITEM_HEIGHT,
  DETAIL_ITEM_WIDTH,
  DETAIL_ITEM_HEIGHT,
  COLORS,
  TECH_CIRCLE_TEXT_COLOR,
} from './constants';
import { calculateInfinityPoint, positionToParameter } from './infinity-math';
import {
  calculateIconDimensionsForState,
  wrapText,
  lerp,
  createParticleRaster,
  rasterizeCircleBackground,
  rasterizeCloseButton,
  calculateDetailEndDiameter,
  calculateDetailedIconDimensionsForCircle,
  calculateCloseButtonSize,
  calculateDetailTypography,
  calculateDetailSidePadding,
} from './utils';

import type { TechItem, Particle } from './types';

// Рисование траектории в виде знака бесконечности
export function drawInfinityPath(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  color: string = COLORS.orbit,
  mode: 'infinity' | 'circle' = 'infinity',
) {
  ctx.save();
  ctx.beginPath();

  if (mode === 'circle') {
    // Рисуем простую окружность
    ctx.arc(centerX, centerY, scale, 0, Math.PI * 2);
  } else {
    // Рисуем траекторию бесконечности по точкам
    const steps = 200; // количество точек для плавной кривой
    for (let i = 0; i <= steps; i++) {
      const position = i / steps;
      const t = positionToParameter(position);
      const point = calculateInfinityPoint(t, scale, centerX, centerY);

      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.globalAlpha = 0.1;
  ctx.stroke();
  ctx.restore();
}

// Оверлей стеклянной сферы: клип окружности и отрисовка масштабированного offscreen-буфера для имитации преломления
// Рисование орбиты (эллипса) - оставлено для обратной совместимости, но не используется
export function drawOrbitEllipse(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  color: string = COLORS.orbit,
) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY,
    radiusX,
    radiusY,
    0, // Вращение эллипса
    0, // Начальный угол
    Math.PI * 2, // Конечный угол
  );

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.globalAlpha = 0.1;
  ctx.stroke();
  ctx.restore();
}

// Рисование иконки на траектории (без фона)
export function drawPathIcon(
  ctx: CanvasRenderingContext2D,
  item: TechItem,
  isHovered: boolean,
  _centerX?: number,
  _centerY?: number,
) {
  ctx.save();

  // Позиция иконки
  const drawX = item.x;
  const drawY = item.y;

  ctx.translate(drawX, drawY);

  // Комбинированный масштаб: hover эффект + эффект глубины
  const targetHoverScale = isHovered ? 1.15 : 1;
  item.hoverScale = item.hoverScale + (targetHoverScale - item.hoverScale) * 0.1;

  // Применяем оба масштаба
  const finalScale = item.hoverScale * item.depthScale;
  ctx.scale(finalScale, finalScale);

  // Применяем прозрачность для эффекта глубины
  ctx.globalAlpha = item.depthOpacity;

  // Формируем строку фильтров для эффектов глубины
  const filters: string[] = [];

  // Применяем размытие для эффекта глубины
  if (item.depthBlur > 0) {
    filters.push(`blur(${item.depthBlur}px)`);
  }

  // Применяем насыщенность для эффекта глубины (передний план)
  if (item.depthSaturation !== 1) {
    filters.push(`saturate(${item.depthSaturation})`);
  }

  if (filters.length > 0) {
    ctx.filter = filters.join(' ');
  }

  // Иконка без фона и тени
  if (item.image && item.image.complete) {
    // Используем размеры из item (которые обновляются в updateIconSizes)
    const dims = { width: item.width, height: item.height };

    // Используем hoverRotation для плавной интерполяции поворота
    if (item.hoverRotation > 0) {
      ctx.save();
      // Плавный поворот и смещение пропорционально hoverRotation (0-1)
      ctx.translate(0, -2 * item.hoverRotation);
      ctx.rotate(0.087 * item.hoverRotation); // 5 градусов * прогресс
    }

    // Рисуем саму иконку
    ctx.drawImage(item.image, -dims.width / 2, -dims.height / 2, dims.width, dims.height);

    if (item.hoverRotation > 0) {
      ctx.restore();
    }
  }

  ctx.restore();
}

// Старое название функции для обратной совместимости
export const drawOrbitIcon = drawPathIcon;

// Рисование кнопки закрытия
export function drawCloseButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isHovered: boolean,
  progress: number = 1, // Прогресс анимации (0-1)
  size: number,
) {
  ctx.save();
  ctx.translate(x, y);

  // Анимируем размер кнопки с ускорением появления
  const animatedScale = progress * progress; // квадратичная кривая для более плавного появления
  ctx.scale(animatedScale, animatedScale);

  // Получаем растрированную кнопку из кэша (в высоком разрешении)
  const buttonSprite = rasterizeCloseButton(size, isHovered);

  // Вычисляем размер для отрисовки (компенсируем UI_RASTER_SCALE)
  const displayWidth = buttonSprite.width / 3; // делим на UI_RASTER_SCALE
  const displayHeight = buttonSprite.height / 3;
  const spriteX = -displayWidth / 2;
  const spriteY = -displayHeight / 2;

  // Рисуем растрированную кнопку с масштабированием для четкости
  ctx.drawImage(buttonSprite, spriteX, spriteY, displayWidth, displayHeight);

  ctx.restore();
}

// Рисование детализированного элемента
export function drawDetailedItem(
  ctx: CanvasRenderingContext2D,
  item: TechItem,
  _isHovered: boolean,
  centerX: number,
  centerY: number,
  closeButtonHover: boolean,
  _backgroundBlur?: number,
  trajectoryMode?: 'infinity' | 'circle',
  containerWidth?: number,
) {
  // Интерполируем прогресс детализации
  const progress = item.detailProgress;

  // Рассчитываем диаметр окружности (используем минимальную из размеров для симметрии)
  const startDiameter = Math.min(ITEM_WIDTH, ITEM_HEIGHT);
  const baseEndDiameter = Math.min(DETAIL_ITEM_WIDTH, DETAIL_ITEM_HEIGHT);
  const endDiameter = calculateDetailEndDiameter(
    trajectoryMode ?? 'infinity',
    containerWidth ?? 0,
    baseEndDiameter,
  );
  const diameter = lerp(startDiameter, endDiameter, progress);
  const radius = diameter / 2;

  // === ГРУППА 1: Фон и кнопка закрытия (остаются в центре) ===
  ctx.save();
  ctx.translate(centerX, centerY);

  // Фон элемента (только если есть прогресс)
  if (progress > 0) {
    // Получаем растрированный спрайт круга с тенью и обводкой (в высоком разрешении)
    const circleSprite = rasterizeCircleBackground(diameter);

    // Вычисляем размер для отрисовки (компенсируем UI_RASTER_SCALE)
    const displayWidth = circleSprite.width / 3; // делим на UI_RASTER_SCALE
    const displayHeight = circleSprite.height / 3;
    const spriteX = -displayWidth / 2;
    const spriteY = -displayHeight / 2;

    // Применяем анимацию прозрачности: плавно от 0 до 1
    ctx.globalAlpha = progress;

    // Рисуем растрированный круг с масштабированием для четкости
    ctx.drawImage(circleSprite, spriteX, spriteY, displayWidth, displayHeight);

    // Восстанавливаем прозрачность
    ctx.globalAlpha = 1.0;
  }

  // Рисуем кнопку закрытия для детализированного элемента (в центре)
  if (progress > 0.5) {
    // Центр кнопки должен лежать точно на окружности основного круга
    const angle = -35 * (Math.PI / 180); // -35° в радианах — правый верхний сектор
    const closeButtonX = radius * Math.cos(angle);
    const closeButtonY = radius * Math.sin(angle);
    // Передаём прогресс для анимации кнопки (начинается с progress 0.5)
    const buttonProgress = (progress - 0.5) * 2; // Нормализуем к 0-1 для 0.5-1 диапазона
    const buttonSize = calculateCloseButtonSize(endDiameter);
    drawCloseButton(
      ctx,
      closeButtonX,
      closeButtonY,
      closeButtonHover,
      buttonProgress,
      buttonSize,
    );
  }

  ctx.restore();

  // === ГРУППА 2: Иконка (движется к центру) ===
  ctx.save();

  // Используем текущую позицию элемента (которая интерполируется к центру)
  const drawX = item.x;
  const drawY = item.y;
  ctx.translate(drawX, drawY);

  // Применяем глубинные эффекты (размытие/насыщенность/прозрачность) к иконке
  const filters: string[] = [];
  if (item.depthBlur > 0) {
    filters.push(`blur(${item.depthBlur}px)`);
  }
  if (item.depthSaturation !== 1) {
    filters.push(`saturate(${item.depthSaturation})`);
  }
  if (filters.length > 0) {
    ctx.filter = filters.join(' ');
  }

  // Применяем прозрачность глубины
  ctx.globalAlpha = item.depthOpacity ?? 1;

  // Общие вычисления для текста/иконки
  const { fontSize, lineHeight, spacing } = calculateDetailTypography(endDiameter);
  const sidePadding = calculateDetailSidePadding(endDiameter);

  // Рассчитываем размеры иконки с интерполяцией
  // Для 'path' используем размеры из item (которые обновляются в updateIconSizes)
  const pathDims = { width: item.width, height: item.height };
  const detailedDims =
    trajectoryMode === 'circle' && endDiameter > 0
      ? calculateDetailedIconDimensionsForCircle(item.icon, endDiameter)
      : calculateIconDimensionsForState(item.icon, 'detailed');

  // Базовый интерполированный размер
  let iconWidth = lerp(pathDims.width, detailedDims.width, progress);
  let iconHeight = lerp(pathDims.height, detailedDims.height, progress);

  // Применяем depthScale для плавного перехода к размеру на траектории
  // При progress близком к 0, depthScale будет влиять на финальный размер
  iconWidth *= item.depthScale;
  iconHeight *= item.depthScale;

  // Заранее рассчитываем высоту текстового блока для финального размера (для позиционирования)
  const maxTextWidth = endDiameter - 2 * sidePadding;
  const tempCtx = ctx; // используем текущий контекст для измерения
  tempCtx.font = `300 ${fontSize}px 'Roboto', system-ui, sans-serif`;
  const lines = wrapText(tempCtx, item.description, maxTextWidth);
  const textBlockHeight = lines.length * lineHeight;

  // Рассчитываем общую высоту контента (финальная иконка + отступ + текст)
  const totalContentHeight = detailedDims.height + spacing + textBlockHeight;

  // Позиция иконки: интерполируем от 0 (на траектории) до центрированной позиции
  const targetIconY = -totalContentHeight / 2; // Финальная позиция в центре
  const iconY = lerp(-iconHeight / 2, targetIconY, progress); // Плавный переход

  // Рисуем иконку с интерполированным размером на финальной позиции
  if (item.image && item.image.complete) {
    // Применяем hover-эффект только пока элемент не полностью детализирован
    const hoverFactor = item.hoverRotation * (1 - Math.min(progress, 0.95));
    if (hoverFactor > 0) {
      ctx.save();
      ctx.translate(0, -2 * hoverFactor);
      ctx.rotate(0.087 * hoverFactor);
    }

    ctx.drawImage(item.image, -iconWidth / 2, iconY, iconWidth, iconHeight);

    if (hoverFactor > 0) {
      ctx.restore();
    }
  }

  ctx.restore();

  // === ГРУППА 3: Текстовое описание (отдельный слой, привязан к центру) ===
  ctx.save();
  ctx.translate(centerX, centerY);

  // Прогресс появления текста: начинаем после 40% пути к центру
  const textProgress = Math.max(0, Math.min(1, (progress - 0.4) / 0.4));

  if (textProgress > 0) {
    // Используем уже рассчитанные финальные размеры (из Группы 2)
    const detailedDims =
      trajectoryMode === 'circle' && endDiameter > 0
        ? calculateDetailedIconDimensionsForCircle(item.icon, endDiameter)
        : calculateIconDimensionsForState(item.icon, 'detailed');
    const iconHeight = detailedDims.height;
    const maxTextWidth = endDiameter - 2 * sidePadding;

    // Рассчитываем текстовый блок
    ctx.font = `300 ${fontSize}px 'Roboto', system-ui, sans-serif`;
    const lines = wrapText(ctx, item.description, maxTextWidth);
    const textBlockHeight = lines.length * lineHeight;

    // Общая высота контента
    const totalContentHeight = iconHeight + spacing + textBlockHeight;

    // Позиция текста: начало иконки + высота иконки + отступ
    const textStartY = -totalContentHeight / 2 + iconHeight + spacing;

    // Настройка текста
    ctx.fillStyle = TECH_CIRCLE_TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Плавная прозрачность появления
    ctx.globalAlpha = textProgress;

    lines.forEach((line, index) => {
      ctx.fillText(line, 0, textStartY + index * lineHeight);
    });
  }

  ctx.restore();
}

// Рисование частицы с шлейфом (оптимизированная растровая версия)
export function drawParticleWithTrail(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
): void {
  ctx.save();

  // Рисуем шлейф как одну линию с затухающей прозрачностью
  if (particle.trail.length > 1) {
    // Извлекаем базовый цвет и прозрачность
    const colorMatch = particle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (colorMatch) {
      const [, r, g, b] = colorMatch;

      ctx.lineWidth = particle.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Рисуем шлейф одной path для лучшей производительности
      ctx.beginPath();

      for (let i = 0; i < particle.trail.length; i++) {
        const point = particle.trail[i];
        if (!point) continue;

        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }

      // Используем один градиент для всего шлейфа
      const firstPoint = particle.trail[0];
      const lastPoint = particle.trail[particle.trail.length - 1];

      if (firstPoint && lastPoint) {
        const gradient = ctx.createLinearGradient(
          firstPoint.x,
          firstPoint.y,
          lastPoint.x,
          lastPoint.y,
        );

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${firstPoint.opacity})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${lastPoint.opacity})`);

        ctx.strokeStyle = gradient;
        ctx.stroke();
      }
    }
  }

  // Рисуем саму частицу используя растрированное изображение (НАМНОГО БЫСТРЕЕ!)
  const particleImage = createParticleRaster(particle.color, particle.size);
  const halfSize = particleImage.width / 2;

  ctx.globalAlpha = particle.opacity;
  ctx.drawImage(particleImage, particle.x - halfSize, particle.y - halfSize);

  ctx.restore();
}
