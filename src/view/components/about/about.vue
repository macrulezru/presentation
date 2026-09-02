<script setup lang="ts">
  import '@/view/components/about/about.scss';

  import {
    computed,
    onMounted,
    onUnmounted,
    ref,
    type ComponentPublicInstance,
  } from 'vue';

  import type { ListItem } from '@/view/components/about/types';

  import TechStackArtHorizontal from '@/view/assets/images/tech-stack-art-horizontal.webp';
  import TechStackArt from '@/view/assets/images/tech-stack-art.webp';
  import AiFeature from '@/view/components/about/parts/ai-feature/ai-feature.vue';
  import UiImage from '@/view/ui/ui-image/ui-image.vue';
  import { useI18n } from '~/composables/useI18n';
  import { useResponsive } from '~/composables/useResponsive';

  const { t, tm } = useI18n();

  const responsive = useResponsive();
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
    title: string;
    items: ListItem[];
    iconClass?: string;
  }

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
        title: (category as Record<string, unknown>).title as string,
        items: getListItem(`about.tech_stack.${categoryKey}.items`),
      }));
  });

  const activeTipIndex = ref(0);
  const categoryRefs = ref<Record<string, HTMLElement>>({});

  const techTips = computed<string[]>(() => {
    const keys = ['main', 'infra', 'layout'];
    return keys.map(key => {
      const desc = tm(`about.tech_stack.${key}.description`);
      return typeof desc === 'string' ? desc : '';
    });
  });

  const activeTip = computed(() => techTips.value[activeTipIndex.value] || '');

  const setCategoryRef = (key: string, el: Element | ComponentPublicInstance | null) => {
    if (el && el instanceof HTMLElement) {
      categoryRefs.value[key] = el;
    }
  };

  const handleCategoryIntersection = () => {
    if (Object.keys(categoryRefs.value).length === 0) return;

    const visibleCategories = Object.entries(categoryRefs.value).map(([key, el]) => {
      const rect = el?.getBoundingClientRect();
      const isVisible = rect && rect.top < window.innerHeight * 0.5 && rect.bottom > 0;
      return { key, isVisible, top: rect?.top || 0 };
    });

    const visibleCategory = visibleCategories
      .filter(({ isVisible }) => isVisible)
      .sort((a, b) => b.top - a.top)[0];

    if (visibleCategory) {
      const newIndex = techCategories.value.findIndex(c => c.key === visibleCategory.key);
      if (newIndex !== -1) {
        activeTipIndex.value = newIndex;
      }
    }
  };

  onMounted(() => {
    window.addEventListener('scroll', handleCategoryIntersection, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleCategoryIntersection);
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
        <div class="about__tech-stack-side">
          <div class="about__tech-stack-side-wrapper">
            <UiImage
              :image="{
                src: { src: TechStackArt, width: '700px', height: '467px' },
                tablet: { src: TechStackArtHorizontal, width: '800px', height: '450px' },
                alt: 'Tech stack',
              }"
              class="about__tech-art"
            />
            <div v-show="responsive.desktop">
              <Transition name="tech-tip-fade" mode="out-in">
                <div
                  v-if="activeTip"
                  :key="activeTipIndex"
                  class="about__tech-tip"
                  :class="{ 'about__tech-tip_active': activeTip }"
                >
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div class="about__tech-tip-wrapper" v-html="activeTip" />
                </div>
              </Transition>
            </div>
          </div>
        </div>
        <div class="about__tech-stack-wrapper">
          <div class="about__tech-stack-title">{{ t('about.tech_stack_title') }}</div>

          <div class="about__tech-stack-content">
            <template v-for="(category, index) in techCategories" :key="category.key">
              <div
                :ref="el => setCategoryRef(category.key, el)"
                class="about__tech-category"
              >
                <div class="about__tech-category-title">
                  {{ category.title }}
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
              </div>
              <span
                v-if="index !== techCategories.length - 1"
                class="about__tech-category-separator"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
    <AiFeature />
  </div>
</template>
