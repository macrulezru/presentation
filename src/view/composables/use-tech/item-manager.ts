import { PARTICLE_CONFIG, ICON_RASTER_HEIGHT } from './constants';
import {
  calculateInfinityPoint,
  calculateCirclePoint,
  positionToParameter,
} from './infinity-math';
import {
  calculateIconDimensionsForState,
  isPointInRect,
  getImagePath,
  createFallbackImage,
  generateRandomParticleColor,
  rasterizeIconImage,
} from './utils';

import type {
  TechItem,
  Particle,
  TrailPoint,
  ParticleConfig,
  TrajectoryMode,
} from './types';

export function createTechItem(
  tech: { icon: string; description: string },
  index: number,
  centerX: number,
  centerY: number,
  pathPosition: number,
  infinityScale: number,
  image: HTMLImageElement | null,
  trajectoryMode: TrajectoryMode = 'infinity',
  containerWidth: number = 0,
): TechItem {
  // Вычисляем начальную позицию на траектории
  let point;
  if (trajectoryMode === 'circle') {
    const circleRadius = infinityScale * 0.95;
    point = calculateCirclePoint(pathPosition, circleRadius, centerX, centerY);
  } else {
    const t = positionToParameter(pathPosition);
    point = calculateInfinityPoint(t, infinityScale, centerX, centerY);
  }

  // На мобиле (режим circle) иконки меньше
  const dims = calculateIconDimensionsForState(
    tech.icon,
    'path',
    trajectoryMode,
    containerWidth,
  );

  return {
    id: `tech-${tech.icon}-${index}`,
    ...tech,
    image,
    x: centerX, // Начинаем с центра для плавного появления
    y: centerY,
    targetX: point.x,
    targetY: point.y,
    pathPosition,
    originalPathPosition: pathPosition,
    width: dims.width,
    height: dims.height,
    hover: false,
    hoverScale: 1,
    hoverRotation: 0, // Начальное значение для плавного поворота
    depthScale: 1,
    depthOpacity: 1,
    depthBlur: 0,
    depthSaturation: 1,
    state: 'path',
    detailProgress: 0,
  };
}

export async function loadImages(
  technologies: Array<{ icon: string; description: string }>,
  loadedImages: { value: Record<string, HTMLImageElement> },
  isLoading: { value: boolean },
): Promise<void> {
  isLoading.value = true;

  const uniqueIcons = Array.from(new Set(technologies.map(tech => tech.icon)));

  const loadPromises = uniqueIcons.map(
    iconName =>
      new Promise<void>(resolve => {
        const img = new Image();
        const imagePath = getImagePath(iconName);

        img.onload = () => {
          // Растеризуем загруженное изображение в высоком разрешении
          const rasterizedCanvas = rasterizeIconImage(img, iconName, ICON_RASTER_HEIGHT);

          // Создаем новый Image из растрового canvas для использования в drawImage
          const rasterImg = new Image();
          rasterImg.src = rasterizedCanvas.toDataURL();

          // После загрузки растра сохраняем его
          rasterImg.onload = () => {
            loadedImages.value[iconName] = rasterImg;
            resolve();
          };

          rasterImg.onerror = () => {
            // Если растеризация не удалась, используем оригинал
            loadedImages.value[iconName] = img;
            resolve();
          };
        };

        img.onerror = () => {
          // Используем fallback изображение
          loadedImages.value[iconName] = createFallbackImage(iconName);
          resolve();
        };

        img.src = imagePath;
      }),
  );

  await Promise.all(loadPromises);

  isLoading.value = false;
}

export function createAllTechItems(
  technologies: Array<{ icon: string; description: string }>,
  centerX: number,
  centerY: number,
  infinityScale: number,
  loadedImages: Record<string, HTMLImageElement>,
  trajectoryMode: TrajectoryMode = 'infinity',
  containerWidth: number = 0,
): TechItem[] {
  const total = technologies.length;

  // Распределяем элементы равномерно по траектории (от 0 до 1)
  const items: TechItem[] = technologies.map((tech, index) => {
    const pathPosition = index / total;

    return createTechItem(
      tech,
      index,
      centerX,
      centerY,
      pathPosition,
      infinityScale,
      loadedImages[tech.icon] || null,
      trajectoryMode,
      containerWidth,
    );
  });

  return items;
}

export function getItemAtPosition(
  items: TechItem[],
  mouseX: number,
  mouseY: number,
  state: 'path' | 'detailed',
): TechItem | null {
  for (const item of items) {
    if (item.state !== state) continue;

    // Для элементов на траектории проверяем попадание в область иконки
    if (state === 'path') {
      const hitRadius = 50; // Радиус попадания для иконок на траектории
      const distance = Math.sqrt(
        Math.pow(mouseX - item.x, 2) + Math.pow(mouseY - item.y, 2),
      );

      if (distance <= hitRadius) {
        return item;
      }
    } else {
      // Для детализированных элементов проверяем прямоугольную область
      const halfWidth = item.width / 2;
      const halfHeight = item.height / 2;

      if (
        isPointInRect(
          mouseX,
          mouseY,
          item.x - halfWidth,
          item.y - halfHeight,
          item.width,
          item.height,
        )
      ) {
        return item;
      }
    }
  }

  return null;
}

