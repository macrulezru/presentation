import { techDebug, techWarn } from './utils';

import type { TechItem, AnimationState } from './types';

export class StateManager {
  private state: AnimationState;
  private animationDirection: 'in' | 'out' | null = null;

  constructor(initialState: AnimationState) {
    this.state = { ...initialState };
  }

  // Переключение в детализированный вид
  enterDetailedView(item: TechItem, allItems: TechItem[]): void {
    techDebug('[StateManager] Entering detailed view for item:', item.id);
    this.state.selectedItem = item;
    this.state.isAnimatingDetail = true;
    this.animationDirection = 'in'; // Устанавливаем направление "вход"

    // Сохраняем оригинальные позиции ВСЕХ элементов
    allItems.forEach(i => {
      i.originalPathPosition = i.pathPosition;
    });

    // Обновляем состояния всех элементов
    allItems.forEach(i => {
      if (i.id === item.id) {
        i.state = 'transition';
        i.detailProgress = 0; // Начинаем с 0 (вход)
        i.hoverRotation = 0; // Сбрасываем поворот при начале детализации
        i.hover = false; // Сбрасываем статус ховера
        // Устанавливаем цель в центр для плавного перемещения
        i.targetX = this.state.centerX;
        i.targetY = this.state.centerY;
        techDebug('[StateManager] Item transition to center:', i.id);
      } else {
        i.state = 'path';
        i.detailProgress = 0;
        i.hover = false; // Сбрасываем статус ховера для остальных
      }
    });

    // Перераспределяем оставшиеся элементы на траектории
    this.redistributePathItems(allItems);
  }

  // Возврат на орбиту
  exitDetailedView(allItems: TechItem[]): void {
    if (!this.state.selectedItem) {
      techWarn('[StateManager] No selected item to exit');
      return;
    }

    techDebug(
      '[StateManager] Exiting detailed view for item:',
      this.state.selectedItem.id,
    );

    const selectedItem = allItems.find(i => i.id === this.state.selectedItem!.id);
    if (!selectedItem) return;

    this.state.isAnimatingDetail = true;
    this.animationDirection = 'out'; // Устанавливаем направление "выход"

    // Переводим элемент в состояние transition
    selectedItem.state = 'transition';
    // Для выхода устанавливаем progress в 1 (полностью детализирован)
    selectedItem.detailProgress = 1;
    selectedItem.hoverRotation = 0; // Сбрасываем поворот при выходе из детализации
    selectedItem.hover = false; // Сбрасываем статус ховера
    techDebug('[StateManager] Item transition to orbit:', selectedItem.id);

    // Восстанавливаем оригинальные позиции для всех элементов
    allItems.forEach(i => {
      if (i.originalPathPosition !== undefined) {
        i.pathPosition = i.originalPathPosition;
      }
    });
  }

  // Обновление анимации детализации
  updateDetailAnimation(deltaTime: number, allItems: TechItem[]): void {
    if (!this.state.isAnimatingDetail || !this.animationDirection) return;

    const { selectedItem } = this.state;
    if (!selectedItem) return;

    const item = allItems.find(i => i.id === selectedItem.id);
    if (!item) return;

    const animationSpeed = deltaTime / 400; // 400ms для полной анимации

    if (item.state === 'transition') {
      if (this.animationDirection === 'in') {
        // Вход в детализацию (увеличиваем progress)
        item.detailProgress = Math.min(item.detailProgress + animationSpeed, 1);

        if (item.detailProgress >= 1) {
          item.state = 'detailed';
          this.state.isAnimatingDetail = false;
          this.animationDirection = null;
          techDebug('[StateManager] Transition to detailed complete:', item.id);
        }
      } else if (this.animationDirection === 'out') {
        // Выход из детализации (уменьшаем progress)
        item.detailProgress = Math.max(item.detailProgress - animationSpeed, 0);

        if (item.detailProgress <= 0) {
          // Анимация выхода завершена, возвращаемся на траекторию
          item.state = 'path';
          // Позиция на траектории будет обновлена в основном цикле анимации

          this.state.selectedItem = null;
          this.state.isAnimatingDetail = false;
          this.animationDirection = null;
          techDebug('[StateManager] Transition to path complete:', item.id);
        }
      }

      // Отладочная информация
      if (item.detailProgress > 0 && item.detailProgress < 1) {
        techDebug(
          `[StateManager] ${item.id} progress: ${item.detailProgress.toFixed(2)}, direction: ${this.animationDirection}`,
        );
      }
    }
  }

  // Получение состояния
  getState(): AnimationState {
    return { ...this.state };
  }

  // Установка состояния
  setState(newState: Partial<AnimationState>): void {
    this.state = { ...this.state, ...newState };
  }

  // Получение направления анимации детализации
  getAnimationDirection(): 'in' | 'out' | null {
    return this.animationDirection;
  }

  // Перераспределение элементов на траектории (без выбранного)
  private redistributePathItems(allItems: TechItem[]): void {
    // Фильтруем только элементы на траектории
    const pathItems = allItems.filter(i => i.state === 'path');
    const totalPathItems = pathItems.length;

    if (totalPathItems === 0) return;

    // Равномерно распределяем элементы по траектории
    pathItems.forEach((item, index) => {
      item.pathPosition = index / totalPathItems;
    });

    techDebug(`[StateManager] Redistributed ${totalPathItems} items on path`);
  }
}
