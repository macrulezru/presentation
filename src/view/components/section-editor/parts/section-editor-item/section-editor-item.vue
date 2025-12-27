<script setup lang="ts">
  import '@/view/components/section-editor/parts/section-editor-item/section-editor-item.scss';

  import type { Props } from './types';

  import { useI18n } from '@/view/composables/use-i18n';

  const { t } = useI18n();

  const props = withDefaults(defineProps<Props>(), {
    isFixed: false,
    isPlaceholder: false,
    isDragging: false,
    isDraggingOriginal: false,
    isDraggingClone: false,
    isDraggingAny: false,
    hasChanges: false,
    hideUpButton: false,
    hideDownButton: false,
  });

  const emit = defineEmits<{
    dragStart: [event: MouseEvent | TouchEvent];
    moveUp: [];
    moveDown: [];
  }>();

  const handleDragStart = (event: MouseEvent | TouchEvent) => {
    if (!props.isFixed) {
      emit('dragStart', event);
    }
  };

  const handleMoveUp = () => {
    if (!props.isFixed && !props.isDraggingAny) {
      emit('moveUp');
    }
  };

  const handleMoveDown = () => {
    if (!props.isFixed && !props.isDraggingAny) {
      emit('moveDown');
    }
  };
</script>

<template>
  <div
    class="section-editor-item"
    :class="{
      'section-editor-item--fixed': isFixed,
      'section-editor-item--placeholder': isPlaceholder,
      'section-editor-item--dragging': isDragging,
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
          :disabled="isDraggingAny"
          :title="t('sectionEditor.moveUp')"
          @click.stop="handleMoveUp"
        >
          <span class="section-editor-item__arrow-icon"></span>
        </button>
        <button
          v-if="!hideDownButton"
          class="section-editor-item__button section-editor-item__button--down"
          :disabled="isDraggingAny"
          :title="t('sectionEditor.moveDown')"
          @click.stop="handleMoveDown"
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
