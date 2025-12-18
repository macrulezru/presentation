import { ref, type Ref } from 'vue'

export interface DraggedItem {
  index: number
  element: HTMLElement
  clone: HTMLElement
  initialRect: DOMRect
}

export interface DragState {
  draggedItem: Ref<DraggedItem | null>
  placeholderIndex: Ref<number | null>
  isDragging: Ref<boolean>
  dragY: Ref<number>
  itemStyles: Ref<Record<number, { transform: string; transition: string }>>
}

export interface UseDragStateReturn extends DragState {
  reset: () => void
}

export function useDragState(): UseDragStateReturn {
  const draggedItem = ref<DraggedItem | null>(null)
  const placeholderIndex = ref<number | null>(null)
  const isDragging = ref(false)
  const dragY = ref(0)
  const itemStyles = ref<Record<number, { transform: string; transition: string }>>({})

  const reset = () => {
    draggedItem.value = null
    placeholderIndex.value = null
    isDragging.value = false
    dragY.value = 0
    itemStyles.value = {}
  }

  return {
    draggedItem,
    placeholderIndex,
    isDragging,
    dragY,
    itemStyles,
    reset,
  }
}
