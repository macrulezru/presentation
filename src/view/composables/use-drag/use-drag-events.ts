import { type Ref } from 'vue'
import type { UseDragStateReturn } from '@/view/composables/use-drag/use-drag-state'
import { useDragAnimations } from '@/view/composables/use-drag/use-drag-animations'
import { useDragClone } from '@/view/composables/use-drag/use-drag-clone'

export interface DragEventHandlers {
  handleDragStart: (event: MouseEvent | TouchEvent, index: number) => void
  handleDragMove: (event: MouseEvent | TouchEvent) => void
  handleDragEnd: () => void
}

export function useDragEvents(
  itemsRefs: Ref<HTMLElement[]>,
  containerRef: Ref<HTMLElement | undefined>,
  dragState: UseDragStateReturn, // Изменено с DragState на UseDragStateReturn
  onOrderChange?: (fromIndex: number, toIndex: number) => void,
): DragEventHandlers {
  const { draggedItem, placeholderIndex, isDragging, dragY, reset } = dragState // Добавлен reset
  const { animateItems, finishDragAnimation } = useDragAnimations(itemsRefs, dragState)
  const { createDragClone, setupDraggedItem, removeDragClone } = useDragClone(
    itemsRefs,
    containerRef,
    dragState,
  )

  /**
   * Обработчик начала перетаскивания
   */
  const handleDragStart = (event: MouseEvent | TouchEvent, index: number): void => {
    if (isDragging.value) return
    isDragging.value = true

    let clientY: number
    if ('touches' in event && event.touches && event.touches.length > 0) {
      clientY = event.touches[0]!.clientY
    } else {
      clientY = (event as MouseEvent).clientY
    }

    const clone = createDragClone(index)
    if (!clone || !containerRef.value) {
      isDragging.value = false
      return
    }

    const draggedItemData = setupDraggedItem(index, clone)
    if (!draggedItemData) {
      isDragging.value = false
      return
    }

    const containerRect = containerRef.value.getBoundingClientRect()
    draggedItem.value = draggedItemData
    placeholderIndex.value = index
    dragY.value = clientY - containerRect.top

    event.preventDefault()
    if ('touches' in event) event.stopPropagation()
  }

  /**
   * Обработчик перемещения при перетаскивании
   */
  const handleDragMove = (event: MouseEvent | TouchEvent): void => {
    if (!draggedItem.value || !containerRef.value || !draggedItem.value.clone) return

    let clientY: number
    if ('touches' in event && event.touches && event.touches.length > 0) {
      clientY = event.touches[0]!.clientY
    } else {
      clientY = (event as MouseEvent).clientY
    }

    const containerRect = containerRef.value.getBoundingClientRect()
    dragY.value = clientY - containerRect.top

    // Обновляем позицию клона
    const clone = draggedItem.value.clone
    const newTop = clientY - draggedItem.value.initialRect.height / 2
    clone.style.left = `${draggedItem.value.initialRect.left}px`
    clone.style.top = `${newTop}px`

    // Определяем новый индекс
    const dragIndex = draggedItem.value.index
    const newIndex = calculateNewIndex(clientY, dragIndex)

    if (placeholderIndex.value !== newIndex) {
      placeholderIndex.value = newIndex
      animateItems(dragIndex, newIndex)
    }

    event.preventDefault()
    if ('touches' in event) event.stopPropagation()
  }

  /**
   * Обработчик окончания перетаскивания
   */
  const handleDragEnd = (): void => {
    if (!draggedItem.value) {
      reset()
      return
    }

    const dragIndex = draggedItem.value.index
    const dropIndex = placeholderIndex.value

    // Вызываем колбэк изменения порядка
    if (
      dropIndex !== null &&
      dragIndex !== dropIndex &&
      dropIndex !== 0 &&
      onOrderChange
    ) {
      onOrderChange(dragIndex, dropIndex)
    }

    // Завершаем анимацию
    finishDragAnimation(itemsRefs, draggedItem, placeholderIndex)

    setTimeout(() => {
      removeDragClone()
      reset() // Используем reset из dragState
    }, 400)
  }

  /**
   * Рассчитывает новый индекс для элемента
   */
  const calculateNewIndex = (clientY: number, dragIndex: number): number => {
    const itemPositions: Array<{ top: number; bottom: number; index: number }> = []

    // Собираем позиции всех элементов, кроме перетаскиваемого
    for (let i = 0; i < itemsRefs.value.length; i++) {
      if (i === dragIndex) continue

      const item = itemsRefs.value[i]
      if (!item) continue

      const rect = item.getBoundingClientRect()
      itemPositions.push({
        top: rect.top,
        bottom: rect.bottom,
        index: i,
      })
    }

    // Сортируем по вертикальной позиции
    itemPositions.sort((a, b) => a.top - b.top)

    let foundIndex = -1

    // Определяем положение курсора относительно элементов
    if (itemPositions.length === 0) {
      foundIndex = 0
    } else if (clientY < itemPositions[0]!.top) {
      // Выше всех элементов
      foundIndex = itemPositions[0]!.index
      // Запрет на вставку перед фиксированной секцией (индекс 0)
      if (foundIndex === 0) {
        foundIndex = 1
      }
    } else if (clientY > itemPositions[itemPositions.length - 1]!.bottom) {
      // Ниже всех элементов
      foundIndex = itemPositions[itemPositions.length - 1]!.index + 1
    } else {
      // Проверяем промежутки между элементами
      for (let i = 0; i < itemPositions.length - 1; i++) {
        const current = itemPositions[i]!
        const next = itemPositions[i + 1]!

        if (clientY > current.bottom && clientY < next.top) {
          foundIndex = current.index + 1
          break
        }
      }

      // Если не нашли в промежутках, проверяем середину каждого элемента
      if (foundIndex === -1) {
        for (let i = 0; i < itemPositions.length; i++) {
          const item = itemPositions[i]!
          const itemMiddle = item.top + (item.bottom - item.top) / 2

          if (clientY < itemMiddle) {
            foundIndex = item.index
            break
          }
        }

        if (foundIndex === -1) {
          foundIndex = itemPositions[itemPositions.length - 1]!.index + 1
        }
      }
    }

    // Корректировка индекса с учетом удаленного перетаскиваемого элемента
    let newIndex: number
    if (foundIndex > dragIndex) {
      newIndex = foundIndex - 1
    } else {
      newIndex = foundIndex
    }

    // Ограничиваем индекс в пределах массива
    newIndex = Math.max(0, Math.min(newIndex, itemsRefs.value.length - 1))

    // Запрет на дроп на место фиксированной секции (индекс 0)
    if (newIndex === 0) {
      newIndex = 1
    }

    return newIndex
  }

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
}
