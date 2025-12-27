import { type Ref } from 'vue';

import type { DragAnimations, UseDragStateReturn } from './types';

export function useDragAnimations(
  itemsRefs: Ref<HTMLElement[]>,
  dragState: UseDragStateReturn, // Изменено с DragState на UseDragStateReturn
): DragAnimations {
  const { itemStyles } = dragState;

  /**
   * Анимирует перемещение элементов при перетаскивании
   */
  const animateItems = (fromIndex: number, toIndex: number): void => {
    if (fromIndex === toIndex) return;

    const newStyles: Record<number, { transform: string; transition: string }> = {};
    const gap = 12;

    // Получаем высоты всех элементов
    const itemHeights: number[] = [];
    for (let i = 0; i < itemsRefs.value.length; i++) {
      const item = itemsRefs.value[i];
      itemHeights.push(item?.offsetHeight || 74);
    }

    // Применяем анимацию к каждому элементу
    for (let i = 0; i < itemsRefs.value.length; i++) {
      if (i === fromIndex) continue;

      let translateY = 0;

      if (fromIndex < toIndex) {
        // Перемещаем вниз: элементы между fromIndex и toIndex двигаем вверх
        if (i > fromIndex && i <= toIndex) {
          translateY = -(itemHeights[fromIndex]! + gap);
        }
      } else {
        // Перемещаем вверх: элементы между toIndex и fromIndex двигаем вниз
        if (i >= toIndex && i < fromIndex) {
          translateY = itemHeights[fromIndex]! + gap;
        }
      }

      newStyles[i] = {
        transform: translateY !== 0 ? `translateY(${translateY}px)` : 'translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }

    itemStyles.value = newStyles;
  };

  /**
   * Сбрасывает стили элементов после перетаскивания
   */
  const resetItemStyles = (): void => {
    itemsRefs.value.forEach(item => {
      if (item) {
        item.style.opacity = '';
        item.style.transform = '';
        item.style.transition = '';
        item.style.visibility = '';
        item.classList.remove('section-editor-item--dragging-original');
      }
    });
  };

  /**
   * Завершает анимацию перетаскивания
   */
  const finishDragAnimation = (
    itemsRefs: Ref<HTMLElement[]>,
    draggedItem: UseDragStateReturn['draggedItem'],
    placeholderIndex: UseDragStateReturn['placeholderIndex'],
  ): void => {
    if (!draggedItem.value) return;

    // Сбрасываем трансформации элементов
    for (let i = 0; i < itemsRefs.value.length; i++) {
      const item = itemsRefs.value[i];
      if (item) {
        item.style.transform = '';
        item.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      }
    }

    // Восстанавливаем оригинальный элемент
    const originalElement = draggedItem.value.element;
    if (originalElement) {
      originalElement.classList.remove('section-editor-item--dragging-original');
      originalElement.style.visibility = '';
      originalElement.style.opacity = '1';
      originalElement.style.transition = 'opacity 0.3s ease';
    }

    // Анимируем и удаляем клон
    const { clone } = draggedItem.value;
    if (clone) {
      if (
        placeholderIndex.value !== null &&
        placeholderIndex.value !== draggedItem.value.index
      ) {
        const finalElement = itemsRefs.value[placeholderIndex.value];
        if (finalElement) {
          const finalRect = finalElement.getBoundingClientRect();
          clone.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
          clone.style.transform = 'scale(1) rotate(0deg)';
          clone.style.left = `${finalRect.left}px`;
          clone.style.top = `${finalRect.top}px`;
          clone.style.opacity = '0';
        }
      } else {
        clone.style.transition = 'opacity 0.2s ease';
        clone.style.opacity = '0';
      }

      setTimeout(() => {
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      }, 400);
    }
  };

  return {
    animateItems,
    resetItemStyles,
    finishDragAnimation,
  };
}
