<script setup lang="ts">
  import ArtItem from '@/view/components/arts/parts/art-item/art-item.vue'
  import UiImageModal from '@/view/ui/ui-image-modal/ui-image-modal.vue'
  import Button from '@/view/ui/ui-button/ui-button.vue'

  import '@/view/components/arts/arts.scss'

  import { ref, computed } from 'vue'
  import { ImageFolder } from '@/enums/arts.enum'
  import { useArtsImages } from '@/view/composables/use-arts-images'
  import { useI18n } from '@/view/composables/use-i18n.ts'
  const { t } = useI18n()

  const isModalOpen = ref(false)
  const currentImageIndex = ref(0)
  const selectedFolder = ref<ImageFolder | null>(null)
  const selectedProject = ref<ReturnType<typeof getImageByKey> | null>(null)
  const showAllImages = ref<boolean>(false)

  const PREVIEW_IMAGE_COUNT = 10

  const { images, getImageByKey } = useArtsImages()

  const filteredImages = computed(() => {
    if (showAllImages.value) {
      return images.value
    }
    return images.value.slice(0, PREVIEW_IMAGE_COUNT)
  })

  const modalImages = computed(() => {
    if (!selectedProject.value) return []

    return selectedProject.value.images.map((img, index) => ({
      preview: selectedProject.value?.preview || img,
      full: img,
      description: `${selectedProject.value?.title} - изображение ${index + 1}`,
    }))
  })

  const onShowAllImages = () => {
    showAllImages.value = true
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
</script>

<template>
  <div class="arts">
    <div class="arts__header">
      <h1 class="arts__title">{{ t('design.title') }}</h1>
      <div class="arts__sub-title">{{ t('design.description') }}</div>
    </div>

    <div class="arts__projects">
      <masonry-wall
        :items="filteredImages"
        :ssr-columns="1"
        :column-width="250"
        :gap="16"
      >
        <template #default="{ item }">
          <ArtItem :image="item" @onImageClick="openModal(item.key)" />
        </template>
      </masonry-wall>
    </div>
    <div v-if="!showAllImages" class="experience__button-container">
      <Button :text="t('design.showAll')" @click="onShowAllImages" />
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
