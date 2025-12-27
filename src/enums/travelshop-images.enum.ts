export enum TravelshopImage {
  DESKTOP_1 = 'desktop_1',
  MOBILE_1 = 'mobile_1',
  DESKTOP_2 = 'desktop_2',
  MOBILE_2 = 'mobile_2',
  DESKTOP_3 = 'desktop_3',
  MOBILE_3 = 'mobile_3',
  DESKTOP_4 = 'desktop_4',
  MOBILE_4 = 'mobile_4',
  DESKTOP_5 = 'desktop_5',
  MOBILE_5 = 'mobile_5',
  DESKTOP_6 = 'desktop_6',
  MOBILE_6 = 'mobile_6',
  DESKTOP_7 = 'desktop_7',
  MOBILE_7 = 'mobile_7',
  DESKTOP_8 = 'desktop_8',
  MOBILE_8 = 'mobile_8',
}

// Интерфейс для конфигурации изображения
export interface TravelshopImageConfig {
  enum: TravelshopImage;
  fileName: string;
  order?: number;
}

// Массив конфигураций в нужном порядке
export const TRAVELSHOP_IMAGE_CONFIGS: TravelshopImageConfig[] = [
  { enum: TravelshopImage.DESKTOP_1, fileName: 'desktop-1' },
  { enum: TravelshopImage.DESKTOP_1, fileName: 'mobile-1' },
  { enum: TravelshopImage.DESKTOP_2, fileName: 'desktop-2' },
  { enum: TravelshopImage.DESKTOP_2, fileName: 'mobile-2' },
  { enum: TravelshopImage.DESKTOP_3, fileName: 'desktop-3' },
  { enum: TravelshopImage.DESKTOP_3, fileName: 'mobile-3' },
  { enum: TravelshopImage.DESKTOP_4, fileName: 'desktop-4' },
  { enum: TravelshopImage.DESKTOP_4, fileName: 'mobile-4' },
  { enum: TravelshopImage.DESKTOP_5, fileName: 'desktop-5' },
  { enum: TravelshopImage.DESKTOP_5, fileName: 'mobile-5' },
  { enum: TravelshopImage.DESKTOP_6, fileName: 'desktop-6' },
  { enum: TravelshopImage.DESKTOP_6, fileName: 'mobile-6' },
  { enum: TravelshopImage.DESKTOP_8, fileName: 'desktop-8' },
  { enum: TravelshopImage.DESKTOP_8, fileName: 'mobile-7' },
  { enum: TravelshopImage.DESKTOP_7, fileName: 'desktop-7' },
  { enum: TravelshopImage.DESKTOP_7, fileName: 'mobile-8' },
];

// Тип для объекта изображения
export interface TravelshopImageData {
  preview: string;
  full: string;
  description: string;
  key: TravelshopImage;
}
