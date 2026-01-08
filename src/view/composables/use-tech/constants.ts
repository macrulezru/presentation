// Параметры траектории бесконечности (∞)
import { ref } from 'vue';
// Цвет надписи внутри круга
export const TECH_CIRCLE_TEXT_COLOR = 'rgba(255, 255, 255, 1)';
// Цвета для центральной окружности технологии
export const TECH_CIRCLE_FILL_COLOR = 'rgba(14, 13, 13, 1)';
export const TECH_CIRCLE_STROKE_COLOR = 'rgba(217, 65, 176, 1)';

export const INFINITY_MOVEMENT_SPEED = 0.00003; // скорость движения по траектории (позиция/мс)
export const INFINITY_MIN_SCALE = 150; // минимальный масштаб траектории
export const INFINITY_MAX_SCALE = 600; // максимальный масштаб траектории
// Ограничение логической ширины canvas, чтобы анимация не растягивалась
export const CANVAS_MAX_WIDTH = 1000;

// Реактивная версия CANVAS_MAX_WIDTH для динамического изменения
export const canvasMaxWidth = ref(CANVAS_MAX_WIDTH);

// Функция для изменения максимальной ширины canvas
export const setCanvasMaxWidth = (width: number) => {
  canvasMaxWidth.value = width;
};

// Функция для сброса к значению по умолчанию
export const resetCanvasMaxWidth = () => {
  canvasMaxWidth.value = CANVAS_MAX_WIDTH;
};

// Режим траектории
export const DEFAULT_TRAJECTORY_MODE = 'infinity'; // 'infinity' или 'circle'

// Параметры круговой траектории
export const CIRCLE_MAX_RADIUS = 200; // максимальный радиус окружности для режима circle

// Параметры инерции при отпускании иконок
export const DRAG_INERTIA_DECELERATION = 0.95; // коэффициент затухания скорости (0-1, меньше = быстрее затухает)
export const DRAG_INERTIA_MIN_VELOCITY = 0.00001; // минимальная скорость, ниже которой инерция считается нулевой

// Множители для синхронизации драга с курсором
export const DRAG_SYNC_MULTIPLIER_INFINITY = 0.5; // множитель для траектории infinity (больше из-за нелинейности)
export const DRAG_SYNC_MULTIPLIER_CIRCLE = 1.0; // множитель для круговой траектории

// Минимальное расстояние (в пикселях) перед началом драга
// Если палец/мышь сместились меньше, чем на это значение, то это считается тапом, а не драгом
export const DRAG_START_THRESHOLD = 10; // пиксели

// Масштабы глубины для эффекта переднего/заднего плана
export const DEPTH_SCALE_MIN = 0.5; // минимальный масштаб (задний план)
export const DEPTH_SCALE_MAX = 1.5; // максимальный масштаб (передний план)
export const DEPTH_SCALE_MID = 1.0; // нейтральный масштаб

// Прозрачность для эффекта глубины (задний план)
export const DEPTH_OPACITY_MIN = 0.4; // минимальная непрозрачность в центре заднего плана
export const DEPTH_OPACITY_MAX = 1.0; // максимальная непрозрачность (передний план и края)

// Размытие для эффекта глубины (задний план)
export const DEPTH_BLUR_MIN = 0; // минимальное размытие (края и передний план)
export const DEPTH_BLUR_MAX = 3; // максимальное размытие в центре заднего плана (px)

// Насыщенность для эффекта глубины (передний план)
export const DEPTH_SATURATION_MIN = 1.0; // минимальная насыщенность (задний план и края)
export const DEPTH_SATURATION_MAX = 2; // максимальная насыщенность в центре переднего плана

// Размеры элементов
export const ITEM_WIDTH = 160;
export const ITEM_HEIGHT = 140;
export const ITEM_PADDING = 20;
export const DETAIL_ITEM_WIDTH = 320;
export const DETAIL_ITEM_HEIGHT = 280;
export const DETAIL_ITEM_PADDING = 40;
export const DETAIL_ITEM_BG_OPACITY = 0.9; // Прозрачность фона плашки детального элемента
export const CLOSE_BUTTON_SIZE = 32;
export const CLOSE_BUTTON_PADDING = 16;

// Масштаб детализированного центра для мобильного режима ('circle')
// Применяется как множитель к базовому диаметру детального круга
export const MOBILE_DETAIL_SCALE_CONFIG = {
  breakpoint1: 450, // узкие экраны
  breakpoint2: 600, // средние экраны
  smallScale: 0.75, // < 450px — 75% от базового диаметра
  mediumScale: 0.85, // 450-600px — 85%
  largeScale: 0.95, // > 600px — 95%
} as const;

// Доля диаметра детального круга, занимаемая логотипом внутри
// Например, 0.38 означает, что иконка занимает ~38% от диаметра круга
export const DETAIL_ICON_RATIO_IN_CIRCLE = 0.38;

