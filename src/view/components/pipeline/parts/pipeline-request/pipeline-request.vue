<script setup lang="ts">
  import PipelineStepBlock from '../pipeline-step-block/pipeline-step-block.vue';

import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();
  const props = defineProps<{ url: string }>();
</script>

<template>
  <PipelineStepBlock request>
    <template #header>
      <span class="pipeline-request__label">{{ t('pipeline-demo.requestLabel') }}</span>
    </template>
    <template #body>
      <span class="pipeline-request__url">{{ props.url }}</span>
    </template>
  </PipelineStepBlock>
</template>
