export enum RestApiImage {
  IMAGE_1 = 'image_1',
  IMAGE_2 = 'image_2',
  IMAGE_3 = 'image_3',
  IMAGE_4 = 'image_4',
  IMAGE_5 = 'image_5',
  IMAGE_6 = 'image_6',
  IMAGE_7 = 'image_7',
  IMAGE_8 = 'image_8',
  IMAGE_9 = 'image_9',
  IMAGE_10 = 'image_10',
  IMAGE_11 = 'image_11',
}

// Интерфейс для конфигурации изображения
export interface RestApiImageConfig {
  enum: RestApiImage;
  fileName: string;
  order?: number;
}

// Массив конфигураций в нужном порядке
export const REST_API_IMAGE_CONFIGS: RestApiImageConfig[] = [
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-1' },
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-2' },
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-3' },
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-4' },
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-5' },
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-6' },
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-7' },
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-8' },
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-9' },
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-10' },
  { enum: RestApiImage.IMAGE_1, fileName: 'rest-api-11' },
];

// Тип для объекта изображения
export interface RestApiImageData {
  preview: string;
  full: string;
  key: RestApiImage;
}
