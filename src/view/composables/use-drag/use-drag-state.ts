import { ref } from 'vue'
import type { DraggedItem, UseDragStateReturn } from './types'

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
