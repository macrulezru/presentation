<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

  import { useSeatMapRenderer } from '../../../composables/useSeatMapRenderer';

  import DeckMap from './DeckMap.vue';
  import SeatMapLegend from './SeatMapLegend.vue';

  import { useI18n } from '~/composables/useI18n';

  interface Props {
    interactive?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    interactive: true,
  });

  const { t } = useI18n();

  const renderer = useSeatMapRenderer();
  const { formatDateTime } = renderer;

  function handleFlightChange(flightId: string) {
    renderer.setActiveFlight(flightId);
  }

  function handleSegmentChange(segmentId: string) {
    renderer.setActiveSegment(segmentId);
  }

  function handleSeatClick(seatId: string) {
    renderer.toggleSeat(seatId);
  }

  function formatFlightRoute(flight: any) {
    if (!flight || !flight.segments || flight.segments.length === 0) {
      return '';
    }
    const firstSegment = flight.segments[0];
    const lastSegment = flight.segments[flight.segments.length - 1];
    return `${firstSegment.departureAirport} → ${lastSegment.arrivalAirport}`;
  }

  defineEmits<{
    'seat-click': [seatId: string];
  }>();

  /* -------------------------------------------------------------------------
   * Автомасштабирование карты мест.
   *
   *  - transform: scale() на .deck-scaler сжимает карту визуально.
   *  - transform не влияет на layout, поэтому .deck-wrapper продолжает
   *    занимать "натуральную" высоту. Чтобы убрать пустое место снизу,
   *    явно выставляем высоту wrapper'а как naturalHeight * scale.
   *  - overflow: hidden на wrapper'е обрезает нижнюю часть scaler'а
   *    (там, где после scale уже нет видимого контента).
   *  - ResizeObserver слушает изменение ширины wrapper'а; изменение
   *    transform не триггерит observer, поэтому цикла нет.
   * ---------------------------------------------------------------------- */

  const deckWrappers = ref<(HTMLElement | null)[]>([]);
  const deckScalers = ref<(HTMLElement | null)[]>([]);
  const deckScales = ref<number[]>([]);
  const deckWrapperHeights = ref<(number | null)[]>([]);

  let resizeObserver: ResizeObserver | null = null;
  let rafId: number | null = null;

  function setDeckWrapperRef(
    el: Element | ComponentPublicInstance | null,
    index: number,
  ) {
    deckWrappers.value[index] = (el as HTMLElement) ?? null;
  }

  function setDeckScalerRef(el: Element | ComponentPublicInstance | null, index: number) {
    deckScalers.value[index] = (el as HTMLElement) ?? null;
  }

  function scheduleScaleUpdate() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      updateDeckScales();
    });
  }

  function updateDeckScales() {
    const nextScales: number[] = [];
    const nextHeights: (number | null)[] = [];

    deckWrappers.value.forEach((wrapper, index) => {
      const scaler = deckScalers.value[index];

      if (!wrapper || !scaler) {
        nextScales[index] = 1;
        nextHeights[index] = null;
        return;
      }

      const cs = getComputedStyle(wrapper);
      const paddingX =
        (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const availableWidth = wrapper.clientWidth - paddingX;

      // offsetWidth/offsetHeight не зависят от transform — это натуральные размеры
      const naturalWidth = scaler.offsetWidth;
      const naturalHeight = scaler.offsetHeight;

      let scale = 1;
      if (naturalWidth > 0 && availableWidth > 0 && naturalWidth > availableWidth) {
        scale = availableWidth / naturalWidth;
      }

      nextScales[index] = scale;
      nextHeights[index] = scale >= 1 ? null : naturalHeight * scale;
    });

    deckScales.value = nextScales;
    deckWrapperHeights.value = nextHeights;
  }

  function setupObserver() {
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(() => scheduleScaleUpdate());

    deckWrappers.value.forEach(el => {
      if (el) resizeObserver!.observe(el);
    });
  }

  onMounted(async () => {
    await nextTick();
    setupObserver();
    updateDeckScales();
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  // Пересобираем наблюдателей и считаем scale при смене набора колод
  // (переключение рейса/сегмента, загрузка нового драйвера).
  watch(
    () => renderer.deckData.value.map(d => d.deckId).join('|'),
    async () => {
      await nextTick();
      setupObserver();
      updateDeckScales();
    },
  );

  // При смене активного сегмента контент карты может измениться — пересчитываем.
  watch(
    () => renderer.activeSegmentId.value,
    async () => {
      await nextTick();
      scheduleScaleUpdate();
    },
  );

  function deckScalerStyle(index: number) {
    const scale = deckScales.value[index] ?? 1;
    if (scale >= 1) return {};
    return {
      transform: `scale(${scale})`,
      transformOrigin: 'top center',
    };
  }

  function deckWrapperStyle(index: number) {
    const h = deckWrapperHeights.value[index];
    if (h == null || h <= 0) return {};
    return { height: `${h}px` };
  }
</script>

<template>
  <div class="seat-map-viewer">
    <div
      v-if="renderer.currentSegmentInfo.value || renderer.flightInfo.value.length"
      class="flight-info-panel"
    >
      <div v-if="renderer.flightInfo.value.length > 1" class="flight-selector">
        <div class="selector-label">{{ t('seatmap-demo.viewer.flight_label') }}</div>
        <div class="flight-list">
          <div
            v-for="flight in renderer.flightInfo.value"
            :key="flight.flightId"
            class="flight-item"
            :class="{
              'flight-item_active': renderer.activeFlightId.value === flight.flightId,
            }"
            @click="handleFlightChange(flight.flightId)"
          >
            {{ flight.flightId }}
            <span v-if="formatFlightRoute(flight)">
              — {{ formatFlightRoute(flight) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="renderer.segmentOptions.value.length > 1" class="segment-selector">
        <div class="selector-label">{{ t('seatmap-demo.viewer.segment_label') }}</div>
        <div class="segment-list">
          <div
            v-for="opt in renderer.segmentOptions.value"
            :key="opt.value"
            class="segment-item"
            :class="{
              'segment-item_active': renderer.activeSegmentId.value === opt.value,
            }"
            @click="handleSegmentChange(opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>

      <div v-if="renderer.currentSegmentInfo.value" class="segment-info">
        <div class="route-info">
          <div class="airport-block">
            <div class="point-info">
              <span class="airport-label">{{ t('seatmap-demo.viewer.departure') }}</span>
              <span class="datetime-value">
                {{ formatDateTime(renderer.currentSegmentInfo.value.departureDatetime) }}
              </span>
            </div>
            <span class="airport-code">
              {{ renderer.currentSegmentInfo.value.departureAirport || '—' }}
            </span>
          </div>
          <div class="route-arrow">→</div>
          <div class="airport-block">
            <div class="point-info">
              <span class="airport-label">{{ t('seatmap-demo.viewer.arrival') }}</span>
              <span class="datetime-value">
                {{ formatDateTime(renderer.currentSegmentInfo.value.arrivalDatetime) }}
              </span>
            </div>
            <span class="airport-code">
              {{ renderer.currentSegmentInfo.value.arrivalAirport || '—' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="seat-map-viewer__seatmap">
      <SeatMapLegend
        v-if="renderer.hasData.value"
        class="seat-map-viewer__seatmap-legend"
      />

      <div
        v-for="(deck, index) in renderer.deckData.value"
        :key="deck.deckId"
        :ref="el => setDeckWrapperRef(el, index)"
        class="deck-wrapper"
        :style="deckWrapperStyle(index)"
      >
        <div
          :ref="el => setDeckScalerRef(el, index)"
          class="deck-scaler"
          :style="deckScalerStyle(index)"
        >
          <DeckMap
            :deck="deck"
            :flightId="deck.flightId"
            :segmentId="deck.segmentId"
            :interactive="props.interactive"
            :selectedSeatIds="renderer.selectedSeatIds.value"
            @seat-click="handleSeatClick"
          >
            <template #cabin-header="{ cabin }">
              <slot name="cabin-header" :cabin="cabin" />
            </template>
          </DeckMap>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .seat-map-viewer {
    .flight-info-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 40px;
    }

    .flight-selector,
    .segment-selector {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;

      .selector-label {
        display: block;
        color: var(--color-4);
        font-size: 14px;
      }
    }

    .flight-list,
    .segment-list {
      display: flex;
      border: solid 1px var(--color-7);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .flight-item,
    .segment-item {
      padding: 15px 20px;
      border-right: solid 1px var(--color-7);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      color: var(--color-4);
      user-select: none;

      &:not(.flight-item_active, .segment-item_active):hover {
        background-color: rgb(255 255 255 / 10%);
        border-color: rgb(255 255 255 / 20%);
      }

      &_active {
        color: var(--color-background);
        background-color: var(--color-success);
      }

      &:last-child {
        border-right: none;
      }
    }

    .route-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
    }

    .airport-block {
      display: flex;
      flex-direction: column;
    }

    .point-info {
      display: flex;
      flex-direction: column;
    }

    .datetime-value {
      color: var(--color-4);
      font-size: 14px;
    }

    .airport-code {
      font-size: 30px;
      font-weight: 900;
    }

    .segment-info {
      background-color: #101010;
      padding: 20px;
      margin: 0 -30px;
      border-top: solid 1px var(--color-7);
      border-bottom: solid 1px var(--color-7);

      @include media-small-tablet {
        margin: 0 -20px;
      }
    }

    &__seatmap {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      gap: 60px;

      @include media-small-tablet {
        flex-direction: column;
        align-items: stretch;
        gap: 30px;
      }
    }

    &__seatmap-legend {
      position: sticky;
      top: 160px;
      flex-shrink: 0;

      @include media-small-tablet {
        position: relative;
        top: unset;
      }
    }

    .deck-wrapper {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 0 30px;
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
      transition: height 0.15s ease-out;
    }

    .deck-scaler {
      flex-shrink: 0;
      transform-origin: top center;
      transition: transform 0.15s ease-out;
      will-change: transform;
    }
  }
</style>
