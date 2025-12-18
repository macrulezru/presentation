import { ref, type Ref } from 'vue'
import type { LoadingState, ImageSizes, ImageAssets } from './types'
import { useTravelshopIntroStore } from '@/stores/use-travelshop-intro-store'

export interface ImageSources {
  airport: string
  aircraft: string
  cloud: string
}

export interface UseImageManagerReturn {
  images: ImageAssets
  actualImageSizes: Ref<ImageSizes>
  loading: Ref<LoadingState>
  allImagesLoaded: Ref<boolean>
  loadImages: (imageSources: ImageSources) => Promise<void>
}

export function useImageManager(): UseImageManagerReturn {
  const travelshopIntroStore = useTravelshopIntroStore()

  const images = {
    airport: new Image(),
    aircraft: new Image(),
    cloud: new Image(),
  }

  const actualImageSizes = ref<ImageSizes>({
    airport: { width: 0, height: 0, aspectRatio: 0 },
    aircraft: { width: 0, height: 0, aspectRatio: 0 },
    cloud: { width: 0, height: 0, aspectRatio: 0 },
  })

  const loading = ref<LoadingState>({
    airport: false,
    aircraft: false,
    cloud: false,
  })

  const allImagesLoaded = ref(false)

  const loadImages = async (imageSources: ImageSources): Promise<void> => {
    return new Promise(resolve => {
      let loadedCount = 0
      const totalImages = Object.keys(images).length

      const onImageLoad = () => {
        loadedCount++
        if (loadedCount === totalImages) {
          allImagesLoaded.value = true
          resolve()
        }
      }

      images.airport.onload = () => {
        const width =
          images.airport.naturalWidth || travelshopIntroStore.config.airport.originalWidth
        const height =
          images.airport.naturalHeight ||
          travelshopIntroStore.config.airport.originalHeight
        actualImageSizes.value.airport = {
          width,
          height,
          aspectRatio: height / width,
        }
        loading.value.airport = true
        onImageLoad()
      }
      images.airport.onerror = () => {
        console.error('Failed to load airport image')
        onImageLoad()
      }
      images.airport.src = imageSources.airport

      images.aircraft.onload = () => {
        const width =
          images.aircraft.naturalWidth ||
          travelshopIntroStore.config.aircraft.originalWidth
        const height =
          images.aircraft.naturalHeight ||
          travelshopIntroStore.config.aircraft.originalHeight
        const aspectRatio = height / width
        actualImageSizes.value.aircraft = {
          width,
          height,
          aspectRatio,
        }
        loading.value.aircraft = true
        onImageLoad()
      }
      images.aircraft.onerror = () => {
        console.error('Failed to load aircraft image')
        onImageLoad()
      }
      images.aircraft.src = imageSources.aircraft

      images.cloud.onload = () => {
        const width =
          images.cloud.naturalWidth || travelshopIntroStore.config.cloud.originalWidth
        const height =
          images.cloud.naturalHeight || travelshopIntroStore.config.cloud.originalHeight
        actualImageSizes.value.cloud = {
          width,
          height,
          aspectRatio: height / width,
        }
        loading.value.cloud = true
        onImageLoad()
      }
      images.cloud.onerror = () => {
        console.error('Failed to load cloud image')
        onImageLoad()
      }
      images.cloud.src = imageSources.cloud
    })
  }

  return {
    images,
    actualImageSizes,
    loading,
    allImagesLoaded,
    loadImages,
  }
}
