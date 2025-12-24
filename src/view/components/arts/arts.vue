<script setup lang="ts">
  import ArtItem from '@/view/components/arts/parts/art-item/art-item.vue'
  import UiImageModal from '@/view/ui/ui-image-modal/ui-image-modal.vue'
  import Button from '@/view/ui/ui-button/ui-button.vue'

  import '@/view/components/arts/arts.scss'

  import { ref, computed, onMounted } from 'vue'
  import { ImageFolder } from '@/enums/arts.enum'
  import { useArtsImages } from '@/view/composables/use-arts-images'
  import { useI18n } from '@/view/composables/use-i18n.ts'

  const { t } = useI18n()

  const isModalOpen = ref(false)
  const currentImageIndex = ref(0)
  const selectedFolder = ref<ImageFolder | null>(null)
  const selectedProject = ref<ReturnType<typeof getImageByKey> | null>(null)
  const isLoading = ref(false)
  const loadingProgress = ref(0)
  const currentMasonryKey = ref(0)
  const showAllImages = ref(false)
  const isPreviewLoaded = ref(false)
  const areAllImagesLoaded = ref(false)

  const { images, getImageByKey } = useArtsImages()

  const PREVIEW_IMAGE_COUNT = 10

  // Карта для кэширования изображений (не реактивная)
  const loadedImagesMap = new Map<string, HTMLImageElement>()

  // URL всех изображений
  const allImageUrls = computed(() => {
    return images.value.map(img => img.preview).filter(Boolean) as string[]
  })

  // URL для превью
  const previewImageUrls = computed(() => {
    return allImageUrls.value.slice(0, PREVIEW_IMAGE_COUNT)
  })

  // URL оставшихся изображений
  const remainingImageUrls = computed(() => {
    return allImageUrls.value.slice(PREVIEW_IMAGE_COUNT)
  })

  // Изображения для отображения
  const displayImages = computed(() => {
    return showAllImages.value ? images.value : images.value.slice(0, PREVIEW_IMAGE_COUNT)
  })

  const modalImages = computed(() => {
    if (!selectedProject.value) return []

    return selectedProject.value.images.map((img, index) => ({
      preview: selectedProject.value?.preview || img,
      full: img,
      description: `${selectedProject.value?.title} - изображение ${index + 1}`,
    }))
  })

  // Загрузка изображения для кэширования
  const loadImageForCache = async (url: string): Promise<void> => {
    if (loadedImagesMap.has(url)) return

    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        loadedImagesMap.set(url, img)
        resolve()
      }
      img.onerror = () => {
        console.warn(`Не удалось предзагрузить изображение: ${url}`)
        resolve()
      }
      img.src = url
    })
  }

  // Предзагрузка превью изображений
  const initializePreview = async () => {
    isPreviewLoaded.value = false

    const previewUrls = previewImageUrls.value

    if (previewUrls.length > 0) {
      await Promise.all(previewUrls.map(url => loadImageForCache(url)))
    }

    isPreviewLoaded.value = true
  }

  // Загрузка оставшихся изображений с прогрессом
  const loadRemainingImages = async (): Promise<void> => {
    isLoading.value = true
    loadingProgress.value = 0

    try {
      const remainingUrls = remainingImageUrls.value

      if (remainingUrls.length === 0) {
        areAllImagesLoaded.value = true
        isLoading.value = false
        return
      }

      const total = remainingUrls.length
      let loaded = 0

      // Загружаем партиями по 3 изображения
      const batchSize = 3

      for (let i = 0; i < remainingUrls.length; i += batchSize) {
        const batch = remainingUrls.slice(i, i + batchSize)

        await Promise.all(
          batch.map(async url => {
            await loadImageForCache(url)
            loaded++
            loadingProgress.value = Math.round((loaded / total) * 100)
          }),
        )
      }

      areAllImagesLoaded.value = true
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Обработчик кнопки "Показать все"
  const onShowAllImages = async () => {
    if (isLoading.value || showAllImages.value) return

    // Если все изображения уже загружены, просто показываем их
    if (areAllImagesLoaded.value) {
      showAllImages.value = true
      currentMasonryKey.value += 1
      return
    }

    // Загружаем оставшиеся изображения
    await loadRemainingImages()

    // Показываем все изображения и пересоздаем masonry
    showAllImages.value = true
    currentMasonryKey.value += 1

    // Сбрасываем прогресс
    setTimeout(() => {
      loadingProgress.value = 0
    }, 300)
  }

  const openModal = (folder: ImageFolder) => {
    selectedFolder.value = folder
    selectedProject.value = getImageByKey(folder)

    if (selectedProject.value) {
      isModalOpen.value = true
      currentImageIndex.value = 0
    }
  }

  const closeModal = () => {
    isModalOpen.value = false
    selectedFolder.value = null
    selectedProject.value = null
  }

  const handleImageChange = (index: number) => {
    currentImageIndex.value = index
  }

  onMounted(async () => {
    await initializePreview()
  })
</script>

<template>
  <div class="arts">
    <div class="arts__header">
      <h1 class="arts__title">{{ t('design.title') }}</h1>
      <div class="arts__sub-title">{{ t('design.description') }}</div>
    </div>

    <div v-if="!isPreviewLoaded" class="arts__loading">
      <div class="arts__loading-spinner"></div>
    </div>

    <div v-else class="arts__projects">
      <masonry-wall
        :key="currentMasonryKey"
        :items="displayImages"
        :ssr-columns="1"
        :column-width="250"
        :gap="16"
      >
        <template #default="{ item }">
          <ArtItem :image="item" @onImageClick="openModal(item.key)" />
        </template>
      </masonry-wall>
    </div>

    <div
      v-if="!showAllImages && images.length > PREVIEW_IMAGE_COUNT && isPreviewLoaded"
      class="arts__button-container"
    >
      <Button
        v-if="!isLoading"
        :text="t('design.showAll')"
        @click="onShowAllImages"
        class="arts__show-all-button"
      >
        <div class="arts__button-content">
          <span class="arts__button-text">
            {{ t('design.showAll') }}
          </span>
        </div>
      </Button>

      <div v-else class="arts__progress-wrapper">
        <div class="arts__progress-overlay">
          <div class="arts__progress-container">
            <div class="arts__progress-text">
              {{ t('design.loadingImages') }}
            </div>
            <div class="arts__progress-bar">
              <div
                class="arts__progress-fill"
                :style="{ width: `${loadingProgress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <UiImageModal
      v-model:isOpen="isModalOpen"
      :images="modalImages"
      :initialIndex="currentImageIndex"
      :showCounter="modalImages.length > 1"
      :showThumbnails="false"
      @close="closeModal"
      @change="handleImageChange"
    />
  </div>
</template>
