import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export interface SlideImage {
  preview: string
  full: string
  description: string
}

export const useTravelshopImages = () => {
  const { t } = useI18n()

  // Конфигурация изображений с именами файлов и ключами перевода
  const imageConfigs = [
    { name: 'desktop-1', key: 'desktop_1' },
    { name: 'desktop-2', key: 'desktop_2' },
    { name: 'desktop-3', key: 'desktop_3' },
    { name: 'desktop-4', key: 'desktop_4' },
    { name: 'desktop-5', key: 'desktop_5' },
    { name: 'desktop-6', key: 'desktop_6' },
    { name: 'desktop-8', key: 'desktop_8' },
    { name: 'desktop-7', key: 'desktop_7' },
  ]

  // Вычисляемое свойство с готовыми объектами
  const images = computed<SlideImage[]>(() =>
    imageConfigs.map(config => ({
      preview: getImageUrl(`${config.name}-small.jpg`),
      full: getImageUrl(`${config.name}.jpg`),
      description:
        t(`travelshop.images.description.${config.key}`) ||
        t('travelshop.images.description.default', { number: config.name.split('-')[1] }),
    })),
  )

  // Получение URL для изображения
  const getImageUrl = (name: string): string => {
    return new URL(`/src/assets/images/travelshop/${name}`, import.meta.url).href
  }

  return {
    // Данные
    images,
    imageConfigs,

    // Свойства
    totalImages: computed(() => images.value.length),
  }
}
