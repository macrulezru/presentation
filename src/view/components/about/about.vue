<script setup lang="ts">
  import '@/view/components/about/about.scss';

  import { useElementVisibility } from '@macrulez/inview-vue';
  import { computed, ref, watch, reactive } from 'vue';

  //import WavesDebugPanel from './WavesDebugPanel.vue';

  import type { ListItem, TechImage } from '@/view/components/about/types';

  import techStackMain from '@/view/assets/images/tech-stack-1.webp';
  import techStackInfra from '@/view/assets/images/tech-stack-2.webp';
  import techStackLayout from '@/view/assets/images/tech-stack-3.webp';
  import techStackDevops from '@/view/assets/images/tech-stack-4.webp';
  import AiFeature from '@/view/components/about/parts/ai-feature/ai-feature.vue';
  import {
    useNeonWaves,
    DEFAULT_CONFIG,
    type NeonWavesConfig,
  } from '@/view/composables/useNeonWaves';
  import { useI18n } from '~/composables/useI18n';

  const { t, tm } = useI18n();

  const container = ref<HTMLElement>();
  const abuotWave = ref<HTMLCanvasElement | null>(null);

  const wavesConfig = reactive<NeonWavesConfig>(
    JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
  );

  // Передаем реактивный объект напрямую
  const { start, stop } = useNeonWaves(abuotWave, wavesConfig);

  const { isVisible } = useElementVisibility(abuotWave, {
    rootMargin: '100px 0px',
    threshold: 0,
  });

  const getListItem = (key: string): ListItem[] => {
    const items = tm(key);

    if (!items || typeof items !== 'object' || Array.isArray(items)) {
      return [];
    }

    return Object.entries(items)
      .filter(([, item]) => {
        return (
          item &&
          typeof item === 'object' &&
          typeof (item as Record<string, unknown>).title === 'string' &&
          typeof (item as Record<string, unknown>).description === 'string'
        );
      })
      .map(([itemKey, item]) => ({
        ...(item as Omit<ListItem, 'key'>),
        key: itemKey,
      }));
  };

  interface TechCategory {
    key: string;
    image: TechImage;
    title: string;
    description: string;
    items: ListItem[];
  }

  const techStackImages: Record<string, TechImage> = {
    main: {
      image: techStackMain,
      hazehash: 'MH8yLwIAUp_qjjb1G9PNS81KrWnbub43y2lQrrEM1qYNzJEw5ZwspQ6zjEElZuwp',
    },
    infra: {
      image: techStackInfra,
      hazehash: 'MH9uNPMASIfqmp1wITpb5UVQmpirph4hUXm51U0MWLxdEd3pYlcPDVXltk3dRAxQ',
    },
    layout: {
      image: techStackLayout,
      hazehash: 'MH_QsPsISK_wwbxijF52fXEscTeFfOMadUldHSUncabOWyVVl0MS1l5xUWdVMVpy',
    },
    devops: {
      image: techStackDevops,
      hazehash: 'MH_xsPugSIfwfVVM17WQKVMum9MPqYms4lRqXKt0tqITjrSxWQyoam4IbQasIwnI',
    },
  };

  const fallbackImage = techStackImages.main!;

  const skillsList = computed(() => getListItem('about.skills_list'));

  const techCategories = computed<TechCategory[]>(() => {
    const techStack = tm('about.tech_stack');
    if (!techStack || typeof techStack !== 'object' || Array.isArray(techStack)) {
      return [];
    }

    return Object.entries(techStack)
      .filter(([, category]) => {
        return (
          category &&
          typeof category === 'object' &&
          typeof (category as Record<string, unknown>).title === 'string' &&
          typeof (category as Record<string, unknown>).items === 'object'
        );
      })
      .map(([categoryKey, category]) => ({
        key: categoryKey,
        image: techStackImages[categoryKey] ?? fallbackImage,
        title: (category as Record<string, unknown>).title as string,
        description: (category as Record<string, unknown>).description as string,
        items: getListItem(`about.tech_stack.${categoryKey}.items`),
      }));
  });

  watch(
    isVisible,
    visible => {
      if (visible) {
        start();
      } else {
        stop();
      }
    },
    { immediate: true },
  );

  defineExpose({ container });
</script>

<template>
  <div ref="container" class="about">
    <div class="about__top">
      <canvas ref="abuotWave" class="about__wave" />
      <div ref="contentRef" class="about__top-content">
        <div class="about__top-title">{{ t('about.top_title') }}</div>
        <div class="about__top-sub-title">{{ t('about.top_sub_title') }}</div>
        <div class="about__top-description">
          {{ t('about.top_description') }}
        </div>
      </div>
    </div>
    <!-- <WavesDebugPanel :config="wavesConfig" /> -->
    <div class="about__container">
      <div class="about__skills">
        <div v-for="skill in skillsList" :key="skill.key" class="about__skills-item">
          <span class="about__skill-icon" :class="`about__skill-icon_${skill.key}`" />
          <span class="about__skill-title">{{ skill.title }}</span>
          <span class="about__skill-description">{{ skill.description }}</span>
        </div>
        <div class="about__skills-conclusion">
          <div class="about__skills-conclusion-text">{{ t('about.conclusion') }}</div>
        </div>
      </div>
      <div class="about__tech-stack">
        <div class="about__tech-stack-title">{{ t('about.tech_stack_title') }}</div>

        <div class="about__tech-stack-content">
          <template v-for="category in techCategories" :key="category.key">
            <div class="about__tech-category">
              <div class="about__tech-category-header">
                <VImage
                  class="about__tech-category-image"
                  :src="category.image.image"
                  :hazehash="category.image.hazehash"
                  :width="300"
                  :height="300"
                  :alt="category.title"
                  :lazy="true"
                  ssrPlaceholder
                />
                <div class="about__tech-category-title">
                  {{ category.title }}
                </div>
              </div>
              <div class="about__tech-list">
                <div
                  v-for="item in category.items"
                  :key="item.key"
                  class="about__tech-list-item"
                >
                  <div class="about__tech-item-title">
                    {{ item.title }}
                  </div>
                  <div class="about__tech-item-description">
                    {{ item.description }}
                  </div>
                </div>
              </div>
              <div class="about__tech-category-info" v-html="category.description" />
            </div>
          </template>
        </div>
      </div>
    </div>
    <AiFeature />
  </div>
</template>
