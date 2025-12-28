// @/view/composables/use-tech/infinity-math.ts
/**
 * Математика для траектории в виде знака бесконечности (лемниската Бернулли)
 * Формула: x = a * cos(t) / (1 + sin²(t))
 *          y = a * sin(t) * cos(t) / (1 + sin²(t))
 */

import {
  DEPTH_SCALE_MIN,
  DEPTH_SCALE_MAX,
  DEPTH_SCALE_MID,
  DEPTH_OPACITY_MIN,
  DEPTH_OPACITY_MAX,
  DEPTH_BLUR_MIN,
  DEPTH_BLUR_MAX,
  DEPTH_SATURATION_MIN,
  DEPTH_SATURATION_MAX,
} from './constants';

export interface InfinityPoint {
  x: number;
  y: number;
}

/**
 * Вычисляет координаты точки на траектории знака бесконечности
 * @param t - параметр от 0 до 2π (один полный цикл)
 * @param scale - масштаб траектории (половина ширины)
 * @param centerX - центр X
 * @param centerY - центр Y
 * @returns координаты точки {x, y}
 */
export function calculateInfinityPoint(
  t: number,
  scale: number,
  centerX: number,
  centerY: number,
): InfinityPoint {
  const sinT = Math.sin(t);
  const cosT = Math.cos(t);
  const denominator = 1 + sinT * sinT;

  // Лемниската Бернулли
  const x = (scale * cosT) / denominator;
  const y = (scale * sinT * cosT) / denominator;

  return {
    x: centerX + x,
    y: centerY + y,
  };
}

/**
 * Вычисляет длину дуги траектории (приближенно)
 * Используется для равномерного распределения элементов
 * @param scale - масштаб траектории
 * @returns приближенная длина всей траектории
 */
export function calculateInfinityArcLength(scale: number): number {
  // Численное интегрирование для вычисления длины дуги
  const steps = 1000;
  const dt = (Math.PI * 2) / steps;
  let length = 0;

  let prevPoint = calculateInfinityPoint(0, scale, 0, 0);

  for (let i = 1; i <= steps; i++) {
    const t = i * dt;
    const point = calculateInfinityPoint(t, scale, 0, 0);

    const dx = point.x - prevPoint.x;
    const dy = point.y - prevPoint.y;
    length += Math.sqrt(dx * dx + dy * dy);

    prevPoint = point;
  }

  return length;
}

/**
 * Находит параметр t для заданной позиции на траектории (от 0 до 1)
 * @param position - позиция от 0 до 1 (0 = начало, 1 = конец цикла)
 * @returns параметр t (от 0 до 2π)
 */
export function positionToParameter(position: number): number {
  // Для упрощения используем линейное отображение
  // В идеале нужно учитывать неравномерность скорости движения по кривой
  // но для визуальной анимации линейное отображение достаточно
  const normalizedPosition = ((position % 1) + 1) % 1; // Нормализуем в диапазон [0, 1)
  return normalizedPosition * Math.PI * 2;
}

/**
 * Вычисляет масштаб глубины для создания эффекта переднего и заднего плана
 * @param position - позиция на траектории от 0 до 1
 * @returns множитель масштаба (0.7 для заднего плана, 1.3 для переднего)
 *
 * Логика:
 * - position 0 - 0.5: левая петля (задний план) - scale уменьшается к центру
 * - position 0.5 - 1.0: правая петля (передний план) - scale увеличивается к центру
 */
export function calculateDepthScale(position: number): number {
  const normalizedPosition = ((position % 1) + 1) % 1;

  if (normalizedPosition < 0.5) {
    // Левая петля (задний план): от 1.0 (начало) -> 0.7 (минимум в ~0.25) -> 1.0 (центр)
    const localPos = normalizedPosition * 2; // 0 -> 1
    // Используем sin для плавного перехода с минимумом в середине
    const curve = Math.sin(localPos * Math.PI);
    return DEPTH_SCALE_MID - (DEPTH_SCALE_MID - DEPTH_SCALE_MIN) * curve;
  } else {
    // Правая петля (передний план): от 1.0 (центр) -> 1.3 (пик в ~0.75) -> 1.0 (конец)
    const localPos = (normalizedPosition - 0.5) * 2; // 0 -> 1
    // Используем sin для плавного перехода с пиком в середине
    const curve = Math.sin(localPos * Math.PI);
    return DEPTH_SCALE_MID + (DEPTH_SCALE_MAX - DEPTH_SCALE_MID) * curve;
  }
}

/**
 * Вычисляет прозрачность для эффекта глубины
 * @param position - позиция на траектории от 0 до 1
 * @returns значение прозрачности (0.4 для заднего плана в центре, 1.0 для переднего плана)
 *
 * Логика:
 * - position 0 - 0.5: левая петля (задний план) - opacity уменьшается к центру
 * - position 0.5 - 1.0: правая петля (передний план) - opacity всегда 1.0
 */
