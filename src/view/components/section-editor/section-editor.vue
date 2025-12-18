<script setup lang="ts">
  import Button from '@/view/ui/ui-button/ui-button.vue'
  import SectionEditorItem from '@/view/components/section-editor/parts/section-editor-item/section-editor-item.vue'

  import '@/view/components/section-editor/section-editor.scss'

  import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
  import { useSectionsConfig } from '@/view/composables/use-sections-config'
  import { PageSectionsEnum } from '@/enums/page-sections.enum'
  import type { ComponentPublicInstance } from 'vue'
  import { useSectionDrag } from '@/view/composables/use-drag'

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

  const setItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
    if (el) {
      if ('$el' in el) {
        itemsRefs.value[index] = el.$el as HTMLElement
      } else {
        itemsRefs.value[index] = el as HTMLElement
      }
    }
  }

  const handleOrderChange = (fromIndex: number, toIndex: number) => {
    const newOrder = [...currentSections.value]
    const movedItem = newOrder.splice(fromIndex, 1)[0]!
    newOrder.splice(toIndex, 0, movedItem)
    currentSections.value = newOrder
  }

  const {
    itemStyles,
    placeholderIndex,
    isDragging,
    handleDragStart: dragStart,
    resetDragState,
  } = useSectionDrag(itemsRefs, containerRef, handleOrderChange)

  const closeModal = () => {
    showModal.value = false
    resetDragState()
  }

  const handleDragStart = (
    event: MouseEvent | TouchEvent,
    sectionId: PageSectionsEnum,
    index: number,
  ) => {
    if (sectionId === PageSectionsEnum.SPLASH || isDragging.value) return
    dragStart(event, index)
  }

  const applyNewOrder = () => {
    setSectionsOrder(currentSections.value)
    closeModal()
  }

  const resetOrder = () => {
    resetToDefault()
    initializeSections()
    nextTick(() => {
      resetDragState()
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
                :isPlaceholder="placeholderIndex === index && isDragging"
                :isDragging="isDragging && placeholderIndex === index"
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