export function updateHoverStates(
  items: TechItem[],
  mouseX: number,
  mouseY: number,
): boolean {
  let anyItemHovered = false;

  for (const item of items) {
    // Пропускаем элементы не на траектории
    if (item.state !== 'path') {
      item.hover = false;
      continue;
    }

    // Для элементов на траектории проверяем попадание в область иконки
    const hitRadius = 60; // Радиус попадания для наведения
    const distance = Math.sqrt(
      Math.pow(mouseX - item.x, 2) + Math.pow(mouseY - item.y, 2),
    );

    const isHovered = distance <= hitRadius;
    item.hover = isHovered;
    if (isHovered) {
      anyItemHovered = true;
    }
  }

  return anyItemHovered;
}

// Создание одной частицы с шлейфом
export function createParticle(
  index: number,
  centerX: number,
  centerY: number,
  infinityScale: number,
  config: ParticleConfig = PARTICLE_CONFIG,
  currentTime: number = Date.now(),
  trajectoryMode: TrajectoryMode = 'infinity',
): Particle {
  // Случайная начальная позиция на траектории (0-1)
  const pathPosition = Math.random();

  // Случайные смещения от базовой траектории
  const offsetX = (Math.random() - 0.5) * 2 * config.pathOffsetX;
  const offsetY = (Math.random() - 0.5) * 2 * config.pathOffsetY;

  // Случайный множитель скорости (если speedVariation = 0.5, то от 0.5 до 1.5)
  const speedVariation =
    'speedVariation' in config ? (config.speedVariation as number) : 0.5;
  const speedMultiplier = 1 - speedVariation + Math.random() * speedVariation * 2;

  // Случайное время жизни
  const minLifetime = 'minLifetime' in config ? (config.minLifetime as number) : 3000;
  const maxLifetime = 'maxLifetime' in config ? (config.maxLifetime as number) : 5000;
  const lifetime = minLifetime + Math.random() * (maxLifetime - minLifetime);

  // Рассчитываем начальную позицию на траектории (с учетом режима)
  let point;
  if (trajectoryMode === 'circle') {
    // Используем больший коэффициент для мобиля чтобы орбита была больше
    const circleRadius = infinityScale * 0.95;
    point = calculateCirclePoint(pathPosition, circleRadius, centerX, centerY);
  } else {
    const t = positionToParameter(pathPosition);
    point = calculateInfinityPoint(t, infinityScale, centerX, centerY);
  }

  // Инициализируем пустой шлейф
  const trail: TrailPoint[] = [];

  return {
    id: `particle-${index}-${Date.now()}`,
    pathPosition,
    offsetX,
    offsetY,
    x: point.x + offsetX,
    y: point.y + offsetY,
    trail,
    size: config.size,
    speed: config.speed,
    speedMultiplier,
    color: generateRandomParticleColor(),
    opacity: config.opacity,
    createdTime: currentTime,
    lifetime,
  };
}

// Создание всех частиц
export function createParticles(
  centerX: number,
  centerY: number,
  infinityScale: number,
  config: ParticleConfig = PARTICLE_CONFIG,
  trajectoryMode: TrajectoryMode = 'infinity',
): Particle[] {
  const particles: Particle[] = [];
  const currentTime = Date.now();

  for (let i = 0; i < config.count; i++) {
    particles.push(
      createParticle(
        i,
        centerX,
        centerY,
        infinityScale,
        config,
        currentTime,
        trajectoryMode,
      ),
    );
  }

  return particles;
}

// Обновление позиции частицы с шлейфом
export function updateParticle(
  particle: Particle,
  deltaTime: number,
  centerX: number,
  centerY: number,
  infinityScale: number,
  config: ParticleConfig = PARTICLE_CONFIG,
  currentTime: number = Date.now(),
  trajectoryMode: TrajectoryMode = 'infinity',
): boolean {
  // Проверяем, не истекло ли время жизни частицы
  const age = currentTime - particle.createdTime;
  if (age >= particle.lifetime) {
    // Частица умерла, нужно переродить
    return false;
  }

  // Обновляем позицию на траектории с учетом случайной скорости
  particle.pathPosition += particle.speed * particle.speedMultiplier * deltaTime;

  // Зацикливаем позицию (0-1)
  if (particle.pathPosition > 1) {
    particle.pathPosition -= 1;
  }

  // Рассчитываем новую позицию на базовой траектории (с учетом режима)
  let point;
  if (trajectoryMode === 'circle') {
    // Используем больший коэффициент для мобиля чтобы орбита была больше
    const circleRadius = infinityScale * 0.95;
    point = calculateCirclePoint(particle.pathPosition, circleRadius, centerX, centerY);
  } else {
    const t = positionToParameter(particle.pathPosition);
    point = calculateInfinityPoint(t, infinityScale, centerX, centerY);
  }

  // Применяем смещение для индивидуальной траектории
  const newX = point.x + particle.offsetX;
  const newY = point.y + particle.offsetY;

  // Добавляем текущую позицию в начало шлейфа
  particle.trail.unshift({
    x: particle.x,
    y: particle.y,
    opacity: particle.opacity,
  });

  // Ограничиваем длину шлейфа
  if (particle.trail.length > config.trailLength) {
    particle.trail.pop();
  }

  // Обновляем непрозрачность точек шлейфа
  const trailOpacityDecay: number =
    'trailOpacityDecay' in config ? (config.trailOpacityDecay as number) : 0.9;
  for (let i = 1; i < particle.trail.length; i++) {
    const trailPoint = particle.trail[i];
    if (trailPoint) {
      trailPoint.opacity *= trailOpacityDecay;
    }
  }

  // Обновляем текущую позицию частицы
  particle.x = newX;
  particle.y = newY;

  return true; // Частица жива
}
