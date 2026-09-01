<script setup lang="ts">
  import './pipeline-step-status.scss';

  import UiLoading from '@/view/ui/ui-loading/ui-loading.vue';

  interface Props {
    label?: string | number;
    status?: 'pending' | 'success' | 'error' | undefined;
    isLast?: boolean;
  }

  const props = defineProps<Props>();
</script>

<template>
  <div
    class="pipeline-step-status"
    :class="{ 'pipeline-step-status_lined': props.status === 'success' && !props.isLast }"
  >
    <div
      class="pipeline-step-status__indicator"
      :class="{
        'pipeline-step-status__indicator_loaded': props.status === 'success',
      }"
    >
      <UiLoading
        v-if="props.status === 'pending'"
        class="pipeline-step-status__loading"
        type="circle"
        :circleRadius="20"
        :thickness="5"
        strokeColor="#151515"
        progressColor="#78cf05"
      />
      <div v-if="props.label" class="pipeline-step-status__label">{{ props.label }}</div>
    </div>
  </div>
</template>
