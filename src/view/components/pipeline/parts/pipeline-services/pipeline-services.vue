<script setup lang="ts">
  import './pipeline-services.scss';

  import PipelineStepBlock from '../pipeline-step-block/pipeline-step-block.vue';

  import type { ServiceModel } from '@/models/services.model';

  import { useI18n } from '@/view/composables/use-i18n.ts';

  interface Props {
    services: ServiceModel[] | null;
  }

  const props = defineProps<Props>();
  const { t } = useI18n();
</script>

<template>
  <PipelineStepBlock data>
    <template #header>
      <span class="pipeline-services__label">{{ t('pipeline-demo.servicesLabel') }}</span>
    </template>
    <template #body>
      <div class="pipeline-services">
        <div
          v-for="service in props.services"
          :key="service.id || service.name"
          class="pipeline-service-item"
        >
          <div class="pipeline-services__name">{{ service.name }}</div>
        </div>
      </div>
    </template>
  </PipelineStepBlock>
</template>
