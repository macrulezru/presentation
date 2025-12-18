import { type Ref } from 'vue'
import type { UseDragStateReturn, DraggedItem } from './use-drag-state'

export interface DragCloneMethods {
  createDragClone: (index: number) => HTMLElement | null
  setupDraggedItem: (index: number, clone: HTMLElement) => DraggedItem | null
  removeDragClone: () => void
}

export function useDragClone(
  itemsRefs: Ref<HTMLElement[]>,
  containerRef: Ref<HTMLElement | undefined>,
  dragState: UseDragStateReturn, // Изменено с DragState на UseDragStateReturn
): DragCloneMethods {
  const { draggedItem } = dragState

  /**
   * Создает клон перетаскиваемого элемента
   */
  const createDragClone = (index: number): HTMLElement | null => {
    const element = itemsRefs.value[index]
    if (!element || !containerRef.value) return null

    const elementRect = element.getBoundingClientRect()
    const clone = element.cloneNode(true) as HTMLElement

    // Настраиваем стили клона
    clone.classList.add('section-editor-item--dragging-clone')
    clone.classList.remove(
      'section-editor-item--fixed',
      'section-editor-item--placeholder',
      'section-editor-item--dragging',
    )

    Object.assign(clone.style, {
      position: 'fixed',
      width: `${elementRect.width}px`,
      height: `${elementRect.height}px`,
      left: `${elementRect.left}px`,
      top: `${elementRect.top}px`,
      zIndex: '10000',
      cursor: 'grabbing',
      pointerEvents: 'none',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
      transform: 'scale(1.05) rotate(1deg)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    })

    document.body.appendChild(clone)
    return clone
  }

  /**
   * Устанавливает состояние для перетаскиваемого элемента
   */
  const setupDraggedItem = (index: number, clone: HTMLElement): DraggedItem | null => {
    const element = itemsRefs.value[index]
    if (!element || !containerRef.value) return null

    const elementRect = element.getBoundingClientRect()

    element.classList.add('section-editor-item--dragging-original')
    element.style.visibility = 'hidden'
    element.style.opacity = '0'

    return {
      index,
      element,
      clone,
      initialRect: elementRect,
    }
  }

  /**
   * Удаляет клон элемента
   */
  const removeDragClone = (): void => {
    if (draggedItem.value?.clone && draggedItem.value.clone.parentNode) {
      draggedItem.value.clone.parentNode.removeChild(draggedItem.value.clone)
    }
  }

  return {
    createDragClone,
    setupDraggedItem,
    removeDragClone,
  }
}
