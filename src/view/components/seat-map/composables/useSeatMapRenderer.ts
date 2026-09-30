// composables/useSeatMapRenderer.ts
import { computed } from 'vue';

import { useSeatMapStore } from '../stores/seatMap.store';

export function useSeatMapRenderer() {
  const store = useSeatMapStore();

  // Просто читаем геттеры стора через computed — Pinia уже реактивна сама
  // по себе, отдельный ref+watch(deep)+ручное копирование только дублирует
  // её реактивность и пересчитывает глубокое равенство на каждый чих.
  const currentSegmentInfo = computed(() => store.currentSegmentInfo);
  const flightInfo = computed(() => store.flightInfo);
  const segmentOptions = computed(() => store.segmentOptions);
  const activeFlightId = computed(() => store.activeFlightId);
  const activeSegmentId = computed(() => store.activeSegmentId);
  const selectedSeatIds = computed(() => store.selectedSeatIds);
  const hasData = computed(() => store.decks.length > 0);

  // Преобразуем DeckModel в простые объекты для отрисовки
  const deckData = computed(() =>
    store.decks.map(deck => ({
      deckId: deck.getId(),
      deckName: deck.getName(),
      // flightId/segmentId нужны для построения составного ID места (см. utils/seatId.ts),
      // без них ряды с одинаковым номером на разных сегментах/рейсах будут конфликтовать
      flightId: deck.getSegment().getFlight().getId(),
      segmentId: deck.getSegment().getId(),
      cabins: deck.getCabins().map(cabin => ({
        cabinId: cabin.getId(),
        cabinClass: cabin.getCabinClass(),
        serviceClass: cabin.getServiceClass(),
        doors: cabin.getDoors(),
        rows: cabin.getRows().map(row => ({
          rowNumber: row.getNumber(),
          rowProps: row.getRowProps(),
          cells: row.getCells(),
          seatLetters: row.getSeatCells().map(seat => seat.getLetter()),
        })),
      })),
    })),
  );

  // ---- Методы управления ----
  function setActiveFlight(flightId: string) {
    store.setActiveFlight(flightId);
  }

  function setActiveSegment(segmentId: string) {
    store.setActiveSegment(segmentId);
  }

  function toggleSeat(seatId: string) {
    store.toggleSeat(seatId);
  }

  function isSeatSelected(seatId: string): boolean {
    return store.selectedSeatIds.includes(seatId);
  }

  function formatDateTime(isoString?: string): string {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  }

  // ---- Возвращаем данные ----
  return {
    // Данные для отрисовки (простые объекты)
    deckData,
    currentSegmentInfo,
    flightInfo,
    segmentOptions,
    activeFlightId,
    activeSegmentId,
    selectedSeatIds,
    hasData,

    // Методы управления
    setActiveFlight,
    setActiveSegment,
    toggleSeat,
    isSeatSelected,

    // Утилиты
    formatDateTime,
  };
}
