export enum AppPlatformImage {
  IMAGE_1 = 'image_1',
  IMAGE_2 = 'image_2',
  IMAGE_3 = 'image_3',
  IMAGE_4 = 'image_4',
  IMAGE_5 = 'image_5',
  IMAGE_6 = 'image_6',
  IMAGE_7 = 'image_7',
}

// Интерфейс для конфигурации изображения
export interface AppPlatformImageConfig {
  enum: AppPlatformImage;
  fileName: string;
  order?: number;
}

// Массив конфигураций в нужном порядке
export const APP_PLATFORM_IMAGE_CONFIGS: AppPlatformImageConfig[] = [
  { enum: AppPlatformImage.IMAGE_1, fileName: 'app-platform-1' },
  { enum: AppPlatformImage.IMAGE_1, fileName: 'app-platform-2' },
  { enum: AppPlatformImage.IMAGE_1, fileName: 'app-platform-3' },
  { enum: AppPlatformImage.IMAGE_1, fileName: 'app-platform-4' },
  { enum: AppPlatformImage.IMAGE_1, fileName: 'app-platform-5' },
  { enum: AppPlatformImage.IMAGE_1, fileName: 'app-platform-6' },
  { enum: AppPlatformImage.IMAGE_1, fileName: 'app-platform-7' },
];

// Тип для объекта изображения
export interface AppPlatformImageData {
  preview: string;
  full: string;
  key: AppPlatformImage;
}
