<script setup lang="ts">
  import '@/view/components/experience-timeline/experience-timeline.scss';

  import { ref, computed } from 'vue';

  import { useExperienceItems } from './experience-items';

  import { useI18n } from '@/view/composables/use-i18n';
  import { useResponsive } from '@/view/composables/use-responsive';
  import Button from '@/view/ui/ui-button/ui-button.vue';
  import LinkArrow from '@/view/ui/ui-link-arrow/ui-link-arrow.vue';

  const { t } = useI18n();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const showAll = ref(false);

  // Показываем только первые 4 компании, если не нажата кнопка "Показать все"

  const experienceItems = useExperienceItems(t);
  const displayedItems = computed(() => {
    return showAll.value ? experienceItems.value : experienceItems.value.slice(0, 4);
  });

  // Проверяем, есть ли скрытые элементы
  const hasMore = computed(() => experienceItems.value.length > 4 && !showAll.value);
</script>

<template>
  <div class="experience">
    <div class="experience__container">
      <h2 class="experience__title">{{ t('experience.title') }}</h2>

      <div class="experience__timeline">
        <div
          v-for="item in displayedItems"
          :key="item.id"
          class="experience__item"
          :class="{ 'experience__item_no-logo': !item.logo }"
        >
          <div
            v-if="((isMobile || isTablet) && item.logo) || isDesktop"
            class="experience__logo-container"
          >
            <img
              v-if="item.logo"
              class="experience__logo"
              :src="item.logo"
              :alt="item.company"
            />
          </div>
          <div class="experience__card">
            <div class="experience__card-header">
              <h3 class="experience__company">
                <template v-if="item.url">
                  <a
                    v-if="item.url"
                    class="experience__link"
                    :href="item.url"
                    target="_blank"
                  >
                    {{ item.company }}
                    <LinkArrow />
                  </a>
                </template>
                <template v-else>
                  {{ item.company }}
                </template>
              </h3>
              <div>
                <div v-if="item.period" class="experience__period">
                  {{ item.period }}
                </div>
                <div class="experience__position">{{ item.position }}</div>
              </div>
            </div>
            <div class="experience__description">
              {{ item.description }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="experience__button-container">
        <Button fullWidth :text="t('experience.showAllButton')" @click="showAll = true" />
      </div>
    </div>
  </div>
</template>
