<script setup lang="ts">
  import '@/view/components/arts/parts/art-item/art-item.scss'
  import { ref } from 'vue'

  interface Props {
    image: any
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    onImageClick: [key: string]
  }>()

  const cardRef = ref<HTMLElement>()
  const isHovered = ref(false)
  const rotateX = ref(0)
  const rotateY = ref(0)
  const glowX = ref(50)
  const glowY = ref(50)
  const translateY = ref(0)

  const MAX_IMAGE_ROTATION = 30

  const onImageClick = (image: any) => {
    emit('onImageClick', image.key)
  }

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    console.warn(`Ошибка загрузки изображения: ${img.src}`)
    img.classList.add('arts__image--error')
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.value || !isHovered.value) return

    const card = cardRef.value
    const rect = card.getBoundingClientRect()

    // Координаты центра карточки
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Относительное положение курсора (-0.5 до 0.5)
    const relX = (e.clientX - centerX) / rect.width
    const relY = (e.clientY - centerY) / rect.height

    // Рассчитываем углы поворота
    rotateY.value = -relX * MAX_IMAGE_ROTATION
    rotateX.value = relY * MAX_IMAGE_ROTATION

    // Для градиента свечения
    glowX.value = ((e.clientX - rect.left) / rect.width) * 100
    glowY.value = ((e.clientY - rect.top) / rect.height) * 100
  }

  const handleMouseEnter = () => {
    isHovered.value = true
  }

  const handleMouseLeave = () => {
    isHovered.value = false

    rotateX.value = 0
    rotateY.value = 0
    translateY.value = 0
    glowX.value = 50
    glowY.value = 50
  }
</script>

<template>
  <div
    ref="cardRef"
    class="art-item"
    @click="onImageClick(props.image.key)"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :style="{
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px)`,
      '--glow-x': `${glowX}%`,
      '--glow-y': `${glowY}%`,
    }"
  >
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
