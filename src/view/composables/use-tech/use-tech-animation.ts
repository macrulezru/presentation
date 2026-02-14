import { useResponsive } from '@/view/composables/use-responsive';
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

import {
  INFINITY_MOVEMENT_SPEED,
  INFINITY_MIN_SCALE,
  INFINITY_MAX_SCALE,
  canvasMaxWidth,
  COLORS,
  DETAIL_ITEM_WIDTH,
  DETAIL_ITEM_HEIGHT,
  ORBIT_ICON_SIZE,
  PARTICLE_CONFIG,
  DEFAULT_TRAJECTORY_MODE,
  DRAG_INERTIA_DECELERATION,
  DRAG_INERTIA_MIN_VELOCITY,
  DRAG_SYNC_MULTIPLIER_INFINITY,
  DRAG_START_THRESHOLD,
} from './constants';
import {
  drawPathIcon,
  drawDetailedItem,
  drawInfinityPath,
  drawParticleWithTrail,
} from './draw-functions';
import {
  calculateOptimalScale,
  calculateInfinityPoint,
  calculateCirclePoint,
  positionToParameter,
  calculateDepthScale,
  calculateDepthOpacity,
  calculateDepthBlur,
  calculateDepthSaturation,
} from './infinity-math';
import {
  loadImages,
  createAllTechItems,
  getItemAtPosition,
  updateHoverStates,
  createParticles,
  updateParticle,
  createParticle,
} from './item-manager';
import { StateManager } from './state-manager';
import {
  techDebug,
  techWarn,
  techError,
  calculateIconDimensionsForState,
  calculateDetailEndDiameter,
  calculateCloseButtonSize,
} from './utils';

import type { CanvasAnimationOptions, AnimationState, TechItem, Particle } from './types';

import { useI18n } from '@/view/composables/use-i18n';
import { useVisibility } from '@/view/composables/use-visibility';