// Адаптивный размер кнопки закрытия как доля диаметра круга
// 0.115 * 280 ≈ 32px (соответствует CLOSE_BUTTON_SIZE по умолчанию)
export const CLOSE_BUTTON_RATIO_OF_DIAMETER = 0.115;
export const CLOSE_BUTTON_MIN_SIZE = 24;
export const CLOSE_BUTTON_MAX_SIZE = 40;

// Адаптивная типографика описания в центре (относительно диаметра)
// 16px / 280 ≈ 0.057
export const DETAIL_FONT_RATIO_OF_DIAMETER = 0.057;
export const DETAIL_LINE_HEIGHT_MULTIPLIER = 1.35;
export const DETAIL_TEXT_SPACING_MULTIPLIER = 1.25;
export const DETAIL_FONT_MIN_SIZE = 12;
export const DETAIL_FONT_MAX_SIZE = 20;
// Более компактный межстрочный интервал для мобиля
export const DETAIL_LINE_HEIGHT_MULTIPLIER_MOBILE = 1.25;
// Более компактный вертикальный отступ между иконкой и текстом на десктопе
export const DETAIL_TEXT_SPACING_MULTIPLIER_DESKTOP = 1.1;

// Масштабирование крестика внутри кнопки закрытия (относительно размера кнопки)
// Для кнопки 32px: крестик 8px (0.25), толщина линии 2px (0.0625)
export const CLOSE_BUTTON_CROSS_SIZE_RATIO = 0.25;
export const CLOSE_BUTTON_CROSS_LINE_WIDTH_RATIO = 0.0625;

// Адаптивные боковые отступы текстового блока как доля диаметра круга
// Для диаметра 280px: суммарный отступ 2*(40+20)=120 => ~0.214; возьмем близкое 0.215
export const DETAIL_TEXT_SIDE_PADDING_RATIO = 0.215;

// Цвета
export const COLORS = {
  text: '#000',
  orbit: '#ccc',
  shadow: 'rgba(0, 0, 0, 0.1)',
  closeButton: '#999',
  closeButtonHover: '#666',
} as const;

// Время анимации (мс)
export const ANIMATION_DURATION = 400;

// Флаг для включения отладочных логов (можно отключить даже в dev-режиме)
export const ENABLE_TECH_DEBUG = false;

// Размеры иконок
export const ICON_DIMENSIONS: Record<string, { width: number; height: number }> = {
  javascript: { width: 89, height: 89 },
  vue: { width: 104, height: 89 },
  pinia: { width: 60, height: 89 },
  ts: { width: 89, height: 89 },
  typescript: { width: 89, height: 89 },
  php: { width: 170, height: 89 },
  bitrix: { width: 89, height: 89 },
  html: { width: 78, height: 89 },
  css: { width: 79, height: 89 },
  vite: { width: 91, height: 89 },
  i18n: { width: 98, height: 89 },
  git: { width: 89, height: 89 },
  svn: { width: 122, height: 89 },
  figma: { width: 60, height: 89 },
};

// Состояния элементов
// Removed unused ITEM_STATES constant

// Размеры для разных состояний
export const ORBIT_ICON_SIZE = 60; // Размер иконки на орбите
export const DETAILED_ICON_SIZE = 128; // Размер иконки в детализированном виде

// Адаптивные коэффициенты размера иконок для режима 'circle' (мобиль)
// Размер = containerWidth * коэффициент
export const MOBILE_ICON_SIZE_CONFIG = {
  // Точка разделения для переходов между коэффициентами
  breakpoint1: 450, // px (узкие мобильные экраны)
  breakpoint2: 600, // px (средние мобильные и планшеты)

  // Коэффициенты размера для разных диапазонов ширины
  smallScreen: 0.13, // < 450px: 8% от ширины
  mediumScreen: 0.13, // 450-600px: 7% от ширины
  largeScreen: 0.1, // > 600px: 6% от ширины
} as const;
// Размер растрового спрайта для логотипов (для HiDPI экранов)
export const ICON_RASTER_HEIGHT = 200; // Высокое разрешение для четкости на Retina дисплеях

// Множитель разрешения для растровых элементов UI (подложки, кнопки)
// 3x для очень четкого отображения на HiDPI дисплеях
export const UI_RASTER_SCALE = 3;

// Параметры частиц с шлейфом
export const PARTICLE_CONFIG = {
  count: 16, // количество частиц (уменьшено для производительности)
  size: 1.5, // размер частицы в пикселях (уменьшено в 2 раза)
  speed: 0.0002, // скорость движения по траектории (увеличено в 5 раз)
  speedVariation: 0.5, // вариация скорости (0.5 = от 50% до 150% базовой скорости)
  trailLength: 50, // длина шлейфа (оптимизировано для производительности)
  pathOffsetX: 50, // максимальное случайное смещение по X от базовой траектории
  pathOffsetY: 30, // максимальное случайное смещение по Y от базовой траектории
  opacity: 0.6, // начальная непрозрачность
  trailOpacityDecay: 0.92, // коэффициент затухания непрозрачности шлейфа
  minLifetime: 3000, // минимальное время жизни частицы в миллисекундах
  maxLifetime: 5000, // максимальное время жизни частицы в миллисекундах
} as const;
