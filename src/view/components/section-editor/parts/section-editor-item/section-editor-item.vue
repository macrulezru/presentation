<script setup lang="ts">
  import '@/view/components/section-editor/parts/section-editor-item/section-editor-item.scss'

  import { PageSectionsEnum } from '@/enums/page-sections.enum'

  const { t } = useI18n()

  const props = withDefaults(
    defineProps<{
      sectionId: PageSectionsEnum
      index: number
      sectionName: string
      isFixed?: boolean
      isPlaceholder?: boolean
      isDragging?: boolean
      isDraggingOriginal?: boolean
      isDraggingClone?: boolean
      isDraggingAny?: boolean
      hasChanges?: boolean
      customStyle?: {
        transform: string
        transition: string
      }
      hideUpButton?: boolean
      hideDownButton?: boolean
    }>(),
    {
      isFixed: false,
      isPlaceholder: false,
      isDragging: false,
      isDraggingOriginal: false,
      isDraggingClone: false,
      isDraggingAny: false,
      hasChanges: false,
      hideUpButton: false,
      hideDownButton: false,
    },
  )

  const emit = defineEmits<{
    'drag-start': [event: MouseEvent | TouchEvent]
    'move-up': []
    'move-down': []
  }>()

  const handleDragStart = (event: MouseEvent | TouchEvent) => {
    if (!props.isFixed) {
      emit('drag-start', event)
    }
  }

  const handleMoveUp = () => {
    if (!props.isFixed && !props.isDraggingAny) {
      emit('move-up')
    }
  }

  const handleMoveDown = () => {
    if (!props.isFixed && !props.isDraggingAny) {
      emit('move-down')
    }
  }
</script>

<template>
  <div
    class="section-editor-item"
    :class="{
      'section-editor-item--fixed': isFixed,
      'section-editor-item--placeholder': isPlaceholder,
      'section-editor-item--dragging': isDragging,
      'section-editor-item--dragging-original': isDraggingOriginal,
      'section-editor-item--dragging-clone': isDraggingClone,
    }"
    :style="customStyle"
  >
    <div class="section-editor-item__content">
      <div class="section-editor-item__info">
        <div class="section-editor-item__name">
          {{ sectionName || sectionId }}
        </div>
        <div
          v-if="isFixed"
          class="section-editor-item__badge"
          :title="t('sectionEditor.fixedTitle')"
        >
          {{ t('sectionEditor.fixedLabel') }}
        </div>
      </div>

      <div v-if="!isFixed" class="section-editor-item__controls">
        <button
          v-if="!hideUpButton"
          class="section-editor-item__button section-editor-item__button--up"
          @click.stop="handleMoveUp"
          :disabled="isDraggingAny"
          :title="t('sectionEditor.moveUp')"
        >
          <span class="section-editor-item__arrow-icon"></span>
        </button>
        <button
          v-if="!hideDownButton"
          class="section-editor-item__button section-editor-item__button--down"
          @click.stop="handleMoveDown"
          :disabled="isDraggingAny"
          :title="t('sectionEditor.moveDown')"
        >
          <span
            class="section-editor-item__arrow-icon section-editor-item__arrow-icon--down"
          ></span>
        </button>
        <div
          class="section-editor-item__handle"
          :title="t('sectionEditor.dragHint')"
          @mousedown="handleDragStart"
          @touchstart="handleDragStart"
        >
          <span class="section-editor-item__drag-icon"></span>
        </div>
      </div>
    </div>
  </div>
</template>