export function useTechAnimation(options: CanvasAnimationOptions) {
  const { containerRef } = options;

  // Подключаем composables внутри
  const { t } = useI18n();
  const responsive = useResponsive();

  // Подключаем отслеживание видимости контейнера
  const { initVisibilityObserver } = useVisibility(containerRef, {
    rootMargin: '100px', // Запускаем анимацию немного раньше появления в viewport
    threshold: 0.01,
  });

  // Создаем массив технологий с локализацией
  const technologies = computed(() => [
    { icon: 'javascript', description: t('tech.javascript') },
    { icon: 'vue', description: t('tech.vue') },
    { icon: 'pinia', description: t('tech.pinia') },
    { icon: 'ts', description: t('tech.typescript') },
    { icon: 'php', description: t('tech.php') },
    { icon: 'bitrix', description: t('tech.bitrix') },
    { icon: 'html', description: t('tech.html') },
    { icon: 'css', description: t('tech.css') },
    { icon: 'vite', description: t('tech.vite') },
    { icon: 'i18n', description: t('tech.i18n') },
    { icon: 'git', description: t('tech.git') },
    { icon: 'svn', description: t('tech.svn') },
    { icon: 'figma', description: t('tech.figma') },
  ]);

  // Следим за изменением максимальной ширины canvas и обновляем размеры
  watch(canvasMaxWidth, () => {
    updateCanvasSize();
  });

  const canvasRef = ref<HTMLCanvasElement>();
  const ctx = ref<CanvasRenderingContext2D | null>(null);
  // Offscreen-буфер для преломляемого слоя (логотипы позади сферы)
  const bufferCanvasRef = ref<HTMLCanvasElement>();
  const bufferCtx = ref<CanvasRenderingContext2D | null>(null);

  // Состояние анимации
  const initialState: AnimationState = {
    globalPathOffset: 0,
    infinityScale: INFINITY_MIN_SCALE,
    trajectoryMode: DEFAULT_TRAJECTORY_MODE as 'infinity' | 'circle',
    selectedItem: null,
    isAnimatingDetail: false,
    canvasWidth: 0,
    canvasHeight: 0,
    centerX: 0,
    centerY: 0,
    isDragging: false,
    draggedItem: null,
    dragStartX: 0,
    dragStartOffset: 0,
    dragVelocity: 0,
    dragLastX: 0,
    dragLastTime: 0,
  };

  const stateManager = new StateManager(initialState);

  // Загруженные изображения
  const loadedImages = ref<Record<string, HTMLImageElement>>({});
  const isLoading = ref(true);

  // Список элементов для анимации
  const items = ref<TechItem[]>([]);

  // Список частиц с шлейфом
  const particles = ref<Particle[]>([]);

  // Эффект блюра для фона
  const backgroundBlur = ref(0);

  // Время анимации
  let animationFrameId: number = 0;
  let lastTimestamp: number = 0;

  // Флаг для отслеживания видимости (для автоматической паузы/возобновления)
  let isAnimationPaused = false;

  // Настройки рисования
  const closeButtonHover = ref(false);

  // Инициализация элементов
  const initializeItems = () => {
    const state = stateManager.getState();
    if (!state.centerX || !state.centerY) {
      techWarn('[TechAnimation] Cannot initialize items: center not set', state);
      return;
    }

    const { centerX, centerY, infinityScale, trajectoryMode } = state;

    techDebug('[TechAnimation] initializeItems - Инициализация элементов', {
      trajectoryMode,
      centerX,
      centerY,
      infinityScale,
      technologiesCount: technologies.value.length,
      itemsCount: items.value.length,
    });

    // Создаем все элементы
    const newItems = createAllTechItems(
      technologies.value,
      centerX,
      centerY,
      infinityScale,
      loadedImages.value,
      trajectoryMode,
      state.canvasWidth,
    );

    items.value = newItems;

    // Создаем частицы с шлейфом
    particles.value = createParticles(
      centerX,
      centerY,
      infinityScale,
      PARTICLE_CONFIG,
      trajectoryMode,
    );

    techDebug('[TechAnimation] Items initialized успешно', {
      itemsCount: newItems.length,
      particlesCount: particles.value.length,
      trajectoryMode,
    });
  };

  // Вычисление масштаба траектории
  const calculateInfinityScale = (widthOverride?: number, heightOverride?: number) => {
    if (!containerRef.value) return INFINITY_MIN_SCALE;

    const rect = containerRef.value.getBoundingClientRect();
    const width = Math.min(widthOverride ?? rect.width, canvasMaxWidth.value);
    const height = heightOverride ?? rect.height;

    return calculateOptimalScale(width, height, INFINITY_MIN_SCALE, INFINITY_MAX_SCALE);
  };

  // Обновление размеров холста
  const updateCanvasSize = (isInitial = false) => {
    if (!containerRef.value || !canvasRef.value) {
      techDebug('[TechAnimation] updateCanvasSize: missing requirements', {
        hasContainer: !!containerRef.value,
        hasCanvas: !!canvasRef.value,
      });
      return;
    }

    const container = containerRef.value;
    const rect = container.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      techWarn('[TechAnimation] Container has zero dimensions');
      return;
    }

    const rawWidth = rect.width;
    const rawHeight = rect.height;
    const width = Math.min(rawWidth, canvasMaxWidth.value);
    const mode = stateManager.getState().trajectoryMode;

    let infinityScale = calculateInfinityScale(width, rawHeight);
    const iconSize = ORBIT_ICON_SIZE;
    let height: number;

    let calculatedHeight: number;

    if (mode === 'circle') {
      // Для круга подбираем радиус из ширины, учитывая иконку
      const circlePadding = 12; // безопасный отступ по краям
      const targetRadius = Math.max(60, (width - circlePadding * 2 - iconSize) / 2);
      // В расчётах позиции используется radius = infinityScale * 0.95, подберём scale так, чтобы радиус совпадал с targetRadius
      infinityScale = targetRadius / 0.95;

      const verticalPadding = 8;
      calculatedHeight = targetRadius * 2 + iconSize + verticalPadding * 2;
      height = Math.max(200, calculatedHeight);
    } else {
      // Для лемнискаты Бернулли максимальная высота ≈ scale / 2
      const iconPadding = 8; // более компактный отступ сверху/снизу
      const trajectoryHeight = infinityScale / 2; // вертикальный радиус траектории
      calculatedHeight = trajectoryHeight * 2 + iconSize * 1.0 + iconPadding * 2;
      height = Math.max(210, calculatedHeight);
    }

    const newState = {
      canvasWidth: width,
      canvasHeight: height,
      centerX: width / 2,
      centerY: height / 2,
      infinityScale,
    };

    stateManager.setState(newState);

    // Устанавливаем размеры холста с учетом DPI
    const dpr = window.devicePixelRatio || 1;
    canvasRef.value.width = width * dpr;
    canvasRef.value.height = height * dpr;
    canvasRef.value.style.width = `${width}px`;
    canvasRef.value.style.height = `${height}px`;

    if (ctx.value) {
      ctx.value.scale(dpr, dpr);
    }

    // Инициализируем/обновляем offscreen-буфер
    if (!bufferCanvasRef.value) {
      bufferCanvasRef.value = document.createElement('canvas');
    }
    bufferCanvasRef.value.width = width * dpr;
    bufferCanvasRef.value.height = height * dpr;
    bufferCanvasRef.value.style.width = `${width}px`;
    bufferCanvasRef.value.style.height = `${height}px`;
    bufferCtx.value = bufferCanvasRef.value.getContext('2d');
    if (bufferCtx.value) {
      bufferCtx.value.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    techDebug('[TechAnimation] Canvas size updated', {
      width,
      height,
      calculatedHeight,
      infinityScale,
      centerX: newState.centerX,
      centerY: newState.centerY,
      isInitial,
    });

    // При первой инициализации создаём элементы, при resize только обновляем масштаб
    if (isInitial || items.value.length === 0) {
      initializeItems();
    }
  };

  // Обработчик наведения мыши
  const handleMouseMove = (event: MouseEvent) => {
    if (!canvasRef.value || !ctx.value) return;

    const state = stateManager.getState();

    // Сначала проверяем драг
    if (state.isDragging) {
      handleMouseMoveForDrag(event);
      return;
    }

    // Если есть выбранный элемент, не обрабатываем ховер на остальных иконках
    if (state.selectedItem) {
      // Обнуляем ховер для всех элементов кроме выбранного
      items.value.forEach(item => {
        if (item.id !== state.selectedItem?.id) {
          item.hover = false;
        }
      });

      // Проверяем наведение на кнопку закрытия
      const rect = canvasRef.value.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Центр кнопки на окружности плашки (правый верх, −35°)
      const angle = -35 * (Math.PI / 180);
      const baseEndDiameter = Math.min(DETAIL_ITEM_WIDTH, DETAIL_ITEM_HEIGHT);
      const radius =
        calculateDetailEndDiameter(
          state.trajectoryMode,
          state.canvasWidth,
          baseEndDiameter,
        ) / 2;
      const buttonSize = calculateCloseButtonSize(radius * 2);
      const closeButtonX = state.centerX + radius * Math.cos(angle);
      const closeButtonY = state.centerY + radius * Math.sin(angle);

      const dx = mouseX - closeButtonX;
      const dy = mouseY - closeButtonY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isOverCloseButton = dist <= buttonSize / 2;

      closeButtonHover.value = isOverCloseButton;

      // Обновляем курсор
      if (canvasRef.value) {
        canvasRef.value.style.cursor = isOverCloseButton ? 'pointer' : 'default';
      }

      return;
    }

    const rect = canvasRef.value.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Обновляем hover состояния
    const anyItemHovered = updateHoverStates(items.value, mouseX, mouseY);

    // Обновляем курсор - показываем grab при наведении на иконку
    if (canvasRef.value) {
      canvasRef.value.style.cursor = anyItemHovered ? 'grab' : 'default';
    }
  };

  // Обновление размеров иконок при изменении размера контейнера
  const updateIconSizes = () => {
    const state = stateManager.getState();
    if (state.canvasWidth === 0) return;

    techDebug('[TechAnimation] updateIconSizes called', {
      canvasWidth: state.canvasWidth,
      trajectoryMode: state.trajectoryMode,
      itemsCount: items.value.length,
    });

    let updated = false;
    items.value.forEach(item => {
      if (item.state === 'path') {
        const newDims = calculateIconDimensionsForState(
          item.icon,
          'path',
          state.trajectoryMode,
          state.canvasWidth,
        );

        if (newDims.width !== item.width || newDims.height !== item.height) {
          techDebug('[TechAnimation] Icon size changed', {
            icon: item.icon,
            oldSize: { width: item.width, height: item.height },
            newSize: { width: newDims.width, height: newDims.height },
          });
          item.width = newDims.width;
          item.height = newDims.height;
          updated = true;
        }
      }
    });

    if (updated) {
      techDebug('[TechAnimation] Icon sizes updated', {
        canvasWidth: state.canvasWidth,
        trajectoryMode: state.trajectoryMode,
      });
    }
  };

  // Обработчик клика
  const handleClick = (event: MouseEvent) => {
    if (!canvasRef.value) return;

    const state = stateManager.getState();
    if (state.isAnimatingDetail) return;

    const rect = canvasRef.value.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    techDebug('[TechAnimation] Click detected', {
      mouseX,
      mouseY,
      trajectoryMode: state.trajectoryMode,
      selectedItem: state.selectedItem?.id,
    });

    // Проверяем клик на кнопку закрытия
    if (state.selectedItem) {
      // Центр кнопки на окружности плашки (правый верх, −35°)
      const angle = -35 * (Math.PI / 180);
      const baseEndDiameter = Math.min(DETAIL_ITEM_WIDTH, DETAIL_ITEM_HEIGHT);
      const radius =
        calculateDetailEndDiameter(
          state.trajectoryMode,
          state.canvasWidth,
          baseEndDiameter,
        ) / 2;
      const buttonSize = calculateCloseButtonSize(radius * 2);
      const closeButtonX = state.centerX + radius * Math.cos(angle);
      const closeButtonY = state.centerY + radius * Math.sin(angle);

      const dx = mouseX - closeButtonX;
      const dy = mouseY - closeButtonY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clickedCloseButton = dist <= buttonSize / 2;

      if (clickedCloseButton) {
        techDebug('[TechAnimation] Close button clicked');
        stateManager.exitDetailedView(items.value);
        return;
      }
    }

    // Проверяем клик на элемент на траектории
    const clickedItem = getItemAtPosition(items.value, mouseX, mouseY, 'path');
    if (clickedItem && clickedItem.state === 'path' && !state.selectedItem) {
      techDebug('[TechAnimation] Path item clicked:', clickedItem.id);

      stateManager.enterDetailedView(clickedItem, items.value);
      return;
    }

    // Клик вне элемента - закрываем детализацию
    if (state.selectedItem) {
      techDebug('[TechAnimation] Click outside, closing detail view');
      stateManager.exitDetailedView(items.value);
    }
  };

  // Обработчик mousedown - начало драга иконки
  const handleMouseDown = (event: MouseEvent) => {
    if (!canvasRef.value) return;

    const state = stateManager.getState();

    // Не начинаем драг если идет анимация детального вида или уже выбран элемент
    if (state.isAnimatingDetail || state.selectedItem) return;

    const rect = canvasRef.value.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Проверяем, попали ли мы по иконке на траектории
    const clickedItem = getItemAtPosition(items.value, mouseX, mouseY, 'path');

    if (clickedItem && clickedItem.state === 'path') {
      techDebug('[TechAnimation] Drag started on item:', clickedItem.id);

      // Запоминаем начальные координаты иконки на холсте
      const itemStartX = clickedItem.x;
      const itemStartY = clickedItem.y;

      // Для круговой траектории запоминаем начальный угол
      let dragStartAngle = 0;
      if (state.trajectoryMode === 'circle') {
        dragStartAngle = calculateAngle(mouseX, mouseY, state.centerX, state.centerY);
      }

      // Начинаем драг
      stateManager.setState({
        isDragging: true,
        draggedItem: clickedItem,
        dragStartX: mouseX, // X курсора относительно canvas
        dragStartOffset: state.globalPathOffset,
        dragVelocity: 0,
        dragLastX: event.clientX, // для расчета скорости
        dragLastTime: Date.now(),
      });

      // Сохраняем начальную позицию иконки в самом объекте для удобства
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clickedItem as any).dragStartItemX = itemStartX;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clickedItem as any).dragStartItemY = itemStartY;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clickedItem as any).dragStartAngle = dragStartAngle;

      // Добавляем визуальный эффект зажатия (небольшое увеличение)
      clickedItem.hoverScale = 1.1;

      // Меняем курсор
      if (canvasRef.value) {
        canvasRef.value.style.cursor = 'grabbing';
      }
    }
  };

  // Вспомогательная функция для получения координат из события (mouse или touch)
  // Вспомогательная функция для вычисления угла
  const calculateAngle = (
    x: number,
    y: number,
    centerX: number,
    centerY: number,
  ): number => {
    return Math.atan2(y - centerY, x - centerX);
  };

  // Обработчик mousemove для драга (расширяем существующий)
  const handleMouseMoveForDrag = (event: MouseEvent) => {
    if (!canvasRef.value) return;

    const state = stateManager.getState();

    // Если идет драг - обновляем позицию траектории
    if (state.isDragging && state.draggedItem) {
      const rect = canvasRef.value.getBoundingClientRect();
      const currentMouseX = event.clientX - rect.left;
      const currentMouseY = event.clientY - rect.top;

      let trajectoryDelta = 0;

      if (state.trajectoryMode === 'circle') {
        // Для круга используем угловую логику
        // Вычисляем угол от центра до текущей позиции курсора
        const currentAngle = calculateAngle(
          currentMouseX,
          currentMouseY,
          state.centerX,
          state.centerY,
        );

        // Получаем начальный угол из draggedItem (сохранили при mousedown)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dragStartAngle = (state.draggedItem as any).dragStartAngle || 0;

        // Вычисляем изменение угла
        let angleDelta = currentAngle - dragStartAngle;

        // Нормализуем дельту для правильной работы через 0/2π границу
        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;

        // Конвертируем угол в параметр траектории (0-1)
        // Угол 2π = полный оборот = 1.0 в параметре траектории
        trajectoryDelta = angleDelta / (Math.PI * 2);

        techDebug('[TechAnimation] Circle drag sync', {
          currentAngle: `${((currentAngle * 180) / Math.PI).toFixed(2)}°`,
          dragStartAngle: `${((dragStartAngle * 180) / Math.PI).toFixed(2)}°`,
          angleDelta: `${((angleDelta * 180) / Math.PI).toFixed(2)}°`,
          trajectoryDelta: trajectoryDelta.toFixed(4),
        });
      } else {
        // Для infinity используем линейную логику по X
        const mouseDeltaX = currentMouseX - state.dragStartX;
        const multiplier = DRAG_SYNC_MULTIPLIER_INFINITY;
        trajectoryDelta = (mouseDeltaX / state.canvasWidth) * multiplier;

        techDebug('[TechAnimation] Infinity drag sync', {
          mouseX: currentMouseX,
          mouseDeltaX: mouseDeltaX.toFixed(2),
          trajectoryDelta: trajectoryDelta.toFixed(4),
        });
      }

      // Новый offset относительно начального
      const newOffset = state.dragStartOffset + trajectoryDelta;

      // Расчитываем текущую скорость (пиксели/мс в units/мс)
      const currentTime = Date.now();
      const deltaTime = Math.max(currentTime - state.dragLastTime, 1); // избегаем деления на 0
      const pixelsDeltaSinceLastFrame = event.clientX - state.dragLastX;

      // Чувствительность для расчета скорости (примерно)
      const sensitivity =
        state.trajectoryMode === 'infinity'
          ? 0.0005 // меньшая чувствительность для бесконечности
          : 0.0008; // большая для круга

      const currentVelocity = (pixelsDeltaSinceLastFrame * sensitivity) / deltaTime;

      // Обновляем globalPathOffset и сохраняем текущую скорость
      stateManager.setState({
        globalPathOffset: newOffset,
        dragVelocity: currentVelocity,
        dragLastX: event.clientX,
        dragLastTime: currentTime,
      });

      return;
    }
  };

  // Обработчик touchstart
  const handleTouchStart = (event: TouchEvent) => {
    if (!canvasRef.value || event.touches.length === 0) return;

    const state = stateManager.getState();
    const rect = canvasRef.value.getBoundingClientRect();
    const touch = event.touches[0]!;
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    // Сохраняем координаты касания для использования в touchend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lastTouchX = touch.clientX;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lastTouchY = touch.clientY;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lastTouchCanvasX = touchX;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lastTouchCanvasY = touchY;

    // Не начинаем драг если идет анимация детального вида
    if (state.isAnimatingDetail) return;

    const rect2 = canvasRef.value.getBoundingClientRect();
    const touch2 = event.touches[0]!;
    const touchX2 = touch2.clientX - rect2.left;
    const touchY2 = touch2.clientY - rect2.top;

    // Проверяем, попали ли мы по иконке на траектории
    const clickedItem = getItemAtPosition(items.value, touchX2, touchY2, 'path');

    if (clickedItem && clickedItem.state === 'path' && !state.selectedItem) {
      event.preventDefault(); // Только если по иконке
      techDebug('[TechAnimation] Touch started on item:', clickedItem.id);

      // Запоминаем начальные координаты для проверки порога драга
      const itemStartX = clickedItem.x;
      const itemStartY = clickedItem.y;

      // Для круговой траектории запоминаем начальный угол
      let dragStartAngle = 0;
      if (state.trajectoryMode === 'circle') {
        dragStartAngle = calculateAngle(touchX2, touchY2, state.centerX, state.centerY);
      }

      // Сохраняем потенциальное начало драга, но не начинаем реальный драг до превышения порога
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clickedItem as any).touchStartX = touch2.clientX;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clickedItem as any).touchStartY = touch2.clientY;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clickedItem as any).dragStartItemX = itemStartX;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clickedItem as any).dragStartItemY = itemStartY;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clickedItem as any).dragStartAngle = dragStartAngle;

      // Отмечаем, что у нас есть потенциальный драг
      stateManager.setState({
        draggedItem: clickedItem,
        dragStartX: touchX2,
        dragStartOffset: state.globalPathOffset,
        dragVelocity: 0,
        dragLastX: touch2.clientX,
        dragLastTime: Date.now(),
      });

      // Добавляем визуальный эффект зажатия
      clickedItem.hoverScale = 1.1;
    }
    // Если не по иконке — не мешаем скроллу
  };

  // Обработчик touchmove
  const handleTouchMove = (event: TouchEvent) => {
    if (!canvasRef.value || event.touches.length === 0) return;

    const state = stateManager.getState();
    const touch = event.touches[0]!;

    // Если есть потенциальный драг, проверяем, превышен ли порог
    if (state.draggedItem && !state.isDragging) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const touchStartX = (state.draggedItem as any).touchStartX || touch.clientX;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const touchStartY = (state.draggedItem as any).touchStartY || touch.clientY;

      const distX = touch.clientX - touchStartX;
      const distY = touch.clientY - touchStartY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      // Если превышен порог - начинаем реальный драг
      if (distance > DRAG_START_THRESHOLD) {
        event.preventDefault();
        techDebug('[TechAnimation] Touch drag threshold exceeded, starting drag');

        stateManager.setState({
          isDragging: true,
        });
      } else {
        // Еще не превышен порог, не предотвращаем скролл
        return;
      }
    }

    // Если идет реальный драг - предотвращаем скролл и обновляем позицию
    if (state.isDragging && state.draggedItem) {
      event.preventDefault();

      const rect = canvasRef.value.getBoundingClientRect();
      const currentTouchX = touch.clientX - rect.left;
      const currentTouchY = touch.clientY - rect.top;

      let trajectoryDelta = 0;

      if (state.trajectoryMode === 'circle') {
        // Для круга используем угловую логику
        const currentAngle = calculateAngle(
          currentTouchX,
          currentTouchY,
          state.centerX,
          state.centerY,
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dragStartAngle = (state.draggedItem as any).dragStartAngle || 0;

        let angleDelta = currentAngle - dragStartAngle;
        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;

        trajectoryDelta = angleDelta / (Math.PI * 2);
      } else {
        // Для infinity используем линейную логику по X
        const touchDeltaX = currentTouchX - state.dragStartX;
        const multiplier = DRAG_SYNC_MULTIPLIER_INFINITY;
        trajectoryDelta = (touchDeltaX / state.canvasWidth) * multiplier;
      }

      const newOffset = state.dragStartOffset + trajectoryDelta;

      // Расчитываем скорость
      const currentTime = Date.now();
      const deltaTime = Math.max(currentTime - state.dragLastTime, 1);
      const pixelsDeltaSinceLastFrame = touch.clientX - state.dragLastX;

      const sensitivity = state.trajectoryMode === 'infinity' ? 0.0005 : 0.0008;
      const currentVelocity = (pixelsDeltaSinceLastFrame * sensitivity) / deltaTime;

      // Обновляем состояние
      stateManager.setState({
        globalPathOffset: newOffset,
        dragVelocity: currentVelocity,
        dragLastX: touch.clientX,
        dragLastTime: currentTime,
      });
    }
  };

  // Обработчик touchend/touchcancel
  const handleTouchEnd = () => {
    const state = stateManager.getState();
    const rect = canvasRef.value?.getBoundingClientRect();

    // Получаем сохраненные координаты касания
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const touchCanvasX = (window as any).__lastTouchCanvasX || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const touchCanvasY = (window as any).__lastTouchCanvasY || 0;

    if (state.draggedItem) {
      // Если это был реальный драг
      if (state.isDragging) {
        techDebug('[TechAnimation] Touch drag ended');
        state.draggedItem.hoverScale = 1.0;
      } else {
        // Если это был просто тап (под порогом) - обрабатываем как клик
        techDebug('[TechAnimation] Touch tap detected on item');

        // Проверяем, попали ли мы по кнопке закрытия (если открана детальная панель)
        if (state.selectedItem && rect) {
          const angle = -35 * (Math.PI / 180);
          const baseEndDiameter = Math.min(DETAIL_ITEM_WIDTH, DETAIL_ITEM_HEIGHT);
          const radius =
            calculateDetailEndDiameter(
              state.trajectoryMode,
              state.canvasWidth,
              baseEndDiameter,
            ) / 2;
          const buttonSize = calculateCloseButtonSize(radius * 2);
          const closeButtonX = state.centerX + radius * Math.cos(angle);
          const closeButtonY = state.centerY + radius * Math.sin(angle);

          const dx = touchCanvasX - closeButtonX;
          const dy = touchCanvasY - closeButtonY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          techDebug('[TechAnimation] Touch close button check on item', {
            touchCanvasX: touchCanvasX.toFixed(2),
            touchCanvasY: touchCanvasY.toFixed(2),
            closeButtonX: closeButtonX.toFixed(2),
            closeButtonY: closeButtonY.toFixed(2),
            distance: dist.toFixed(2),
            buttonRadius: (buttonSize / 2).toFixed(2),
            hit: dist <= buttonSize / 2,
          });

          if (dist <= buttonSize / 2) {
            stateManager.exitDetailedView(items.value);
          }
        } else if (state.draggedItem.state === 'path' && !state.selectedItem) {
          // Просто тап на иконке - открываем детальный вид
          stateManager.enterDetailedView(state.draggedItem, items.value);
        }
      }

      state.draggedItem.hoverScale = 1.0;
    } else if (state.selectedItem && rect) {
      // Даже если не было draggedItem, проверяем клик на крестик закрытия
      techDebug('[TechAnimation] Touch tap detected, checking close button');

      const angle = -35 * (Math.PI / 180);
      const baseEndDiameter = Math.min(DETAIL_ITEM_WIDTH, DETAIL_ITEM_HEIGHT);
      const radius =
        calculateDetailEndDiameter(
          state.trajectoryMode,
          state.canvasWidth,
          baseEndDiameter,
        ) / 2;
      const buttonSize = calculateCloseButtonSize(radius * 2);
      const closeButtonX = state.centerX + radius * Math.cos(angle);
      const closeButtonY = state.centerY + radius * Math.sin(angle);

      const dx = touchCanvasX - closeButtonX;
      const dy = touchCanvasY - closeButtonY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      techDebug('[TechAnimation] Touch close button check (no item)', {
        touchCanvasX: touchCanvasX.toFixed(2),
        touchCanvasY: touchCanvasY.toFixed(2),
        closeButtonX: closeButtonX.toFixed(2),
        closeButtonY: closeButtonY.toFixed(2),
        distance: dist.toFixed(2),
        buttonRadius: (buttonSize / 2).toFixed(2),
        hit: dist <= buttonSize / 2,
      });

      if (dist <= buttonSize / 2) {
        stateManager.exitDetailedView(items.value);
      }
    }

    // Очищаем состояние драга
    stateManager.setState({
      isDragging: false,
      draggedItem: null,
    });

    // Очищаем временные переменные
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lastTouchX = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lastTouchY = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lastTouchCanvasX = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lastTouchCanvasY = null;
  };

  // Обработчик mouseup - конец драга
  const handleMouseUp = () => {
    const state = stateManager.getState();

    if (state.isDragging) {
      techDebug('[TechAnimation] Drag ended');

      // Убираем визуальный эффект зажатия
      if (state.draggedItem) {
        state.draggedItem.hoverScale = 1.0;
      }

      // Заканчиваем драг
      stateManager.setState({
        isDragging: false,
        draggedItem: null,
      });

      // Восстанавливаем курсор
      if (canvasRef.value) {
        canvasRef.value.style.cursor = 'default';
      }
    }
  };

  // Обновление позиций элементов на траектории
  const updateItemsPositions = (state: AnimationState) => {
    items.value.forEach((item, index) => {
      if (item.state === 'path') {
        // Все элементы движутся по траектории непрерывно
        const currentPosition = (item.pathPosition + state.globalPathOffset) % 1;

        let point;
        if (state.trajectoryMode === 'circle') {
          // Режим круга - простое движение по окружности
          // Используем больший коэффициент для мобиля чтобы орбита была больше
          const circleRadius = state.infinityScale * 0.95;
          point = calculateCirclePoint(
            currentPosition,
            circleRadius,
            state.centerX,
            state.centerY,
          );

          // В режиме круга нет эффектов глубины
          item.depthScale = 1.0;
          item.depthOpacity = 1.0;
          item.depthBlur = 0;
          item.depthSaturation = 1.0;
        } else {
          // Режим бесконечности - сложная траектория с эффектами
          const t = positionToParameter(currentPosition);
          point = calculateInfinityPoint(
            t,
            state.infinityScale,
            state.centerX,
            state.centerY,
          );

          // Вычисляем масштаб глубины для эффекта переднего/заднего плана
          item.depthScale = calculateDepthScale(currentPosition);

          // Вычисляем прозрачность для эффекта глубины
          item.depthOpacity = calculateDepthOpacity(currentPosition);

          // Вычисляем размытие для эффекта глубины
          item.depthBlur = calculateDepthBlur(currentPosition);

          // Вычисляем насыщенность для эффекта глубины
          item.depthSaturation = calculateDepthSaturation(currentPosition);
        }

        item.targetX = point.x;
        item.targetY = point.y;

        // Отладка при драге
        if (index === 0 && state.isDragging) {
          techDebug('[UpdatePositions] Item 0', {
            offset: state.globalPathOffset.toFixed(4),
            currentPosition: currentPosition.toFixed(4),
            targetX: item.targetX.toFixed(1),
            targetY: item.targetY.toFixed(1),
          });
        }

        // НЕ обновляем pathPosition для элементов на траектории - она фиксирована
      } else if (item.state === 'transition') {
        // Элемент в переходе
        const direction = stateManager.getAnimationDirection();
        if (direction === 'in') {
          // Движемся к центру
          item.targetX = state.centerX;
          item.targetY = state.centerY;

          // При движении в центр плавно убираем все depth-эффекты
          const targetDepthScale = 1.0;
          const targetDepthOpacity = 1.0;
          const targetDepthBlur = 0;
          const targetDepthSaturation = 1.0;

          const transitionSpeed = 0.1; // Скорость интерполяции
          item.depthScale += (targetDepthScale - item.depthScale) * transitionSpeed;
          item.depthOpacity += (targetDepthOpacity - item.depthOpacity) * transitionSpeed;
          item.depthBlur += (targetDepthBlur - item.depthBlur) * transitionSpeed;
          item.depthSaturation +=
            (targetDepthSaturation - item.depthSaturation) * transitionSpeed;
        } else if (direction === 'out') {
          // Возвращаемся на текущую позицию на траектории
          // Используем pathPosition который продолжал обновляться пока элемент был в центре
          const currentPosition = (item.pathPosition + state.globalPathOffset) % 1;

          let point;
          if (state.trajectoryMode === 'circle') {
            // Используем больший коэффициент для мобиля чтобы орбита была больше
            const circleRadius = state.infinityScale * 0.95;
            point = calculateCirclePoint(
              currentPosition,
              circleRadius,
              state.centerX,
              state.centerY,
            );

            // В режиме круга нет эффектов глубины
            item.depthScale = 1.0;
            item.depthOpacity = 1.0;
            item.depthBlur = 0;
            item.depthSaturation = 1.0;
          } else {
            const t = positionToParameter(currentPosition);
            point = calculateInfinityPoint(
              t,
              state.infinityScale,
              state.centerX,
              state.centerY,
            );

            // Рассчитываем целевые эффекты глубины для текущей позиции на траектории
            const targetDepthScale = calculateDepthScale(currentPosition);
            const targetDepthOpacity = calculateDepthOpacity(currentPosition);
            const targetDepthBlur = calculateDepthBlur(currentPosition);
            const targetDepthSaturation = calculateDepthSaturation(currentPosition);

            // Плавно интерполируем к целевым значениям
            const transitionSpeed = 0.1; // Скорость интерполяции
            item.depthScale += (targetDepthScale - item.depthScale) * transitionSpeed;
            item.depthOpacity +=
              (targetDepthOpacity - item.depthOpacity) * transitionSpeed;
            item.depthBlur += (targetDepthBlur - item.depthBlur) * transitionSpeed;
            item.depthSaturation +=
              (targetDepthSaturation - item.depthSaturation) * transitionSpeed;
          }

          item.targetX = point.x;
          item.targetY = point.y;
        }
      } else if (item.state === 'detailed') {
        // Детализированный элемент остается в центре
        item.targetX = state.centerX;
        item.targetY = state.centerY;
      }
    });
  };

  // Основной цикл анимации
  const animate = (timestamp: number) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (!ctx.value || !canvasRef.value) return;

    const state = stateManager.getState();

    // Первый кадр - логируем инициализацию
    if (!animationFrameId || deltaTime === 0) {
      techDebug('[TechAnimation] animate frame', {
        trajectory: state.trajectoryMode,
        itemsCount: items.value.length,
        canvasSize: { width: state.canvasWidth, height: state.canvasHeight },
        offset: state.globalPathOffset,
      });
    }

    // Очищаем холст
    ctx.value.clearRect(0, 0, state.canvasWidth, state.canvasHeight);

    // Обновляем глобальное смещение
    if (!state.isDragging) {
      // Если есть инерция после отпускания мыши - применяем её с затуханием
      if (Math.abs(state.dragVelocity) > DRAG_INERTIA_MIN_VELOCITY) {
        // Применяем инерцию и постепенно её затухаем к стандартной скорости
        const newOffset = state.globalPathOffset + state.dragVelocity * deltaTime;
        let newVelocity = state.dragVelocity * DRAG_INERTIA_DECELERATION;

        // Если скорость стала достаточно близка к стандартной - переходим обратно к обычной анимации
        if (Math.abs(newVelocity - INFINITY_MOVEMENT_SPEED) < DRAG_INERTIA_MIN_VELOCITY) {
          newVelocity = 0; // Обнуляем инерцию, чтобы вернуться к обычной анимации
        }

        stateManager.setState({
          globalPathOffset: newOffset,
          dragVelocity: newVelocity,
        });
      } else {
        // Обычное вращение со стандартной скоростью, когда нет инерции
        stateManager.setState({
          globalPathOffset: state.globalPathOffset + INFINITY_MOVEMENT_SPEED * deltaTime,
          dragVelocity: 0,
        });
      }
    }

    // Обновляем анимацию детализации
    stateManager.updateDetailAnimation(deltaTime, items.value);

    // Обновляем блюр фона
    const targetBlur = state.selectedItem ? 5 : 0;
    backgroundBlur.value += (targetBlur - backgroundBlur.value) * 0.1;

    // ВСЕГДА обновляем позиции элементов на траектории
    updateItemsPositions(stateManager.getState());

    // Обновляем позиции частиц с шлейфом и проверяем время жизни
    const currentState = stateManager.getState();
    const currentTime = timestamp;

    for (let i = 0; i < particles.value.length; i++) {
      const particle = particles.value[i];
      if (!particle) continue;

      const isAlive = updateParticle(
        particle,
        deltaTime,
        currentState.centerX,
        currentState.centerY,
        currentState.infinityScale,
        PARTICLE_CONFIG,
        currentTime,
        currentState.trajectoryMode,
      );

      // Если частица умерла, создаем новую на её месте
      if (!isAlive) {
        particles.value[i] = createParticle(
          i,
          currentState.centerX,
          currentState.centerY,
          currentState.infinityScale,
          PARTICLE_CONFIG,
          currentTime,
          currentState.trajectoryMode,
        );
      }
    }

    // Плавное движение к целевой позиции
    items.value.forEach(item => {
      // Во время драга или инерции делаем движение мгновенным для элементов на траектории
      const state = stateManager.getState();
      const isDraggingActive = state.isDragging;
      const isInertiaActive = Math.abs(state.dragVelocity) > DRAG_INERTIA_MIN_VELOCITY;

      const speed =
        (isDraggingActive || isInertiaActive) && item.state === 'path'
          ? 1.0 // мгновенное обновление при драге или инерции
          : item.state === 'transition'
            ? 0.3
            : 0.1;

      item.x += (item.targetX - item.x) * speed;
      item.y += (item.targetY - item.y) * speed;

      // Плавная интерполяция поворота при ховере
      // Поворот применяется ТОЛЬКО к элементам на траектории (state === 'path')
      if (item.state === 'path') {
        const targetRotation = item.hover ? 1 : 0;
        const rotationSpeed = 0.15; // Скорость интерполяции поворота
        item.hoverRotation += (targetRotation - item.hoverRotation) * rotationSpeed;
      } else {
        // Для элементов в transition или detailed состоянии - всегда 0
        item.hoverRotation = 0;
      }
    });

    // Рисуем частицы БЕЗ блюра
    particles.value.forEach(particle => {
      drawParticleWithTrail(ctx.value!, particle);
    });

    // Определяем, применять ли блюр (только для десктопа)
    const blurEnabled = responsive.value.desktop;

    ctx.value.save();
    ctx.value.filter = blurEnabled ? `blur(${backgroundBlur.value}px)` : 'none';

    drawInfinityPath(
      ctx.value,
      state.centerX,
      state.centerY,
      state.infinityScale,
      COLORS.orbit,
      state.trajectoryMode,
    );

    // Сортируем элементы для правильного z-index
    const pathItems = items.value.filter(item => item.state === 'path');
    const detailedItem = items.value.find(item => item.state === 'detailed');
    const transitionItems = items.value.filter(item => item.state === 'transition');

    // Сортируем элементы на траектории по глубине (задний план рисуется первым)
    pathItems.sort((a, b) => a.depthScale - b.depthScale);

    // Разделяем на задний и передний план для эффекта глубины с заголовком
    const backItems = pathItems.filter(item => item.depthScale < 1.0);
    const frontItems = pathItems.filter(item => item.depthScale >= 1.0);

    // Рисуем задний план
    backItems.forEach(item => {
      drawPathIcon(ctx.value!, item, item.hover, state.centerX, state.centerY);
    });

    // Рисуем передний план
    frontItems.forEach(item => {
      drawPathIcon(ctx.value!, item, item.hover, state.centerX, state.centerY);
    });

    // Рисуем элемент в переходе (если не детализированный)
    transitionItems.forEach(item => {
      // Все переходящие элементы, кроме выбранного, рисуем как на траектории
      const isSelectedTransition = state.selectedItem?.id === item.id;
      if (!isSelectedTransition) {
        drawPathIcon(ctx.value!, item, item.hover, state.centerX, state.centerY);
      }
    });

    ctx.value.restore(); // Восстанавливаем фильтр

    // Рисуем детализированный элемент ПОВЕРХ ВСЕХ
    if (detailedItem) {
      drawDetailedItem(
        ctx.value!,
        detailedItem,
        detailedItem.hover,
        state.centerX,
        state.centerY,
        closeButtonHover.value && state.selectedItem?.id === detailedItem.id,
        backgroundBlur.value,
        state.trajectoryMode,
        state.canvasWidth,
      );
    }

    // Рисуем элемент в переходе к детализации
    const selectedTransitionItem = transitionItems.find(
      item => item.id === state.selectedItem?.id && item.detailProgress > 0,
    );
    if (selectedTransitionItem) {
      drawDetailedItem(
        ctx.value!,
        selectedTransitionItem,
        selectedTransitionItem.hover,
        state.centerX,
        state.centerY,
        closeButtonHover.value,
        backgroundBlur.value,
        state.trajectoryMode,
        state.canvasWidth,
      );
    }

    // Продолжаем анимацию только если не на паузе
    if (!isAnimationPaused) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      animationFrameId = 0;
    }
  };

  // Запуск анимации
  const startAnimation = () => {
    if (!canvasRef.value) {
      techDebug('[TechAnimation] Canvas ref is not available');
      return;
    }

    if (animationFrameId) {
      techDebug('[TechAnimation] Animation already running');
      return;
    }

    // Проверяем, не на паузе ли анимация
    if (isAnimationPaused) {
      techDebug('[TechAnimation] Animation is paused, skipping start');
      return;
    }

    if (!ctx.value) {
      ctx.value = canvasRef.value.getContext('2d', { alpha: true });
      if (!ctx.value) {
        techError('[TechAnimation] Failed to get canvas context');
        return;
      }
    }

    const state = stateManager.getState();
    techDebug('[TechAnimation] Starting animation', {
      trajectoryMode: state.trajectoryMode,
      canvasSize: { width: state.canvasWidth, height: state.canvasHeight },
      itemsCount: items.value.length,
    });

    lastTimestamp = 0;
    updateCanvasSize(true);

    // Проверяем, что элементы созданы
    if (items.value.length === 0) {
      techWarn('[TechAnimation] No items initialized, calling initializeItems');
      initializeItems();
    }

    animationFrameId = requestAnimationFrame(animate);

    // Добавляем обработчики событий
    canvasRef.value.addEventListener('mousemove', handleMouseMove);
    canvasRef.value.addEventListener('click', handleClick);
    canvasRef.value.addEventListener('mousedown', handleMouseDown);
    // mouseup вешаем на document, чтобы ловить отпускание мыши вне canvas
    document.addEventListener('mouseup', handleMouseUp);

    // Touch события для мобильных устройств
    canvasRef.value.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvasRef.value.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  };

  // Остановка анимации
  const stopAnimation = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }

    if (canvasRef.value) {
      canvasRef.value.removeEventListener('mousemove', handleMouseMove);
      canvasRef.value.removeEventListener('click', handleClick);
      canvasRef.value.removeEventListener('mousedown', handleMouseDown);
      canvasRef.value.removeEventListener('touchstart', handleTouchStart);
      canvasRef.value.removeEventListener('touchmove', handleTouchMove);
    }

    // Удаляем слушатели с document
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchcancel', handleTouchEnd);
  };

  // Пауза анимации (при скрытии из viewport)
  const pauseAnimation = () => {
    techDebug('[TechAnimation] Pausing animation (element hidden)');
    isAnimationPaused = true;
    stopAnimation();
  };

  // Возобновление анимации (при появлении в viewport)
  const resumeAnimation = () => {
    techDebug('[TechAnimation] Resuming animation (element visible)');
    isAnimationPaused = false;
    startAnimation();
  };

  // Установка режима траектории
  const setTrajectoryMode = (mode: 'infinity' | 'circle') => {
    techDebug('[TechAnimation] Setting trajectory mode:', mode);
    stateManager.setState({ trajectoryMode: mode });

    // Переинициализируем элементы и частицы для нового режима
    initializeItems();
  };

  // Инициализация траектории на основе размера экрана
  const initializeTrajectoryMode = () => {
    const targetMode = responsive.value.desktop ? 'infinity' : 'circle';
    techDebug('[TechAnimation] initializeTrajectoryMode called', {
      isDesktop: responsive.value.desktop,
      targetMode,
      containerSize: {
        width: containerRef.value?.getBoundingClientRect().width,
        height: containerRef.value?.getBoundingClientRect().height,
      },
    });
    setTrajectoryMode(targetMode);
  };

  // Инициализация
  onMounted(async () => {
    await loadImages(technologies.value, loadedImages, isLoading);

    await nextTick();

    // Инициализируем правильный режим траектории на основе текущего размера экрана
    initializeTrajectoryMode();

    // Инициализируем обсервер видимости для автоматической паузы/возобновления
    initVisibilityObserver(
      () => {
        // Колбек при появлении в viewport
        resumeAnimation();
      },
      () => {
        // Колбек при скрытии из viewport
        pauseAnimation();
      },
    );

    // Запускаем анимацию на обоих режимах (десктоп и мобиль)
    let stopWatcher: ReturnType<typeof watch> | null = null;
    stopWatcher = watch(
      canvasRef,
      newCanvas => {
        if (newCanvas && !animationFrameId && !isAnimationPaused) {
          if (stopWatcher) {
            stopWatcher();
            stopWatcher = null;
          }
          startAnimation();
        }
      },
      { immediate: true },
    );

    // Подстраховка: если watch не сработал через 500мс, запустить анимацию явно
    setTimeout(() => {
      if (stopWatcher) {
        stopWatcher();
        stopWatcher = null;
      }
      if (canvasRef.value && !animationFrameId && !isAnimationPaused) {
        startAnimation();
      }
    }, 500);
  });
  onUnmounted(() => {
    stopAnimation();
  });

  // Реакция на изменение размера экрана: переключаем режим траектории
  watch(
    () => responsive.value.desktop,
    newValue => {
      const targetMode = newValue ? 'infinity' : 'circle';
      setTrajectoryMode(targetMode);
      // Анимация продолжает работать, только режим траектории меняется
    },
  );

  // Реакция на изменение размера окна с debounce
  let resizeTimeout: number | undefined;
  const handleResize = () => {
    if (resizeTimeout !== undefined) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = window.setTimeout(() => {
      updateCanvasSize(false);
      updateIconSizes(); // Пересчитываем размер иконок при resize
      resizeTimeout = undefined;
    }, 150);
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (resizeTimeout !== undefined) {
      clearTimeout(resizeTimeout);
    }
  });

  return {
    canvasRef,
    isLoading,
    closeDetail: () => {
      techDebug('[TechAnimation] Manual close detail called');
      stateManager.exitDetailedView(items.value);
    },
    setTrajectoryMode,
    getTrajectoryMode: () => {
      return stateManager.getState().trajectoryMode;
    },
  };
}
