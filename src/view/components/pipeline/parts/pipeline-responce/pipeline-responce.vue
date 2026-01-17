<script setup lang="ts">
  import './pipeline-responce.scss';

  import PipelineStepBlock from '../pipeline-step-block/pipeline-step-block.vue';

  import { useI18n } from '@/view/composables/use-i18n.ts';
  import UiColorCode from '@/view/ui/ui-color-code/ui-color-code.vue';

  const { t } = useI18n();

  const props = defineProps<{ data: unknown }>();
</script>

<template>
  <PipelineStepBlock response>
    <template #header>
      <span class="pipeline-request__label">{{ t('pipeline-demo.responseLabel') }}</span>
    </template>
    <template #body>
      <div class="pipeline-responce__json">
        <UiColorCode :code="props.data" />
      </div>
    </template>
  </PipelineStepBlock>
</template>
