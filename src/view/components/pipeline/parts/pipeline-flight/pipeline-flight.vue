<script setup lang="ts">
  import './pipeline-flight.scss';

  import { computed } from 'vue';

  import PipelineStepBlock from '../pipeline-step-block/pipeline-step-block.vue';

  import { type FlightModel } from '@/models/availability.model';
  import { useI18n } from '@/view/composables/use-i18n.ts';

  interface Props {
    flight: FlightModel | null;
  }

  const props = defineProps<Props>();
  const { t } = useI18n();

  const segmentData = computed(() => {
    console.log(props.flight?.getSegment());
    return props.flight?.getSegment();
  });
</script>

<template>
  <PipelineStepBlock data>
    <template #header>
      <span class="pipeline-flight__label">{{ t('pipeline-demo.flightLabel') }}</span>
    </template>
    <template #body>
      <div class="pipeline-flight">
        <div v-if="segmentData" class="pipeline-flight__route">
          <div>
            <div class="pipeline-flight__direction">
              {{ t('pipeline-demo.departure') }}
            </div>
            {{ segmentData.departureDate }} {{ segmentData.departureTime }}
          </div>
          <div class="pipeline-flight__flight-path">
            <div class="pipeline-flight__flight-line"></div>
          </div>
          <div>
            <div class="pipeline-flight__direction">{{ t('pipeline-demo.arrival') }}</div>
            {{ segmentData.arrivalDate }} {{ segmentData.arrivalTime }}
          </div>
        </div>
        <div v-if="props.flight && props.flight.offers.length">
          <div>
            <div class="pipeline-flight__fare-options">
              {{ t('pipeline-demo.fareOptions') }}
            </div>
            <div
              v-for="(offer, idx) in props.flight.offers"
              :key="idx"
              class="pipeline-flight__options"
            >
              <div
                v-for="(service, sidx) in offer.fareServices"
                :key="sidx"
                class="pipeline-flight__option"
              >
                {{ service.name }}: {{ service.value }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PipelineStepBlock>
</template>
