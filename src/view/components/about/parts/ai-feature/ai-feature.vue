<script setup lang="ts">
  import '@/view/components/about/parts/ai-feature/ai-feature.scss';

  import { computed } from 'vue';

  import AiImageHorizontal from '@/view/assets/images/ai-block-horizontal.webp';
  import AiImage from '@/view/assets/images/ai-block.webp';
  import UiImage from '@/view/ui/ui-image/ui-image.vue';
  import { useI18n } from '~/composables/useI18n';

  const { t, tm } = useI18n();

  interface AiOption {
    title: string;
    items: string[];
  }

  interface AiModel {
    icon: string;
    title: string;
    text: string;
  }

  const aiOptions = computed(() => (tm('about.ai.options') as AiOption[]) || []);

  const aiModels = computed(() => (tm('about.ai.tools.items') as AiModel[]) || []);
</script>

<!-- eslint-disable vue/no-v-html -->

<template>
  <div class="ai-feature">
    <div class="ai-feature__container">
      <div class="ai-feature__content">
        <div class="ai-feature__data-wrapper">
          <div class="ai-feature__header" v-html="t('about.ai.subtitle')" />
          <div class="ai-feature__description">
            {{ t('about.ai.description') }}
          </div>
          <div class="ai-feature__options">
            <div
              v-for="(option, index) in aiOptions"
              :key="index"
              class="ai-feature__option"
            >
              <div class="ai-feature__option-title">{{ option.title }}</div>
              <ul class="ai-feature__option-list">
                <li
                  v-for="(item, i) in option.items"
                  :key="i"
                  class="ai-feature__option-list-item"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
          <div class="ai-feature__models-wrapper">
            <div class="ai-feature__models">
              <div v-for="model in aiModels" :key="model.icon" class="ai-feature__model">
                <span
                  class="ai-feature__model-logo"
                  :class="`ai-feature__model-logo_${model.icon}`"
                />
                <div class="ai-feature__model-info">
                  <span class="ai-feature__model-title">{{ model.title }}</span>
                  <span class="ai-feature__model-description">{{ model.text }}</span>
                </div>
              </div>
            </div>
            <div class="ai-feature__image-wrapper">
              <UiImage
                :image="{
                  src: { src: AiImage, width: '587px', height: '454px' },
                  tablet: { src: AiImageHorizontal, width: '1536px', height: '759px' },
                  alt: 'AI Feature Image',
                }"
                class="about__tech-art"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
