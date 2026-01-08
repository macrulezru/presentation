<script setup lang="ts">
  import '@/view/components/about/parts/ai-feature/ai-feature.scss';

  import AiImageHorizontal from '@/view/assets/images/ai-block-horizontal.jpg';
  import AiImage from '@/view/assets/images/ai-block.jpg';
  import { useI18n } from '@/view/composables/use-i18n';
  import UiImage from '@/view/ui/ui-image/ui-image.vue';

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
              <span class="ai-feature__logo ai-feature__logo_chat-gpt" />
              {{ t('about.ai.tools.chatgpt') }}
            </div>
            <div class="ai-feature__logo-item">
              <span class="ai-feature__logo ai-feature__logo_github-copilot" />
              {{ t('about.ai.tools.copilot') }}
            </div>
            <div class="ai-feature__logo-item">
              <span class="ai-feature__logo ai-feature__logo_grog" />
              {{ t('about.ai.tools.grog') }}
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
