import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  TRAVELSHOP_IMAGE_CONFIGS,
  type TravelshopImageData,
  TravelshopImage,
} from '@/enums/travelshop-images.enum';

// Динамический импорт изображений (Nuxt/SSR: new URL с абсолютным путём даёт undefined)
const travelshopImageModules = import.meta.glob<string>(
  '../assets/images/travelshop/*.jpg',
  { eager: true, query: '?url', import: 'default' },
);

const getImageUrlFromGlob = (name: string): string => {
  const entry = Object.entries(travelshopImageModules).find(([path]) =>
    path.endsWith(`/${name}`),
  );
  return (entry?.[1] ?? '') as string;
};

export const useTravelshopImages = () => {
  const { t } = useI18n();

  // Вычисляемое свойство с готовыми объектами
  const images = computed<TravelshopImageData[]>(() =>
    TRAVELSHOP_IMAGE_CONFIGS.map(config => {
      const translationKey = `travelshop.images.description.${config.enum}`;

      return {
        preview: getImageUrlFromGlob(`${config.fileName}-small.jpg`),
        full: getImageUrlFromGlob(`${config.fileName}.jpg`),
        description:
          t(translationKey) ||
          t('travelshop.images.description.default', {
            number: config.fileName.split('-')[1],
          }),
        key: config.enum,
      };
    }),
  );

  // Получение URL для изображения (для внешнего использования)
  const getImageUrl = getImageUrlFromGlob;

  // Получение изображения по ключу enum
  const getImageByKey = (key: TravelshopImage) => {
    return images.value.find(img => img.key === key);
  };

  // Получение изображения по индексу
  const getImageByIndex = (index: number) => {
    return images.value[index];
  };

  // Получение индекса по ключу enum
  const getIndexByKey = (key: TravelshopImage) => {
    return images.value.findIndex(img => img.key === key);
  };

  return {
    // Данные
    images,

    // Enum для использования в других компонентах
    TravelshopImage,

    // Методы
    getImageUrl,
    getImageByKey,
    getImageByIndex,
    getIndexByKey,

    // Свойства
    totalImages: computed(() => images.value.length),
  };
};
