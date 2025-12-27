<script setup lang="ts">
  import '@/view/components/arts/parts/art-item/art-item.scss';
  import { ref, onMounted } from 'vue';

  interface Props {
    image: any;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    onImageClick: [key: string];
  }>();

  const cardRef = ref<HTMLElement>();
  const isHovered = ref(false);
  const rotateX = ref(0);
  const rotateY = ref(0);
  const glowX = ref(50);
  const glowY = ref(50);
  const translateY = ref(0);
  const imgRef = ref<HTMLImageElement>();
  const isImageLoaded = ref(false);

  const MAX_IMAGE_ROTATION = 30;

  const onImageClick = (key: string) => {
    emit('onImageClick', key);
  };

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    console.warn(`Ошибка загрузки изображения: ${img.src}`);
    img.classList.add('arts__image--error');
  };

  const handleImageLoad = () => {
    isImageLoaded.value = true;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.value || !isHovered.value || !isImageLoaded.value) return;

    const card = cardRef.value;
    const rect = card.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const relX = (e.clientX - centerX) / rect.width;
    const relY = (e.clientY - centerY) / rect.height;

    rotateY.value = -relX * MAX_IMAGE_ROTATION;
    rotateX.value = relY * MAX_IMAGE_ROTATION;

    glowX.value = ((e.clientX - rect.left) / rect.width) * 100;
    glowY.value = ((e.clientY - rect.top) / rect.height) * 100;
  };

  const handleMouseEnter = () => {
    if (isImageLoaded.value) {
      isHovered.value = true;
    }
  };

  const handleMouseLeave = () => {
    isHovered.value = false;
    rotateX.value = 0;
    rotateY.value = 0;
    translateY.value = 0;
    glowX.value = 50;
    glowY.value = 50;
  };

  onMounted(() => {
    if (imgRef.value?.complete) {
      isImageLoaded.value = true;
    }
  });
</script>

<template>
  <div
    ref="cardRef"
    class="art-item"
    :class="{ 'art-item--loaded': isImageLoaded }"
    :style="{
      transform: isImageLoaded
        ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px)`
        : 'none',
      '--glow-x': `${glowX}%`,
      '--glow-y': `${glowY}%`,
    }"
    @click="() => onImageClick(props.image.key)"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="art-item__preview">
      <img
        v-if="props.image.preview"
        ref="imgRef"
        :src="props.image.preview"
        :alt="props.image.title"
        class="art-item__image"
        @error="handleImageError"
        @load="handleImageLoad"
      />
    </div>
  </div>
</template>
