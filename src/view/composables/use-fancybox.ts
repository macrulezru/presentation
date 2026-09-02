import type { FancyboxOptions } from '@fancyapps/ui/dist/fancybox/fancybox';

import { LocalesEnum, type LocalesEnumType } from '@/enums/locales.enum';
import { i18n } from '@/locales';

import '@fancyapps/ui/dist/fancybox/fancybox.css';
import '@/view/composables/use-fancybox.scss';

export interface GalleryImage {
  /** Ссылка на полноразмерное изображение */
  full: string;
  /** Ссылка на превью для миниатюры */
  preview?: string;
  /** Подпись изображения */
  description?: string;
}

export interface OpenGalleryOptions extends Partial<FancyboxOptions> {
  /** Показывать подпись (caption) под текущим изображением. По умолчанию true. */
  showCaption?: boolean;
}

// У Fancybox нет готовой локализации для ru/kz, поэтому для них переопределяем
// только реально видимые в текущей конфигурации строки (закрытие, стрелки
// навигации, aria-label модального окна, сообщение об ошибке загрузки).
// Для de/zh используются официальные пакеты локализации @fancyapps/ui.
const CUSTOM_L10N: Partial<Record<LocalesEnumType, Record<string, string>>> = {
  [LocalesEnum.RU]: {
    CLOSE: 'Закрыть',
    NEXT: 'Следующее изображение',
    PREV: 'Предыдущее изображение',
    MODAL: 'Это модальное окно можно закрыть клавишей ESC',
    IMAGE_ERROR: 'Не удалось загрузить изображение. <br /> Попробуйте позже.',
  },
  [LocalesEnum.KZ]: {
    CLOSE: 'Жабу',
    NEXT: 'Келесі сурет',
    PREV: 'Алдыңғы сурет',
    MODAL: 'Бұл модальді терезені ESC пернесімен жабуға болады',
    IMAGE_ERROR: 'Суретті жүктеу мүмкін болмады. <br /> Кейінірек қайталап көріңіз.',
  },
};

const getL10n = async (
  locale: LocalesEnumType,
): Promise<Record<string, string> | undefined> => {
  if (locale === LocalesEnum.DE) {
    return (await import('@fancyapps/ui/dist/fancybox/l10n/de_DE.js')).de_DE;
  }
  if (locale === LocalesEnum.ZH) {
    return (await import('@fancyapps/ui/dist/fancybox/l10n/zh_CN.js')).zh_CN;
  }
  return CUSTOM_L10N[locale];
};

/**
 * Открывает галерею изображений в Fancybox (https://fancyapps.com/).
 * Импортирует библиотеку динамически, чтобы она не попадала в SSR-бандл.
 */
export const useFancybox = () => {
  const openGallery = async (
    images: GalleryImage[],
    startIndex = 0,
    options?: OpenGalleryOptions,
  ) => {
    if (typeof window === 'undefined' || images.length === 0) return;

    const { Fancybox } = await import('@fancyapps/ui/dist/fancybox/fancybox');

    const locale = i18n.global.locale.value as LocalesEnumType;
    const l10n = await getL10n(locale);

    const { showCaption = true, ...fancyboxOptions } = options ?? {};

    const slides = images.map(image => ({
      src: image.full,
      thumb: image.preview ?? image.full,
      alt: image.description,
      caption: showCaption ? image.description : undefined,
    }));

    Fancybox.show(slides, {
      startIndex,
      theme: 'dark',
      ...(l10n ? { l10n } : {}),
      Carousel: {
        Thumbs: {
          type: 'modern',
          showOnStart: images.length > 1,
        },
        Toolbar: {
          display: {
            left: ['infobar'],
            middle: [],
            right: ['zoom', 'fullscreen', 'close'],
          },
        },
      },
      ...fancyboxOptions,
    });
  };

  return { openGallery };
};
