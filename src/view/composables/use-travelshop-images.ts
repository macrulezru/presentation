import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  TRAVELSHOP_IMAGE_CONFIGS,
  type TravelshopImageData,
  TravelshopImage,
} from '@/enums/travelshop-images.enum';

export const useTravelshopImages = () => {
  const { t } = useI18n();

  // Вычисляемое свойство с готовыми объектами
  const images = computed<TravelshopImageData[]>(() =>
    TRAVELSHOP_IMAGE_CONFIGS.map(config => {
      const translationKey = `travelshop.images.description.${config.enum}`;

      return {
        preview: getImageUrl(`${config.fileName}-small.jpg`),
        full: getImageUrl(`${config.fileName}.jpg`),
        description:
          t(translationKey) ||
          t('travelshop.images.description.default', {
            number: config.fileName.split('-')[1],
          }),
        key: config.enum,
      };
    }),
  );

  // Получение URL для изображения
  const getImageUrl = (name: string): string => {
    return new URL(`/src/view/assets/images/travelshop/${name}`, import.meta.url).href;
  };

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
