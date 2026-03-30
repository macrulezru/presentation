import { computed } from 'vue';
import { useI18n } from '~/composables/useI18n';

import {
  TRAVELSHOP_IMAGE_CONFIGS,
  type TravelshopImageData,
  TravelshopImage,
} from '@/enums/travelshop-images.enum';

export const useTravelshopImages = () => {
  const { t } = useI18n();

  const imageModules = import.meta.glob('@/view/assets/images/travelshop/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
  }) as Record<string, string>;

  const imageUrlByName: Record<string, string> = Object.fromEntries(
    Object.entries(imageModules).map(([path, url]) => {
      const name = path.split('/').pop() || path;
      return [name, url];
    }),
  );

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
    return imageUrlByName[name] || '';
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
