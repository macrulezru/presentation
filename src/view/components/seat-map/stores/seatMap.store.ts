import { defineStore } from 'pinia';
import { ref, shallowRef, computed } from 'vue';

import { SeatMapModel, SeatMapUtils } from '../models/seatmap.model';
import { parseSeatId } from '../utils/seatId';

import type { DeckModel } from '../models/seatmap.model';
import type { UniversalSeatMap } from '../types/seatmap.types';

export const useSeatMapStore = defineStore('seatmap', () => {
  // Состояние
  // shallowRef: модель заменяется целиком при загрузке и никогда не мутируется
  // изнутри, поэтому глубокая реактивность по всему графу классов не нужна
  const model = shallowRef<SeatMapModel | null>(null);
  const activeFlightId = ref<string | null>(null);
  const activeSegmentId = ref<string | null>(null);
  const selectedSeatIds = ref<string[]>([]);

  // Геттеры
  const activeFlight = computed(() => {
    if (!model.value || !activeFlightId.value) return null;
    return model.value.getFlightById(activeFlightId.value);
  });

  const activeSegment = computed(() => {
    if (!activeFlight.value || !activeSegmentId.value) return null;
    return activeFlight.value.getSegmentById(activeSegmentId.value);
  });

  const allFlights = computed(() => model.value?.getFlights() || []);

  const flightInfo = computed(() => {
    return allFlights.value.map(f => ({
      flightId: f.getId(),
      direction: f.getDirection(),
      segments: f.getSegments().map(s => ({
        segmentId: s.getId(),
        departureAirport: s.getDepartureAirport(),
        arrivalAirport: s.getArrivalAirport(),
        departureDatetime: s.getDepartureDateTime(),
        arrivalDatetime: s.getArrivalDateTime(),
      })),
    }));
  });

  const currentSegmentInfo = computed(() => {
    const seg = activeSegment.value;
    if (!seg) return null;
    return {
      segmentId: seg.getId(),
      departureAirport: seg.getDepartureAirport(),
      arrivalAirport: seg.getArrivalAirport(),
      departureDatetime: seg.getDepartureDateTime(),
      arrivalDatetime: seg.getArrivalDateTime(),
    };
  });

  // Палубы активного сегмента (или все, если сегмент не выбран)
  const decks = computed((): DeckModel[] | [] => {
    if (activeSegment.value) {
      return activeSegment.value.getDecks();
    }
    // Если нет сегмента, возвращаем все палубы первого рейса
    const firstFlight = allFlights.value[0];
    if (firstFlight) {
      const firstSeg = firstFlight.getSegments()[0];
      return firstSeg?.getDecks() || [];
    }
    return [];
  });

  // Доступные опции сегментов для текущего рейса
  const segmentOptions = computed(() => {
    const flight = activeFlight.value;
    if (!flight) return [];
    return flight.getSegments().map(s => ({
      value: s.getId(),
      label: `${s.getDepartureAirport() || '?'} → ${s.getArrivalAirport() || '?'}`,
    }));
  });

  // Методы
  function loadSeatMap(raw: UniversalSeatMap) {
    // 1. Полностью сбрасываем все состояния
    activeFlightId.value = null;
    activeSegmentId.value = null;
    selectedSeatIds.value = [];

    // 2. Создаём новую модель
    model.value = new SeatMapModel(raw);

    // 3. Автоматически выбираем первый рейс и первый сегмент (если есть)
    const firstFlight = model.value.getFlights()[0];
    if (firstFlight) {
      activeFlightId.value = firstFlight.getId();
      const firstSeg = firstFlight.getSegments()[0];
      if (firstSeg) {
        activeSegmentId.value = firstSeg.getId();
      }
    }
  }

  function setActiveFlight(id: string) {
    if (!model.value) return;
    const flight = model.value.getFlightById(id);
    if (flight) {
      activeFlightId.value = id;
      // Сбрасываем сегмент на первый
      const firstSeg = flight.getSegments()[0];
      activeSegmentId.value = firstSeg?.getId() || null;
    }
  }

  function setActiveSegment(id: string) {
    if (!activeFlight.value) return;
    const segment = activeFlight.value.getSegmentById(id);
    if (segment) {
      activeSegmentId.value = id;
    }
  }

  // Повторный клик по уже выбранному месту снимает выбор. Иначе — место
  // должно быть свободным (нельзя выбрать занятое/недоступное), и на каждом
  // сегменте может быть выбрано только одно место — новый выбор вытесняет
  // предыдущий на ТОМ ЖЕ сегменте, но не трогает выбор на других сегментах
  // (например, места на "туда" и "обратно" выбираются независимо).
  function toggleSeat(seatId: string) {
    const index = selectedSeatIds.value.indexOf(seatId);
    if (index !== -1) {
      selectedSeatIds.value.splice(index, 1);
      return;
    }

    if (!model.value) return;
    const { flightId, segmentId, rowNumber, letter } = parseSeatId(seatId);
    const seat = SeatMapUtils.findSeat(
      model.value,
      flightId,
      segmentId,
      rowNumber,
      letter,
    );
    if (!seat || !seat.isAvailable()) return;

    selectedSeatIds.value = [
      ...selectedSeatIds.value.filter(id => parseSeatId(id).segmentId !== segmentId),
      seatId,
    ];
  }

  function clearSelection() {
    selectedSeatIds.value = [];
  }

  return {
    model,
    activeFlightId,
    activeSegmentId,
    selectedSeatIds,
    activeFlight,
    activeSegment,
    allFlights,
    flightInfo,
    currentSegmentInfo,
    decks,
    segmentOptions,
    loadSeatMap,
    setActiveFlight,
    setActiveSegment,
    toggleSeat,
    clearSelection,
  };
});
