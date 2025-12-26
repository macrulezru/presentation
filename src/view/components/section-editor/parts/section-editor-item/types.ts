import { PageSectionsEnum } from '@/enums/page-sections.enum';

export interface Props {
  sectionId: PageSectionsEnum;
  index: number;
  sectionName: string;
  isFixed?: boolean;
  isPlaceholder?: boolean;
  isDragging?: boolean;
  isDraggingOriginal?: boolean;
  isDraggingClone?: boolean;
  isDraggingAny?: boolean;
  hasChanges?: boolean;
  customStyle?: {
    transform: string;
    transition: string;
  };
  hideUpButton?: boolean;
  hideDownButton?: boolean;
}
