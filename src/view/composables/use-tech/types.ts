// @/view/composables/use-tech/types.ts
import type { Ref } from 'vue';

export type TrajectoryMode = 'infinity' | 'circle';

export interface TechItem {
  id: string;
  icon: string;
  description: string;
  image: HTMLImageElement | null;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  pathPosition: number; // позиция на траектории от 0 до 1
  width: number;
  height: number;
  hover: boolean;
  hoverScale: number; // Масштаб при наведении
  hoverRotation: number; // Текущий прогресс поворота при наведении (0-1)
  depthScale: number; // Масштаб глубины (передний/задний план)
  depthOpacity: number; // Прозрачность для эффекта глубины
  depthBlur: number; // Размытие для эффекта глубины (px)
  depthSaturation: number; // Насыщенность для эффекта глубины (передний план)
  state: 'path' | 'detailed' | 'transition'; // 'path' вместо 'orbit'
  detailProgress: number;
  originalPathPosition: number; // оригинальная позиция на траектории для возврата
}

export interface CanvasAnimationOptions {
  containerRef: Ref<HTMLElement | undefined>;
}

export interface AnimationState {
  globalPathOffset: number; // смещение для движения всех элементов по траектории
  infinityScale: number; // текущий масштаб траектории бесконечности
  trajectoryMode: TrajectoryMode; // режим траектории: бесконечность или круг
  selectedItem: TechItem | null;
  isAnimatingDetail: boolean;
  canvasWidth: number;
  canvasHeight: number;
  centerX: number;
  centerY: number;
}

export interface DrawConfig {
  isDetailed: boolean;
  showCloseButton: boolean;
  closeButtonHover: boolean;
}

export interface EllipseParameters {
  ellipticity: number;
  direction: 'horizontal' | 'vertical';
}

export type EllipseDirection = 'horizontal' | 'vertical';

// Конфигурация для частиц с шлейфом
export interface ParticleConfig {
  count: number; // количество частиц
  size: number; // размер частицы
  speed: number; // скорость движения по траектории
  trailLength: number; // длина шлейфа (количество точек)
  pathOffsetX: number; // максимальное случайное смещение по X от базовой траектории
  pathOffsetY: number; // максимальное случайное смещение по Y от базовой траектории
  opacity: number; // начальная непрозрачность
}

// Точка в шлейфе частицы
export interface TrailPoint {
  x: number;
  y: number;
  opacity: number; // уменьшается к концу шлейфа
}

// Частица с шлейфом
export interface Particle {
  id: string;
  pathPosition: number; // позиция на базовой траектории (0-1)
  offsetX: number; // случайное смещение по X
  offsetY: number; // случайное смещение по Y
  x: number; // текущая позиция X
  y: number; // текущая позиция Y
  trail: TrailPoint[]; // массив точек шлейфа
  size: number; // размер частицы
  speed: number; // базовая скорость движения
  speedMultiplier: number; // случайный множитель скорости (0.5-1.5)
  color: string; // цвет частицы
  opacity: number; // непрозрачность
  createdTime: number; // время создания в миллисекундах
  lifetime: number; // время жизни в миллисекундах
}
