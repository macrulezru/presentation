<script setup lang="ts">
  import '@/view/components/about/about.scss';

  import { computed, ref } from 'vue';

  import type { ListItem } from '@/view/components/about/types';

  import techStackMain from '@/view/assets/images/tech-stack-1.webp';
  import techStackInfra from '@/view/assets/images/tech-stack-2.webp';
  import techStackLayout from '@/view/assets/images/tech-stack-3.webp';
  import techStackDevops from '@/view/assets/images/tech-stack-4.webp';
  import AiFeature from '@/view/components/about/parts/ai-feature/ai-feature.vue';
  import { useI18n } from '~/composables/useI18n';

  const { t, tm } = useI18n();
  const container = ref<HTMLElement>();

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
    image: string;
    title: string;
    description: string;
    items: ListItem[];
  }

  const techStackImages: Record<string, string> = {
    main: techStackMain,
    infra: techStackInfra,
    layout: techStackLayout,
    devops: techStackDevops,
  };

  const fallbackImage = techStackMain;

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

  defineExpose({ container });
</script>

<template>
  <div ref="container" class="about">
    <div class="about__container">
      <div class="about__top">
        <div class="about__top-background about__top-background_top" />
        <div class="about__top-content">
          <div class="about__top-title">{{ t('about.top_title') }}</div>
          <div class="about__top-sub-title">{{ t('about.top_sub_title') }}</div>
          <div class="about__top-description">
            {{ t('about.top_description') }}
          </div>
        </div>
        <div class="about__top-background about__top-background_bottom" />
      </div>
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
                  :src="category.image"
                  :width="300"
                  :height="300"
                  :alt="category.title"
                  :lazy="true"
                  thumbhash="1+cNHYI3iHeFh3iPh5d4h7ZwZQl4"
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
