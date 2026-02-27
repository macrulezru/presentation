<script setup lang="ts">
  import './pipeline-points.scss';

  import PipelineStepBlock from '../pipeline-step-block/pipeline-step-block.vue';

  import { type PointModel } from '@/models/points.model';
import { useI18n } from '~/composables/useI18n';

  interface Props {
    departurePoint: PointModel | null;
    arrivalPoint: PointModel | null;
  }

  const props = defineProps<Props>();
  const { t } = useI18n();
</script>

<template>
  <PipelineStepBlock data>
    <template #header>
      <span class="pipeline-points__label">
        {{ t('pipeline-demo.pointsLabel') }} {{ props.arrivalPoint?.nameRu }}
      </span>
    </template>
    <template #body>
      <div class="pipeline-points__data">
        <div class="pipeline-points__point">
          <div class="pipeline-points__code">{{ props.departurePoint?.code }}</div>
          <div>{{ props.departurePoint?.nameRu }}</div>
        </div>
        <div class="pipeline-points__flight-path">
          <div class="pipeline-points__flight-line"></div>
        </div>
        <div class="pipeline-points__point">
          <div class="pipeline-points__code">{{ props.arrivalPoint?.code }}</div>
          <div>{{ props.arrivalPoint?.nameRu }}</div>
        </div>
      </div>
    </template>
  </PipelineStepBlock>
</template>
