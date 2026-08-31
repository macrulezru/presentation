<script setup lang="ts">
  import '@/view/components/experience-timeline/parts/company-item/company-item.scss';

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
    logo_url?: string;
  }

  interface Props {
    company: CompanyItem;
    isHeader?: boolean;
  }

  const props = defineProps<Props>();
</script>

<template>
  <div class="company-item" :class="{ 'company-item_header': props.isHeader }">
    <div class="company-item__header">
      <div>
        <div
          class="company-item__logo"
          :class="{ 'company-item__logo_blank': !props.company.logo }"
        >
          <img
            v-if="props.company.logo"
            :src="props.company.logo_url"
            :alt="props.company.company"
          />
        </div>
      </div>
      <div class="company-item__header-data">
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
    </div>
    <div class="company-item__description">
      {{ props.company.description }}
    </div>
  </div>
</template>
