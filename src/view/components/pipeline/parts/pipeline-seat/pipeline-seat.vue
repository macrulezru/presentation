<script setup lang="ts">
  import './pipeline-seat.scss';

  import PipelineStepBlock from '../pipeline-step-block/pipeline-step-block.vue';

  import { type SeatModel } from '@/models/seatmap.model';
import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();

  interface Props {
    seat: SeatModel | null;
  }

  const props = defineProps<Props>();

  // Используем локализацию для props
</script>

<template>
  <PipelineStepBlock data>
    <template #header>
      <span class="pipeline-seat__label">{{ t('pipeline-demo.seatLabel') }}</span>
    </template>
    <template #body>
      <div class="pipeline-seat">
        <template v-if="props.seat">
          <div class="pipeline-seat__seat-info">
            <div class="pipeline-seat__seat">{{ t('pipeline-demo.seat') }}</div>
            {{ props.seat.freetext }}
          </div>
          <div v-if="props.seat.props.length">
            <div class="pipeline-seat__seat-props">
              {{ t('pipeline-demo.seatProps') }}
            </div>
            <div class="pipeline-seat__props">
              <div v-for="p in props.seat.props" :key="p" class="pipeline-seat__prop">
                {{ t('seat.props.' + p) }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </PipelineStepBlock>
</template>
