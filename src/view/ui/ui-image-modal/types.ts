export interface ImageObject {
  /** Путь к превью изображения */
  preview: string;
  /** Путь к полноразмерному изображению */
  full: string;
  /** Описание изображения (alt текст) */
  description: string;
}

export interface Props {
  /** Состояние открытия модального окна */
  isOpen: boolean;

  /** Массив изображений для отображения */
  images: ImageObject[];

  /** Начальный индекс изображения */
  initialIndex?: number;

  /** Показывать навигационные стрелки */
  showNavigation?: boolean;

  /** Показывать счетчик изображений */
  showCounter?: boolean;

  /** Показывать панель миниатюр */
  showThumbnails?: boolean;

  /** Разрешить открытие изображения в новой вкладке */
  allowOpenInNewTab?: boolean;
}
