<script setup lang="ts">
  import { useSeatRow } from '../../../composables/useSeatRow';

  import type { SeatRowData } from '../../../composables/useSeatRow';

  import { useI18n } from '~/composables/useI18n';

  interface Props {
    row: SeatRowData;
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

  const {
    isBulkhead,
    isServiceRow,
    isOverwing,
    isExitRow,
    isExtraLegRoom,
    seatNumber,
    isSeatSelected,
    isSeatClickable,
    handleSeatClick,
    handleSeatKeydown,
    getSeatClasses,
    isBulkheadCell,
    isNoRowCell,
    ariaLabelFor,
  } = useSeatRow(props, seatId => emit('seat-click', seatId));
</script>

<template>
  <div
    class="row-map"
    :class="{
      'row-bulkhead': isBulkhead,
      'row-service': isServiceRow && !isBulkhead,
      'row-overwing': isOverwing,
      'row-exit': isExitRow,
      'row-extraspace': isExtraLegRoom,
    }"
  >
    <span v-if="isExitRow" class="exit-marker exit-marker-left" aria-hidden="true">
      {{ t('seatmap-demo.row.exit_left') }}
    </span>
    <span v-if="isExitRow" class="exit-marker exit-marker-right" aria-hidden="true">
      {{ t('seatmap-demo.row.exit_right') }}
    </span>
    <div
      class="row-cells"
      :role="isBulkhead ? 'separator' : undefined"
      :aria-label="isBulkhead ? t('seatmap-demo.row.bulkhead') : undefined"
    >
      <div
        v-for="(cell, index) in row.cells"
        :key="index"
        class="cell"
        :class="{
          'cell-empty': cell.kind === 'empty',
          'cell-aisle': cell.kind === 'aisle',
          'cell-seat': cell.kind === 'seat',
          ...(cell.kind === 'seat' ? getSeatClasses(cell) : {}),
          'cell-bulkhead': isBulkheadCell(cell),
          'cell-no-row': isNoRowCell(cell),
        }"
        :role="isSeatClickable(cell) ? 'button' : undefined"
        :tabindex="isSeatClickable(cell) ? 0 : undefined"
        :aria-hidden="cell.kind !== 'seat' ? true : undefined"
        :aria-label="ariaLabelFor(cell)"
        :aria-pressed="
          cell.kind === 'seat' && isSeatClickable(cell)
            ? isSeatSelected(cell.letter)
            : undefined
        "
        :aria-disabled="cell.kind === 'seat' && !isSeatClickable(cell) ? true : undefined"
        @click="
          isSeatClickable(cell) && cell.kind === 'seat' && handleSeatClick(cell.letter)
        "
        @keydown="handleSeatKeydown($event, cell)"
      >
        <template v-if="cell.kind === 'seat'">
          <span class="seat-number">{{ seatNumber(cell.letter) }}</span>
          <span v-if="cell.price" class="seat-price">
            {{ cell.price }}{{ cell.currency }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .row-map {
    position: relative; /* точка отсчёта для .exit-marker и выступа крыла */
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }

  .row-bulkhead {
    padding: 6px 0;
  }

  .row-service {
    opacity: 0.5;
  }

  .row-extraspace {
    padding-top: 22px;
  }

  .row-overwing {
    background: rgb(222 241 255 / 10%);
  }

  .row-overwing::before,
  .row-overwing::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 34px;
    background: rgb(222 241 255 / 10%);
  }

  .row-overwing::before {
    left: -34px;
    border-left: 2px solid #9199a0;
  }

  .row-overwing::after {
    right: -34px;
    border-right: 2px solid #9199a0;
  }

  .exit-marker {
    position: absolute;
    top: 4px;
    display: flex;
    align-items: center;
    color: #e53935;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    pointer-events: none;
  }

  .exit-marker-left {
    left: 0;
  }

  .exit-marker-right {
    right: 0;
  }

  .row-cells {
    display: flex;
    gap: 4px;
    flex: 1;
  }

  .cell {
    width: 40px;
    height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 10px;
    user-select: none;
  }

  .cell-empty {
    background: transparent;
  }

  .cell-aisle {
    background: transparent;
    width: 40px;
  }

  .cell-no-row {
    background: transparent;
    border: none;
  }

  .cell-bulkhead {
    background: #d0d0d0;
    border: 1px solid #bdbdbd;
    border-radius: 2px;
    opacity: 0.5;
  }

  .row-bulkhead .cell-bulkhead {
    position: relative;
    background: transparent;
    border: none;
    opacity: 1;
  }

  .row-bulkhead .cell-bulkhead::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    background: #bdbdbd;
    transform: translateY(-50%);
  }

  .cell-seat {
    background: #e8f4f8;
    border: 1px solid transparent;
    color: var(--color-background);
    cursor: default;
  }

  .cell-seat.seat-interactive {
    cursor: pointer;
  }

  .cell-seat.seat-interactive:focus-visible {
    outline: 2px solid #4caf50;
    outline-offset: 2px;
  }

  .cell-seat.seat-available {
    background: #ebf8e8;
  }

  .cell-seat.seat-occupied {
    background: #252325;
    border-color: #524e52;
    color: #7c787c;
    cursor: not-allowed;
  }

  .cell-seat.seat-blocked {
    background: #e0e0e0;
    border-color: #999;
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cell-seat.seat-selected {
    background: #569700;
    border-color: #afe46b;
    color: white;
  }

  .seat-number {
    font-weight: bold;
    font-size: 10px;
  }

  .seat-price {
    font-size: 7px;
  }
</style>
