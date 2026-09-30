<script setup lang="ts">
  import { computed } from 'vue';

  import CabinMap from './CabinMap.vue';

  interface DeckData {
    deckId: string;
    deckName: string | undefined;
    cabins: {
      cabinId: string;
      cabinClass: string | undefined;
      serviceClass: string | undefined;
      doors: import('../../../types/seatmap.types').Door[];
      rows: {
        rowNumber: number;
        rowProps: string[];
        cells: import('../../../types/seatmap.types').Cell[];
        seatLetters: string[];
      }[];
    }[];
  }

  interface Props {
    deck: DeckData;
    flightId: string;
    segmentId: string;
    interactive: boolean;
    selectedSeatIds: string[];
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    'seat-click': [seatId: string];
  }>();

  function handleSeatClick(seatId: string) {
    emit('seat-click', seatId);
  }

  // Силуэт фюзеляжа (нос/хвост/стенки) рассчитан на один салон на палубу —
  // ровно так все три текущих драйвера и моковый генератор всегда и строят
  // данные. Если салонов несколько (гипотетический бизнес+эконом на одной
  // палубе), контур пока не рисуем — не хотим показывать геометрию, которая
  // в этом случае была бы просто неверной.
  const hasFuselage = computed(() => props.deck.cabins.length === 1);
</script>

<template>
  <div class="deck-map">
    <div class="fuselage" :class="{ 'fuselage-plain': !hasFuselage }">
      <svg
        v-if="hasFuselage"
        class="fuselage-cap fuselage-nose"
        viewBox="0 0 200 50"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,50 Q0,0 100,0 Q200,0 200,50 Z" />
      </svg>

      <div class="fuselage-body">
        <div class="cabins-container">
          <CabinMap
            v-for="cabin in props.deck.cabins"
            :key="cabin.cabinId"
            :cabin="cabin"
            :flightId="flightId"
            :segmentId="segmentId"
            :interactive="interactive"
            :selectedSeatIds="selectedSeatIds"
            @seat-click="handleSeatClick"
          >
            <template #cabin-header="{ cabin: c }">
              <slot name="cabin-header" :cabin="c" />
            </template>
          </CabinMap>
        </div>
      </div>

      <svg
        v-if="hasFuselage"
        class="fuselage-cap fuselage-tail"
        viewBox="0 0 200 50"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,0 Q0,50 100,50 Q200,50 200,0 Z" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
  .fuselage {
    display: flex;
    flex-direction: column;
    width: fit-content;
    max-width: 100%;
    margin: 0 auto;
  }

  .fuselage-cap {
    display: block;
    width: 100%;
    height: 36px;
    fill: var(--color-7);
    flex-shrink: 0;
  }

  .fuselage-body {
    background: var(--color-7);
    padding: 4px 16px;
    overflow: visible;
  }

  /* Без силуэта (несколько салонов на палубе) — старое простое оформление
  рамкой, без носа/хвоста/крыльев (см. hasFuselage) */
  .fuselage-plain .fuselage-body {
    border: 2px solid #bdbdbd;
    border-radius: 12px;
    padding: 16px;
  }

  .cabins-container {
    display: flex;
    flex-direction: column;
  }
</style>
