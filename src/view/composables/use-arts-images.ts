import { computed } from 'vue'
import { ImageFolder, FOLDERS_DATA } from '@/enums/arts.enum'

export interface ArtsImageData {
  preview: string | null
  images: string[]
  description: string
  key: ImageFolder
  title: string
}

export const useArtsImages = () => {
  const images = computed<ArtsImageData[]>(() => {
    const items = Object.entries(FOLDERS_DATA).map(([key, data]) => {
      const folderKey = key as ImageFolder

      return {
        preview: data.preview,
        images: data.images,
        description: formatFolderName(folderKey),
        title: formatFolderName(folderKey),
        key: folderKey,
      }
    })

    return items.sort(() => Math.random() - 0.5)
  })

  // Форматирование имени папки
  const formatFolderName = (folder: ImageFolder): string => {
    return folder.replace(/_/g, ' ')
  }

  // Получение данных по ключу enum
  const getImageByKey = (key: ImageFolder) => {
    return images.value.find(img => img.key === key)
  }

  // Получение данных по индексу
  const getImageByIndex = (index: number) => {
    return images.value[index]
  }

  // Получение индекса по ключу enum
  const getIndexByKey = (key: ImageFolder) => {
    return images.value.findIndex(img => img.key === key)
  }

  // Получение предыдущего элемента
  const getPrevImage = (currentKey: ImageFolder) => {
    const currentIndex = getIndexByKey(currentKey)
    return currentIndex > 0 ? images.value[currentIndex - 1] : null
  }

  // Получение следующего элемента
  const getNextImage = (currentKey: ImageFolder) => {
    const currentIndex = getIndexByKey(currentKey)
    return currentIndex < images.value.length - 1 ? images.value[currentIndex + 1] : null
  }

  return {
    // Данные
    images,

    // Методы
    getImageByKey,
    getImageByIndex,
    getIndexByKey,
    getPrevImage,
    getNextImage,
    formatFolderName,

    // Свойства
    totalImages: computed(() => images.value.length),
  }
}
