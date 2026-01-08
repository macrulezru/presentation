<script setup lang="ts">
  import '@/view/components/experience-timeline/parts/company-item/company-item.scss';

  import { ref } from 'vue';

  import LinkArrow from '@/view/ui/ui-link-arrow/ui-link-arrow.vue';

  interface CompanyItem {
    id: string;
    company: string;
    position: string;
    description: string;
    period?: string;
    duration?: string;
    url?: string;
    logo?: string;
  }

  interface Props {
    company: CompanyItem;
    isHeader?: boolean;
  }

  const props = defineProps<Props>();
  const isHovered = ref(false);

  let showTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const DESCRIPTION_SHOW_DELAY = 300;

  const handleMouseEnter = () => {
    if (props.isHeader) return;

    showTimeoutId = setTimeout(() => {
      isHovered.value = true;
    }, DESCRIPTION_SHOW_DELAY);
  };

  const handleMouseLeave = () => {
    if (showTimeoutId) {
      clearTimeout(showTimeoutId);
      showTimeoutId = null;
    }
    isHovered.value = false;
  };
</script>

<template>
  <div
    class="company-item"
    :class="{ 'company-item_header': props.isHeader }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div v-if="props.company.logo" class="company-item__logo-wrapper">
      <div class="company-item__logo-container">
        <div class="company-item__logo">
          <img :src="props.company.logo" :alt="props.company.company" />
        </div>
      </div>
    </div>
    <div class="company-item__header">
      <div class="company-item__name">
        <template v-if="props.company.url">
          <a
            v-if="props.company.url"
            class="company-item__link"
            :href="props.company.url"
            target="_blank"
          >
            {{ props.company.company }}
            <LinkArrow class="company-item__link-arrow" />
          </a>
        </template>
        <div v-else>
          {{ props.company.company }}
        </div>
      </div>
      <div class="company-item__data">
        <div v-if="props.company.period" class="company-item__period">
          {{ props.company.period }}
        </div>
        <div class="company-item__position">{{ props.company.position }}</div>
      </div>
    </div>
    <div
      class="company-item__description"
      :class="{
        'company-item__description_visible': props.isHeader || isHovered,
      }"
    >
      {{ props.company.description }}
    </div>
  </div>
</template>
