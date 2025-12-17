<script setup lang="ts">
  import '@/view/components/arts/parts/art-item/art-item.scss'

  interface Props {
    image: any
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    onImageClick: [key: string]
  }>()

  const onImageClick = (image: any) => {
    emit('onImageClick', image.key)
  }

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    console.warn(`Ошибка загрузки изображения: ${img.src}`)
    img.classList.add('arts__image--error')
  }
</script>

<template>
  <div class="art-item" @click="onImageClick(props.image.key)">
    <div class="art-item__preview">
      <img
        v-if="props.image.preview"
        :src="props.image.preview"
        :alt="props.image.title"
        @error="handleImageError($event)"
        class="art-item__image"
      />
    </div>
  </div>
</template>