export function calculateDepthOpacity(position: number): number {
  const normalizedPosition = ((position % 1) + 1) % 1;

  if (normalizedPosition < 0.5) {
    // Левая петля (задний план): от 1.0 (начало) -> 0.4 (минимум в ~0.25) -> 1.0 (центр)
    const localPos = normalizedPosition * 2; // 0 -> 1
    // Используем sin для плавного перехода с минимумом в середине
    const curve = Math.sin(localPos * Math.PI);
    return DEPTH_OPACITY_MAX - (DEPTH_OPACITY_MAX - DEPTH_OPACITY_MIN) * curve;
  } else {
    // Правая петля (передний план): всегда полностью непрозрачно
    return DEPTH_OPACITY_MAX;
  }
}

/**
 * Вычисляет размытие для эффекта глубины
 * @param position - позиция на траектории от 0 до 1
 * @returns значение размытия в пикселях (0 для переднего плана, до 3px для заднего плана)
 *
 * Логика:
 * - position 0 - 0.5: левая петля (задний план) - blur увеличивается к центру
 * - position 0.5 - 1.0: правая петля (передний план) - blur всегда 0
 */
export function calculateDepthBlur(position: number): number {
  const normalizedPosition = ((position % 1) + 1) % 1;

  if (normalizedPosition < 0.5) {
    // Левая петля (задний план): от 0 (начало) -> 3 (максимум в ~0.25) -> 0 (центр)
    const localPos = normalizedPosition * 2; // 0 -> 1
    // Используем sin для плавного перехода с максимумом в середине
    const curve = Math.sin(localPos * Math.PI);
    return DEPTH_BLUR_MIN + (DEPTH_BLUR_MAX - DEPTH_BLUR_MIN) * curve;
  } else {
    // Правая петля (передний план): всегда без размытия
    return DEPTH_BLUR_MIN;
  }
}

/**
 * Вычисляет насыщенность для эффекта глубины
 * @param position - позиция на траектории от 0 до 1
 * @returns значение насыщенности (1.0 для заднего плана, до 1.5 для переднего плана)
 *
 * Логика:
 * - position 0 - 0.5: левая петля (задний план) - saturation всегда 1.0
 * - position 0.5 - 1.0: правая петля (передний план) - saturation увеличивается к центру
 */
export function calculateDepthSaturation(position: number): number {
  const normalizedPosition = ((position % 1) + 1) % 1;

  if (normalizedPosition < 0.5) {
    // Левая петля (задний план): всегда нормальная насыщенность
    return DEPTH_SATURATION_MIN;
  } else {
    // Правая петля (передний план): от 1.0 (центр) -> 1.5 (пик в ~0.75) -> 1.0 (конец)
    const localPos = (normalizedPosition - 0.5) * 2; // 0 -> 1
    // Используем sin для плавного перехода с максимумом в середине
    const curve = Math.sin(localPos * Math.PI);
    return DEPTH_SATURATION_MIN + (DEPTH_SATURATION_MAX - DEPTH_SATURATION_MIN) * curve;
  }
}

/**
 * Вычисляет оптимальный масштаб траектории на основе размера контейнера
 * Траектория занимает всю доступную ширину с безопасными отступами
 * @param containerWidth - ширина контейнера
 * @param _containerHeight - высота контейнера (не используется)
 * @param minScale - минимальный масштаб
 * @param maxScale - максимальный масштаб
 * @returns оптимальный масштаб
 */
export function calculateOptimalScale(
  containerWidth: number,
  _containerHeight: number,
  minScale: number,
  maxScale: number,
): number {
  // Для лемнискаты Бернулли максимальная ширина ≈ 2 * scale
  // Отступ для иконок (половина размера иконки с запасом)
  const iconPadding = 80; // отступ с каждой стороны
  const availableWidth = containerWidth - iconPadding * 2;

  // Масштаб = половина доступной ширины (т.к. траектория простирается на ±scale по X)
  const calculatedScale = availableWidth / 2;

  // Ограничиваем масштаб минимальным и максимальным значениями
  return Math.max(minScale, Math.min(maxScale, calculatedScale));
}

/**
 * Вычисляет координаты точки на круговой траектории
 * Движение по часовой стрелке начиная с верхней точки (12 часов)
 * @param position - позиция на траектории от 0 до 1
 * @param radius - радиус окружности
 * @param centerX - центр X
 * @param centerY - центр Y
 * @returns координаты точки {x, y}
 */
export function calculateCirclePoint(
  position: number,
  radius: number,
  centerX: number,
  centerY: number,
): InfinityPoint {
  const normalizedPosition = ((position % 1) + 1) % 1;

  // Угол в радианах: начинаем с -π/2 (верхняя точка), движемся по часовой стрелке (прибавляем угол)
  const angle = -Math.PI / 2 + normalizedPosition * Math.PI * 2;

  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);

  return { x, y };
}
