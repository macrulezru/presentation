<script setup lang="ts">
  import { useCabinDoors } from '../../../composables/useCabinDoors';
  import { useCabinFuselage } from '../../../composables/useCabinFuselage';

  import RowMap from './RowMap.vue';

  import type { Cell, Door } from '../../../types/seatmap.types';

  import { useI18n } from '~/composables/useI18n';

  interface CabinData {
    cabinId: string;
    cabinClass: string | undefined;
    serviceClass: string | undefined;
    doors: Door[];
    rows: {
      rowNumber: number;
      rowProps: string[];
      cells: Cell[];
      seatLetters: string[];
    }[];
  }

  interface Props {
    cabin: CabinData;
    flightId: string;
    segmentId: string;
    interactive: boolean;
    selectedSeatIds: string[];
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    'seat-click': [seatId: string];
  }>();

  const { t } = useI18n();

  function handleSeatClick(seatId: string) {
    emit('seat-click', seatId);
  }

  const { columns } = useCabinFuselage(() => props.cabin);

  const { frontDoorSides, rearDoorSides } = useCabinDoors(() => props.cabin.doors);
</script>

<template>
  <div class="cabin-map">
    <div v-if="columns.length" class="column-headers" aria-hidden="true">
      <span
        v-for="(col, index) in columns"
        :key="index"
        class="header-slot"
        :class="col.type === 'aisle' ? 'header-aisle' : 'header-seat'"
      >
        {{ col.type === 'seat' ? col.letter : '' }}
      </span>
    </div>

    <div v-if="frontDoorSides.length" class="door-indicator" aria-hidden="true">
      <span v-if="frontDoorSides.includes('left')" class="door-icon door-icon-left">
        {{ t('seatmap-demo.cabin.door_left') }}
      </span>
      <span v-if="frontDoorSides.includes('right')" class="door-icon door-icon-right">
        {{ t('seatmap-demo.cabin.door_right') }}
      </span>
    </div>

    <div class="rows-container">
      <RowMap
        v-for="row in props.cabin.rows"
        :key="row.rowNumber"
        :row="row"
        :flightId="flightId"
        :segmentId="segmentId"
        :interactive="interactive"
        :selectedSeatIds="selectedSeatIds"
        @seat-click="handleSeatClick"
      />
    </div>

    <div v-if="rearDoorSides.length" class="door-indicator" aria-hidden="true">
      <span v-if="rearDoorSides.includes('left')" class="door-icon door-icon-left">
        {{ t('seatmap-demo.cabin.door_left') }}
      </span>
      <span v-if="rearDoorSides.includes('right')" class="door-icon door-icon-right">
        {{ t('seatmap-demo.cabin.door_right') }}
      </span>
    </div>
  </div>
</template>

<style scoped>
  .cabin-map {
    padding: 8px 0;
  }

  .rows-container {
    display: flex;
    flex-direction: column;
  }

  .column-headers {
    display: flex;
    gap: 4px;
    padding-bottom: 4px;
  }

  .header-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: #888;
  }

  .header-seat {
    width: 40px;
  }

  .header-aisle {
    width: 40px;
  }

  .door-indicator {
    position: relative;
    height: 18px;
    margin: 2px 0;
  }

  .door-icon {
    position: absolute;
    top: 0;
    font-size: 11px;
    font-weight: 600;
    color: #757575;
  }

  .door-icon-left {
    left: 0;
  }

  .door-icon-right {
    right: 0;
  }
</style>
