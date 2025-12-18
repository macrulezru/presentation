import { onUnmounted, type Ref } from 'vue'
import { useDragState } from '@/view/composables/use-drag/use-drag-state'
import { useDragEvents } from '@/view/composables/use-drag/use-drag-events'
import { useDragAnimations } from '@/view/composables/use-drag/use-drag-animations'

export interface UseSectionDragReturn {
  draggedItem: ReturnType<typeof useDragState>['draggedItem']
  placeholderIndex: ReturnType<typeof useDragState>['placeholderIndex']
  isDragging: ReturnType<typeof useDragState>['isDragging']
  dragY: ReturnType<typeof useDragState>['dragY']
  itemStyles: ReturnType<typeof useDragState>['itemStyles']
  handleDragStart: (event: MouseEvent | TouchEvent, index: number) => void
  resetDragState: () => void
  cleanupEventListeners: () => void
}

export function useSectionDrag(
  itemsRefs: Ref<HTMLElement[]>,
  containerRef: Ref<HTMLElement | undefined>,
  onOrderChange: (fromIndex: number, toIndex: number) => void,
): UseSectionDragReturn {
  const dragState = useDragState() // Это возвращает UseDragStateReturn (с методом reset)
  const { resetItemStyles } = useDragAnimations(itemsRefs, dragState)
  const { handleDragStart, handleDragMove, handleDragEnd } = useDragEvents(
    itemsRefs,
    containerRef,
    dragState, // Передаем UseDragStateReturn
    onOrderChange,
  )

  /**
   * Полный сброс состояния перетаскивания
   */
  const resetDragState = (): void => {
    // Удаляем клон
    if (
      dragState.draggedItem.value?.clone &&
      dragState.draggedItem.value.clone.parentNode
    ) {
      dragState.draggedItem.value.clone.parentNode.removeChild(
        dragState.draggedItem.value.clone,
      )
    }

    // Сбрасываем стили элементов
    resetItemStyles()

    // Сбрасываем состояние
    dragState.reset()

    // Сбрасываем рефы
    itemsRefs.value.forEach(item => {
      if (item) {
        item.style.opacity = ''
        item.style.transform = ''
        item.style.transition = ''
        item.style.visibility = ''
        item.classList.remove('section-editor-item--dragging-original')
      }
    })
  }

  /**
   * Начинает перетаскивание элемента
   */
  const startDrag = (event: MouseEvent | TouchEvent, index: number): void => {
    handleDragStart(event, index)

    // Добавляем глобальные обработчики
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('touchmove', handleDragMove, { passive: false })
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchend', handleDragEnd)
  }

  /**
   * Удаляет глобальные обработчики событий
   */
  const cleanupEventListeners = (): void => {
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchend', handleDragEnd)
  }

  // Автоматическая очистка при уничтожении компонента
  onUnmounted(() => {
    cleanupEventListeners()
    resetDragState()
  })

  return {
    // Состояние
    draggedItem: dragState.draggedItem,
    placeholderIndex: dragState.placeholderIndex,
    isDragging: dragState.isDragging,
    dragY: dragState.dragY,
    itemStyles: dragState.itemStyles,

    // Методы
    handleDragStart: startDrag,
    resetDragState,
    cleanupEventListeners,
  }
}
