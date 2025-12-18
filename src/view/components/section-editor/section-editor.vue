<script setup lang="ts">
  import Button from '@/view/ui/ui-button/ui-button.vue'
  import SectionEditorItem from './parts/section-editor-item/section-editor-item.vue'

  import '@/view/components/section-editor/section-editor.scss'

  import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
  import { useSectionsConfig } from '@/view/composables/use-sections-config'
  import { PageSectionsEnum } from '@/enums/page-sections.enum'
  import type { ComponentPublicInstance } from 'vue'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  const { t } = useI18n()
  const { sectionsConfig, setSectionsOrder, resetToDefault } = useSectionsConfig()

  const showModal = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  const currentSections = ref<PageSectionsEnum[]>([])
  const containerRef = ref<HTMLElement>()
  const itemsRefs = ref<HTMLElement[]>([])

  const initializeSections = () => {
    currentSections.value = sectionsConfig.value.map(section => section.id)
  }

  const sectionNames = computed(() => {
    return {
      [PageSectionsEnum.SPLASH]: t('navigation.home'),
      [PageSectionsEnum.ABOUT]: t('navigation.about'),
      [PageSectionsEnum.EXPERIENCE]: t('navigation.experience'),
      [PageSectionsEnum.TRAVELSHOP]: t('navigation.travelshop'),
      [PageSectionsEnum.FEATURES]: t('navigation.features'),
      [PageSectionsEnum.ARTS]: t('navigation.arts'),
      [PageSectionsEnum.REMOTE_WORKPLACE]: t('navigation.workplace'),
      [PageSectionsEnum.CONTACTS]: t('navigation.contacts'),
    }
  })

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
  const itemStyles = ref<Record<number, { transform: string; transition: string }>>({})

  const setItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
    if (el) {
      // Если это экземпляр компонента Vue, получаем его корневой DOM-элемент
      if ('$el' in el) {
        itemsRefs.value[index] = el.$el as HTMLElement
      } else {
        // Иначе это уже DOM-элемент (тип Element), приводим к HTMLElement
        itemsRefs.value[index] = el as HTMLElement
      }
    }
  }

  const closeModal = () => {
    showModal.value = false
    resetDragState()
  }

  const resetDragState = () => {
    if (draggedItem.value?.clone && draggedItem.value.clone.parentNode) {
      draggedItem.value.clone.parentNode.removeChild(draggedItem.value.clone)
    }

    draggedItem.value = null
    placeholderIndex.value = null
    isDragging.value = false
    dragY.value = 0
    itemStyles.value = {}

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

  const handleDragStart = (
    event: MouseEvent | TouchEvent,
    sectionId: PageSectionsEnum,
    index: number,
  ) => {
    if (sectionId === PageSectionsEnum.SPLASH || isDragging.value) return

    isDragging.value = true

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

    const clone = element.cloneNode(true) as HTMLElement
    clone.classList.add('section-editor-item--dragging-clone')
    clone.classList.remove(
      'section-editor-item--fixed',
      'section-editor-item--placeholder',
      'section-editor-item--dragging',
    )

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

    element.classList.add('section-editor-item--dragging-original')
    element.style.visibility = 'hidden'
    element.style.opacity = '0'

    draggedItem.value = {
      id: sectionId,
      index,
      element,
      clone,
      initialRect: elementRect,
    }

    placeholderIndex.value = index
    dragY.value = clientY - containerRect.top

    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('touchmove', handleDragMove, { passive: false })
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchend', handleDragEnd)

    event.preventDefault()
    if ('touches' in event) event.stopPropagation()
  }

  const handleDragMove = (event: MouseEvent | TouchEvent) => {
    if (!draggedItem.value || !containerRef.value) return

    let clientY: number
    if ('touches' in event && event.touches && event.touches.length > 0) {
      clientY = event.touches[0]!.clientY
    } else {
      clientY = (event as MouseEvent).clientY
    }

    const containerRect = containerRef.value.getBoundingClientRect()
    dragY.value = clientY - containerRect.top

    const clone = draggedItem.value.clone!
    const newTop = clientY - draggedItem.value.initialRect.height / 2

    clone.style.left = `${draggedItem.value.initialRect.left}px`
    clone.style.top = `${newTop}px`

    const dragIndex = draggedItem.value.index
    let newIndex = 0

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

    itemPositions.sort((a, b) => a.top - b.top)

    let foundIndex = -1

    if (itemPositions.length === 0) {
      foundIndex = 0
    } else if (clientY < itemPositions[0]!.top) {
      foundIndex = itemPositions[0]!.index
      if (foundIndex === 0 && draggedItem.value.id !== PageSectionsEnum.SPLASH) {
        foundIndex = 1
      }
    } else if (clientY > itemPositions[itemPositions.length - 1]!.bottom) {
      foundIndex = itemPositions[itemPositions.length - 1]!.index + 1
    } else {
      for (let i = 0; i < itemPositions.length - 1; i++) {
        const current = itemPositions[i]!
        const next = itemPositions[i + 1]!

        if (clientY > current.bottom && clientY < next.top) {
          foundIndex = current.index + 1
          break
        }
      }

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

    if (foundIndex > dragIndex) {
      newIndex = foundIndex - 1
    } else {
      newIndex = foundIndex
    }

    newIndex = Math.max(0, Math.min(newIndex, itemsRefs.value.length - 1))

    if (newIndex === 0 && draggedItem.value.id !== PageSectionsEnum.SPLASH) {
      newIndex = 1
    }

    if (placeholderIndex.value !== newIndex) {
      placeholderIndex.value = newIndex
      animateItems(dragIndex, newIndex)
    }

    event.preventDefault()
    if ('touches' in event) event.stopPropagation()
  }

  const animateItems = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const newStyles: Record<number, { transform: string; transition: string }> = {}
    const gap = 12

    const itemHeights: number[] = []
    for (let i = 0; i < itemsRefs.value.length; i++) {
      const item = itemsRefs.value[i]
      itemHeights.push(item?.offsetHeight || 74)
    }

    for (let i = 0; i < itemsRefs.value.length; i++) {
      if (i === fromIndex) continue

      let translateY = 0

      if (fromIndex < toIndex) {
        if (i > fromIndex && i <= toIndex) {
          translateY = -(itemHeights[fromIndex]! + gap)
        }
      } else {
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

  const handleDragEnd = () => {
    if (!draggedItem.value) {
      resetDragState()
      return
    }

    const dragIndex = draggedItem.value.index
    const dropIndex = placeholderIndex.value

    if (dropIndex !== null && dragIndex !== dropIndex && dropIndex !== 0) {
      const newOrder = [...currentSections.value]
      const movedItem = newOrder.splice(dragIndex, 1)[0]!
      newOrder.splice(dropIndex, 0, movedItem)
      currentSections.value = newOrder
    }

    finishDragAnimation()
  }

  const finishDragAnimation = () => {
    if (!draggedItem.value) {
      resetDragState()
      return
    }

    for (let i = 0; i < itemsRefs.value.length; i++) {
      const item = itemsRefs.value[i]
      if (item) {
        item.style.transform = ''
        item.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    }

    const originalElement = draggedItem.value.element
    if (originalElement) {
      originalElement.classList.remove('section-editor-item--dragging-original')
      originalElement.style.visibility = ''
      originalElement.style.opacity = '1'
      originalElement.style.transition = 'opacity 0.3s ease'
    }

    if (draggedItem.value.clone) {
      const clone = draggedItem.value.clone

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
        clone.style.transition = 'opacity 0.2s ease'
        clone.style.opacity = '0'
      }

      setTimeout(() => {
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone)
        }
      }, 400)
    }

    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchend', handleDragEnd)

    setTimeout(() => {
      resetDragState()
    }, 400)
  }

  const applyNewOrder = () => {
    setSectionsOrder(currentSections.value)
    closeModal()
  }

  const resetOrder = () => {
    resetToDefault()
    initializeSections()
    nextTick(() => {
      itemStyles.value = {}
    })
  }

  const cancelChanges = () => {
    initializeSections()
    closeModal()
  }

  const moveUp = (index: number) => {
    if (index <= 1) return

    const newOrder = [...currentSections.value]
    const temp = newOrder[index]!
    newOrder[index] = newOrder[index - 1]!
    newOrder[index - 1] = temp
    currentSections.value = newOrder
  }

  const moveDown = (index: number) => {
    if (index >= currentSections.value.length - 1) return

    const newOrder = [...currentSections.value]
    const temp = newOrder[index]!
    newOrder[index] = newOrder[index + 1]!
    newOrder[index + 1] = temp
    currentSections.value = newOrder
  }

  const hasChanges = computed(() => {
    const currentOrder = sectionsConfig.value.map(section => section.id)
    return JSON.stringify(currentOrder) !== JSON.stringify(currentSections.value)
  })

  onMounted(() => {
    initializeSections()
  })

  watch(
    () => props.modelValue,
    newValue => {
      if (newValue) {
        initializeSections()
        resetDragState()
      }
    },
  )

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
              <SectionEditorItem
                v-for="(sectionId, index) in currentSections"
                :key="`${sectionId}-${index}`"
                :ref="el => setItemRef(el, index)"
                :sectionId="sectionId"
                :index="index"
                :sectionName="sectionNames[sectionId] || sectionId"
                :isFixed="index === 0"
                :isPlaceholder="
                  placeholderIndex === index && draggedItem?.id !== sectionId
                "
                :isDragging="draggedItem?.id === sectionId"
                :isDraggingAny="isDragging"
                :hasChanges="hasChanges"
                :customStyle="itemStyles[index]"
                :hideUpButton="index === 1 || index === 0"
                :hideDownButton="index === currentSections.length - 1"
                @dragStart="handleDragStart($event, sectionId, index)"
                @moveUp="moveUp(index)"
                @moveDown="moveDown(index)"
              />
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
                reset
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
