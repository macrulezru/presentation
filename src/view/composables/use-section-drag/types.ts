import { type Ref } from 'vue';

export interface DraggedItem {
  index: number;
  element: HTMLElement;
  clone: HTMLElement;
  initialRect: DOMRect;
}

export interface DragState {
  draggedItem: Ref<DraggedItem | null>;
  placeholderIndex: Ref<number | null>;
  isDragging: Ref<boolean>;
  dragY: Ref<number>;
  itemStyles: Ref<Record<number, { transform: string; transition: string }>>;
}

export interface UseDragStateReturn extends DragState {
  reset: () => void;
}

export interface DragAnimations {
  animateItems: (fromIndex: number, toIndex: number) => void;
  resetItemStyles: () => void;
  finishDragAnimation: (
    itemsRefs: Ref<HTMLElement[]>,
    draggedItem: Ref<DraggedItem | null>,
    placeholderIndex: Ref<number | null>,
  ) => void;
}

export interface DragCloneMethods {
  createDragClone: (index: number) => HTMLElement | null;
  setupDraggedItem: (index: number, clone: HTMLElement) => DraggedItem | null;
  removeDragClone: () => void;
}

export interface DragEventHandlers {
  handleDragStart: (event: MouseEvent | TouchEvent, index: number) => void;
  handleDragMove: (event: MouseEvent | TouchEvent) => void;
  handleDragEnd: () => void;
}

export interface UseSectionDragReturn {
  draggedItem: Ref<DraggedItem | null>;
  placeholderIndex: Ref<number | null>;
  isDragging: Ref<boolean>;
  dragY: Ref<number>;
  itemStyles: Ref<Record<number, { transform: string; transition: string }>>;
  handleDragStart: (event: MouseEvent | TouchEvent, index: number) => void;
  resetDragState: () => void;
  cleanupEventListeners: () => void;
}
