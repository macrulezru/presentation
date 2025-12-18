<script setup lang="ts">
  import Button from '@/view/ui/ui-button/ui-button.vue'
  import '@/view/components/section-editor/section-editor.scss'
  import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
  import { useSectionsConfig } from '@/view/composables/use-sections-config'
  import { PageSectionsEnum } from '@/enums/page-sections.enum'
  import { useI18n } from '@/view/composables/use-i18n'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const { t } = useI18n()
  const { sectionsConfig, setSectionsOrder, resetToDefault } = useSectionsConfig()

  // Состояние модального окна
  const showModal = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  // Текущий порядок секций (реактивный)
  const currentSections = ref<PageSectionsEnum[]>([])
  const containerRef = ref<HTMLElement>()
  const itemsRefs = ref<HTMLElement[]>([])

  // Инициализируем текущий порядок
  const initializeSections = () => {
    currentSections.value = sectionsConfig.value.map(section => section.id)
  }

  // Переводы названий секций
  const sectionNames: Record<PageSectionsEnum, string> = {
    [PageSectionsEnum.SPLASH]: t('navigation.home'),
    [PageSectionsEnum.ABOUT]: t('navigation.about'),
    [PageSectionsEnum.EXPERIENCE]: t('navigation.experience'),
    [PageSectionsEnum.TRAVELSHOP]: t('navigation.travelshop'),
    [PageSectionsEnum.FEATURES]: t('navigation.features'),
    [PageSectionsEnum.ARTS]: t('navigation.arts'),
    [PageSectionsEnum.REMOTE_WORKPLACE]: t('navigation.workplace'),
    [PageSectionsEnum.CONTACTS]: t('navigation.contacts'),
  }

  // Переменные для улучшенного drag-and-drop
  const draggedItem = ref<{
    id: PageSectionsEnum
    index: number
    element: HTMLElement | null
    clone: HTMLElement | null
    initialRect: DOMRect
  } | null>(null)

  const placeholderIndex = ref<number | null>(null)
  const isDragging = ref(false)
  const dragY = ref(0)

  // Стили для анимации
  const itemStyles = ref<Record<number, { transform: string; transition: string }>>({})

  // Инициализация рефов для элементов
  const setItemRef = (el: HTMLElement | null, index: number) => {
    if (el) {
      itemsRefs.value[index] = el
    }
  }

  // Закрытие модального окна
  const closeModal = () => {
    showModal.value = false
    resetDragState()
  }

  // Сброс состояния перетаскивания
  const resetDragState = () => {
    if (draggedItem.value?.clone && draggedItem.value.clone.parentNode) {
      draggedItem.value.clone.parentNode.removeChild(draggedItem.value.clone)
    }

    draggedItem.value = null
    placeholderIndex.value = null
    isDragging.value = false
    dragY.value = 0
    itemStyles.value = {}

    // Сбрасываем стили всех элементов
    itemsRefs.value.forEach(item => {
      if (item) {
        item.style.opacity = ''
        item.style.transform = ''
        item.style.transition = ''
        item.style.visibility = ''
        item.classList.remove('section-editor__item--dragging-original')
      }
    })
  }

  // Начало перетаскивания
  const handleDragStart = (
    event: MouseEvent | TouchEvent,
    sectionId: PageSectionsEnum,
    index: number,
  ) => {
    if (sectionId === PageSectionsEnum.SPLASH || isDragging.value) return

    isDragging.value = true

    // Безопасное получение clientY для TouchEvent и MouseEvent
    let clientY: number
    if ('touches' in event && event.touches && event.touches.length > 0) {
      clientY = event.touches[0]!.clientY
    } else {
      clientY = (event as MouseEvent).clientY
    }

    const element = itemsRefs.value[index]
    if (!element || !containerRef.value) return

    const containerRect = containerRef.value.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    // Создаем клон элемента для перетаскивания
    const clone = element.cloneNode(true) as HTMLElement
    clone.classList.add('section-editor__item--dragging-clone')
    clone.classList.remove(
      'section-editor__item--fixed',
      'section-editor__item--placeholder',
      'section-editor__item--dragging',
    )

    // Устанавливаем стили для клона
    clone.style.position = 'fixed'
    clone.style.width = `${elementRect.width}px`
    clone.style.height = `${elementRect.height}px`
    clone.style.left = `${elementRect.left}px`
    clone.style.top = `${elementRect.top}px`
    clone.style.zIndex = '10000'
    clone.style.cursor = 'grabbing'
    clone.style.pointerEvents = 'none'
    clone.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.25)'
    clone.style.transform = 'scale(1.05) rotate(1deg)'
    clone.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease'

    document.body.appendChild(clone)

    // Скрываем оригинальный элемент
    element.classList.add('section-editor__item--dragging-original')
    element.style.visibility = 'hidden'
    element.style.opacity = '0'

    // Запоминаем начальное состояние
    draggedItem.value = {
      id: sectionId,
      index,
      element,
      clone,
      initialRect: elementRect,
    }

    placeholderIndex.value = index
    dragY.value = clientY - containerRect.top

    // Добавляем обработчики событий
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('touchmove', handleDragMove, { passive: false })
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchend', handleDragEnd)

    event.preventDefault()
    if ('touches' in event) event.stopPropagation()
  }

  // Перемещение элемента - ИСПРАВЛЕННАЯ ЛОГИКА
  const handleDragMove = (event: MouseEvent | TouchEvent) => {
    if (!draggedItem.value || !containerRef.value) return

    // Безопасное получение clientY для TouchEvent и MouseEvent
    let clientY: number
    if ('touches' in event && event.touches && event.touches.length > 0) {
      clientY = event.touches[0]!.clientY
    } else {
      clientY = (event as MouseEvent).clientY
    }

    const containerRect = containerRef.value.getBoundingClientRect()

    dragY.value = clientY - containerRect.top

    // Обновляем позицию клона
    const clone = draggedItem.value.clone!
    const newTop = clientY - draggedItem.value.initialRect.height / 2

    clone.style.left = `${draggedItem.value.initialRect.left}px`
    clone.style.top = `${newTop}px`

    // Определяем новую позицию с учетом, что перетаскиваемый элемент временно удален
    const dragIndex = draggedItem.value.index
    let newIndex = 0

    // Собираем актуальные позиции элементов (кроме перетаскиваемого)
    const itemPositions: Array<{ top: number; bottom: number; index: number }> = []

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

    // Находим новую позицию
    let foundIndex = -1

    // Если нет элементов, кроме перетаскиваемого
    if (itemPositions.length === 0) {
      foundIndex = 0
    }
    // Проверяем позицию перед первым элементом
    else if (clientY < itemPositions[0]!.top) {
      foundIndex = itemPositions[0]!.index
      // Если пытаемся вставить перед первым элементом (не SPLASH), то нельзя
      if (foundIndex === 0 && draggedItem.value.id !== PageSectionsEnum.SPLASH) {
        foundIndex = 1
      }
    }
    // Проверяем позицию после последнего элемента
    else if (clientY > itemPositions[itemPositions.length - 1]!.bottom) {
      foundIndex = itemPositions[itemPositions.length - 1]!.index + 1
    }
    // Ищем между элементами
    else {
      for (let i = 0; i < itemPositions.length - 1; i++) {
        const current = itemPositions[i]!
        const next = itemPositions[i + 1]!

        // Если курсор между текущим и следующим элементом
        if (clientY > current.bottom && clientY < next.top) {
          foundIndex = current.index + 1
          break
        }
      }

      // Если не нашли между, значит курсор над каким-то элементом
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

    // Корректируем индекс с учетом того, что dragIndex может быть меньше foundIndex
    if (foundIndex > dragIndex) {
      newIndex = foundIndex - 1
    } else {
      newIndex = foundIndex
    }

    // Ограничиваем индексы
    newIndex = Math.max(0, Math.min(newIndex, itemsRefs.value.length - 1))

    // Нельзя вставить на место первой фиксированной секции
    if (newIndex === 0 && draggedItem.value.id !== PageSectionsEnum.SPLASH) {
      newIndex = 1
    }

    // Обновляем placeholder позицию
    if (placeholderIndex.value !== newIndex) {
      placeholderIndex.value = newIndex
      animateItems(dragIndex, newIndex)
    }

    event.preventDefault()
    if ('touches' in event) event.stopPropagation()
  }

  // Анимация элементов при перемещении - ИСПРАВЛЕННАЯ ЛОГИКА
  const animateItems = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const newStyles: Record<number, { transform: string; transition: string }> = {}
    const gap = 12 // gap между элементами

    // Собираем реальные высоты элементов
    const itemHeights: number[] = []
    for (let i = 0; i < itemsRefs.value.length; i++) {
      const item = itemsRefs.value[i]
      itemHeights.push(item?.offsetHeight || 74)
    }

    for (let i = 0; i < itemsRefs.value.length; i++) {
      if (i === fromIndex) continue

      let translateY = 0

      if (fromIndex < toIndex) {
        // Перемещаем вниз: сдвигаем элементы между fromIndex и toIndex вверх
        if (i > fromIndex && i <= toIndex) {
          translateY = -(itemHeights[fromIndex]! + gap)
        }
      } else {
        // Перемещаем вверх: сдвигаем элементы между toIndex и fromIndex вниз
        if (i >= toIndex && i < fromIndex) {
          translateY = itemHeights[toIndex]! + gap
        }
      }

      if (translateY !== 0) {
        newStyles[i] = {
          transform: `translateY(${translateY}px)`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      } else {
        newStyles[i] = {
          transform: 'translateY(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      }
    }

    itemStyles.value = newStyles
  }

  // Завершение перетаскивания
  const handleDragEnd = () => {
    if (!draggedItem.value) {
      resetDragState()
      return
    }

    const dragIndex = draggedItem.value.index
    const dropIndex = placeholderIndex.value

    // Если позиция изменилась, обновляем порядок
    if (dropIndex !== null && dragIndex !== dropIndex && dropIndex !== 0) {
      const newOrder = [...currentSections.value]
      const movedItem = newOrder.splice(dragIndex, 1)[0]!
      newOrder.splice(dropIndex, 0, movedItem)
      currentSections.value = newOrder
    }

    // Анимация завершения
    finishDragAnimation()
  }

  // Анимация завершения перетаскивания
  const finishDragAnimation = () => {
    if (!draggedItem.value) {
      resetDragState()
      return
    }

    // Анимируем возвращение всех элементов на место
    for (let i = 0; i < itemsRefs.value.length; i++) {
      const item = itemsRefs.value[i]
      if (item) {
        item.style.transform = ''
        item.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    }

    // Восстанавливаем оригинальный элемент
    const originalElement = draggedItem.value.element
    if (originalElement) {
      originalElement.classList.remove('section-editor__item--dragging-original')
      originalElement.style.visibility = ''
      originalElement.style.opacity = '1'
      originalElement.style.transition = 'opacity 0.3s ease'
    }

    // Анимация клона
    if (draggedItem.value.clone) {
      const clone = draggedItem.value.clone

      // Если элемент был перемещен, показываем анимацию возврата на новое место
      if (
        placeholderIndex.value !== null &&
        placeholderIndex.value !== draggedItem.value.index
      ) {
        const finalElement = itemsRefs.value[placeholderIndex.value]
        if (finalElement) {
          const finalRect = finalElement.getBoundingClientRect()

          clone.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          clone.style.transform = 'scale(1) rotate(0deg)'
          clone.style.left = `${finalRect.left}px`
          clone.style.top = `${finalRect.top}px`
          clone.style.opacity = '0'
        }
      } else {
        // Иначе просто исчезаем
        clone.style.transition = 'opacity 0.2s ease'
        clone.style.opacity = '0'
      }

      setTimeout(() => {
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone)
        }
      }, 400)
    }

    // Удаляем обработчики событий
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchend', handleDragEnd)

    // Сбрасываем состояние через небольшой таймаут
    setTimeout(() => {
      resetDragState()
    }, 400)
  }

  // Применяем новый порядок
  const applyNewOrder = () => {
    setSectionsOrder(currentSections.value)
    closeModal()
  }

  // Сбрасываем к порядку по умолчанию
  const resetOrder = () => {
    resetToDefault()
    initializeSections()
    nextTick(() => {
      // Сбрасываем стили анимации
      itemStyles.value = {}
    })
  }

  // Отменяем изменения
  const cancelChanges = () => {
    initializeSections()
    closeModal()
  }

  // Переместить секцию вверх
  const moveUp = (index: number) => {
    if (index <= 1) return

    const newOrder = [...currentSections.value]
    const temp = newOrder[index]!
    newOrder[index] = newOrder[index - 1]!
    newOrder[index - 1] = temp
    currentSections.value = newOrder
  }

  // Переместить секцию вниз
  const moveDown = (index: number) => {
    if (index >= currentSections.value.length - 1) return

    const newOrder = [...currentSections.value]
    const temp = newOrder[index]!
    newOrder[index] = newOrder[index + 1]!
    newOrder[index + 1] = temp
    currentSections.value = newOrder
  }

  // Проверяем, были ли изменения
  const hasChanges = computed(() => {
    const currentOrder = sectionsConfig.value.map(section => section.id)
    return JSON.stringify(currentOrder) !== JSON.stringify(currentSections.value)
  })

  // Инициализация
  onMounted(() => {
    initializeSections()
  })

  // Следим за открытием модального окна
  watch(
    () => props.modelValue,
    newValue => {
      if (newValue) {
        initializeSections()
        resetDragState()
      }
    },
  )

  // Обработка клавиши Escape
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && showModal.value) {
      closeModal()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    resetDragState()
  })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showModal" class="section-editor__modal">
        <div class="section-editor__backdrop" @click="closeModal"></div>

        <div class="section-editor__container">
          <div class="section-editor">
            <div class="section-editor__header">
              <div class="section-editor__header-content">
                <h3 class="section-editor__title">
                  {{ t('sectionEditor.title') }}
                </h3>
                <button
                  class="section-editor__close"
                  @click="closeModal"
                  aria-label="Закрыть"
                >
                  <span class="section-editor__close-icon"></span>
                </button>
              </div>
              <p class="section-editor__description">
                {{ t('sectionEditor.description') }}
              </p>
            </div>

            <div class="section-editor__list" ref="containerRef">
              <div
                v-for="(sectionId, index) in currentSections"
                :key="`${sectionId}-${index}`"
                :ref="el => setItemRef(el as HTMLElement, index)"
                class="section-editor__item"
                :class="{
                  'section-editor__item--fixed': index === 0,
                  'section-editor__item--placeholder':
                    placeholderIndex === index && draggedItem?.id !== sectionId,
                  'section-editor__item--dragging': draggedItem?.id === sectionId,
                }"
                :style="itemStyles[index] || {}"
                @mousedown="handleDragStart($event, sectionId, index)"
                @touchstart="handleDragStart($event, sectionId, index)"
              >
                <div class="section-editor__content">
                  <div class="section-editor__info">
                    <div class="section-editor__name">
                      {{ sectionNames[sectionId] || sectionId }}
                    </div>
                    <div
                      v-if="index === 0"
                      class="section-editor__badge"
                      :title="t('sectionEditor.fixedTitle')"
                    >
                      {{ t('sectionEditor.fixedLabel') }}
                    </div>
                  </div>

                  <div v-if="index !== 0" class="section-editor__controls">
                    <button
                      class="section-editor__button section-editor__button--up"
                      @click="moveUp(index)"
                      :disabled="index <= 1 || isDragging"
                      :title="t('sectionEditor.moveUp')"
                    >
                      <span class="section-editor__arrow-icon"></span>
                    </button>
                    <button
                      class="section-editor__button section-editor__button--down"
                      @click="moveDown(index)"
                      :disabled="index >= currentSections.length - 1 || isDragging"
                      :title="t('sectionEditor.moveDown')"
                    >
                      <span
                        class="section-editor__arrow-icon section-editor__arrow-icon--down"
                      ></span>
                    </button>
                    <div
                      class="section-editor__handle"
                      :title="t('sectionEditor.dragHint')"
                    >
                      <span class="section-editor__drag-icon"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section-editor__actions">
              <Button
                :text="t('sectionEditor.apply')"
                :disabled="!hasChanges"
                fullWidth
                micro
                @click="applyNewOrder"
              />
              <Button
                :text="t('sectionEditor.cancel')"
                fullWidth
                micro
                @click="cancelChanges"
              />
              <Button
                :text="t('sectionEditor.reset')"
                fullWidth
                micro
                @click="resetOrder"
              />
            </div>

            <div v-if="hasChanges" class="section-editor__notice">
              <span class="section-editor__notice-icon">⚠️</span>
              <span>
                {{ t('sectionEditor.unsavedChanges') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
