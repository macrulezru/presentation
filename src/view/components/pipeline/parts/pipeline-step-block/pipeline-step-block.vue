<script setup lang="ts">
  import './pipeline-step-block.scss';

  import { computed, useSlots } from 'vue';

  interface Props {
    request?: boolean;
    response?: boolean;
    data?: boolean;
  }

  const props = defineProps<Props>();

  const isHeader = computed(() => {
    return !!useSlots().header;
  });

  const headerClass = computed(() => {
    if (props.request && !props.response && !props.data) {
      return 'pipeline-step-block__header_request';
    }
    if (!props.request && props.response && !props.data) {
      return 'pipeline-step-block__header_response';
    }
    if (!props.request && !props.response && props.data) {
      return 'pipeline-step-block__header_data';
    }
    return '';
  });
</script>

<template>
  <transition name="pipeline-step-block-slide-fade-up" appear>
    <div class="pipeline-step-block">
      <div v-if="isHeader" class="pipeline-step-block__header" :class="headerClass">
        <slot name="header" />
      </div>
      <div class="pipeline-step-block__body"><slot name="body" /></div>
    </div>
  </transition>
</template>
