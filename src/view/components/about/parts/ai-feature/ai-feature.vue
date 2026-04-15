<script setup lang="ts">
  import '@/view/components/about/parts/ai-feature/ai-feature.scss';

  import AiImageHorizontal from '@/view/assets/images/ai-block-horizontal.webp';
  import AiImage from '@/view/assets/images/ai-block.webp';
  import UiImage from '@/view/ui/ui-image/ui-image.vue';
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();
</script>

<!-- eslint-disable vue/no-v-html -->

<template>
  <div class="ai-feature">
    <div class="ai-feature__container">
      <div class="ai-feature__content">
        <div class="ai-feature__data-wrapper">
          <div class="ai-feature__header">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
              class="ai-feature__title"
              v-html="`<span>A</span>rtificial <span>I</span>ntelligence`"
            />
            <div class="ai-feature__subtitle">{{ t('about.ai.subtitle') }}</div>
          </div>
          <div class="ai-feature__description">
            {{ t('about.ai.description') }}
          </div>
          <div class="ai-feature__logos">
            <div class="ai-feature__logo-item">
              <span class="ai-feature__logo ai-feature__logo_claude" />
              {{ t('about.ai.tools.claude') }}
            </div>
            <div class="ai-feature__logo-item">
              <span class="ai-feature__logo ai-feature__logo_cursor" />
              {{ t('about.ai.tools.cursor') }}
            </div>
            <div class="ai-feature__logo-item">
              <span class="ai-feature__logo ai-feature__logo_github-copilot" />
              {{ t('about.ai.tools.copilot') }}
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
</template>
