<script setup lang="ts">
  import UiImageModal from '@/view/ui/ui-image-modal/ui-image-modal.vue'

  import '@/view/components/arts/arts.scss'

  import { ref, computed } from 'vue'
  import { ImageFolder } from '@/enums/arts.enum'
  import { useArtsImages } from '@/view/composables/use-arts-images'
  import { useI18n } from '@/view/composables/use-i18n.ts'
  const { t } = useI18n()

  const search = ref('')
  const isModalOpen = ref(false)
  const currentImageIndex = ref(0)
  const selectedFolder = ref<ImageFolder | null>(null)
  const selectedProject = ref<ReturnType<typeof getImageByKey> | null>(null)

  const { images, getImageByKey, formatFolderName } = useArtsImages()

  const modalImages = computed(() => {
    if (!selectedProject.value) return []

    return selectedProject.value.images.map((img, index) => ({
      preview: selectedProject.value?.preview || img,
      full: img,
      description: `${selectedProject.value?.title} - изображение ${index + 1}`,
    }))
  })

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    console.warn(`Ошибка загрузки изображения: ${img.src}`)
    img.classList.add('arts__image--error')
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

  const filteredImages = computed(() => {
    if (!search.value.trim()) return images.value

    const query = search.value.toLowerCase()
    return images.value.filter(
      img =>
        formatFolderName(img.key).toLowerCase().includes(query) ||
        img.title.toLowerCase().includes(query) ||
        img.description.toLowerCase().includes(query),
    )
  })
</script>

<template>
  <div class="arts">
    <div class="arts__header">
      <h1 class="arts__title">{{ t('design.title') }}</h1>
      <div class="arts__sub-title">{{ t('design.description') }}</div>
    </div>

    <div class="arts__projects">
      <div
        v-for="image in filteredImages"
        :key="image.key"
        class="arts__project"
        @click="openModal(image.key)"
      >
        <div class="arts__preview">
          <img
            v-if="image.preview"
            :src="image.preview"
            :alt="image.title"
            @error="handleImageError($event)"
            loading="lazy"
            class="arts__image"
          />
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
