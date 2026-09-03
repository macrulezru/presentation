import { computed } from 'vue';

import {
  APP_PLATFORM_IMAGE_CONFIGS,
  type AppPlatformImageData,
  AppPlatformImage,
} from '@/enums/app-platform-images.enum';

export const useAppPlatformImages = () => {
  const imageModules = import.meta.glob(
    '@/view/assets/images/app-platform/*.{jpg,jpeg,png,webp}',
    {
      eager: true,
      import: 'default',
    },
  ) as Record<string, string>;

  const imageUrlByName: Record<string, string> = Object.fromEntries(
    Object.entries(imageModules).map(([path, url]) => {
      const name = path.split('/').pop() || path;
      return [name, url];
    }),
  );

  // Вычисляемое свойство с готовыми объектами
  const images = computed<AppPlatformImageData[]>(() =>
    APP_PLATFORM_IMAGE_CONFIGS.map(config => {
      return {
        preview: getImageUrl(`${config.fileName}-small.webp`),
        full: getImageUrl(`${config.fileName}.webp`),
        key: config.enum,
      };
    }),
  );

  // Получение URL для изображения
  const getImageUrl = (name: string): string => {
    return imageUrlByName[name] || '';
  };

  // Получение изображения по ключу enum
  const getImageByKey = (key: AppPlatformImage) => {
    return images.value.find(img => img.key === key);
  };

  // Получение изображения по индексу
  const getImageByIndex = (index: number) => {
    return images.value[index];
  };

  // Получение индекса по ключу enum
  const getIndexByKey = (key: AppPlatformImage) => {
    return images.value.findIndex(img => img.key === key);
  };

  return {
    // Данные
    images,

    // Enum для использования в других компонентах
    AppPlatformImage,

    // Методы
    getImageUrl,
    getImageByKey,
    getImageByIndex,
    getIndexByKey,

    // Свойства
    totalImages: computed(() => images.value.length),
  };
};
