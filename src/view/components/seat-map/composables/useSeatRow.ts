// composables/useSeatRow.ts
import { computed } from 'vue';

import { generateSeatId } from '../utils/seatId';

import type { Cell } from '../types/seatmap.types';

export interface SeatRowData {
  rowNumber: number;
  rowProps?: string[];
  cells: Cell[];
}

export interface UseSeatRowOptions {
  row: SeatRowData;
  flightId: string;
  segmentId: string;
  interactive: boolean;
  selectedSeatIds: string[];
}

const AVAILABILITY_LABELS: Record<string, string> = {
  available: 'свободно',
  occupied: 'занято',
  blocked: 'недоступно',
  unavailable: 'недоступно',
};

/**
 * Вся "универсальная" логика одного ряда карты мест — не завязанная на то,
 * КАК её рисовать (это дело конкретного скина: skinA/skinB/skinC). Определение
 * перегородки/служебного ряда/крыла/аварийного выхода по rowProps, ID и номер
 * места, состояние выбора, доступность клика, aria-описание.
 *
 * Скин импортирует composable и решает только вопросы разметки/стилей —
 * саму логику независимо переиспользуют все скины, не дублируя её.
 */
export function useSeatRow(
  props: UseSeatRowOptions,
  onSeatClick: (seatId: string) => void,
) {
  // Перегородка — не ряд с местами, а структурный разделитель салона (может
  // стоять как в начале салона, так и между любыми двумя рядами). Драйверы
  // помечают её через rowProps на основе содержимого ряда (нет ни одного
  // настоящего места), а не по позиции/номеру.
  const isBulkhead = computed(() => props.row.rowProps?.includes('Bulkhead') ?? false);

  // Служебный ряд (без мест)
  const isServiceRow = computed(() => props.row.rowProps?.includes('NoRow') ?? false);

  // Ряд над крылом — вычислено драйвером на этапе конвертации в универсальный
  // формат по наличию у мест признака Overwing (см. drivers/rowFeatures.ts)
  const isOverwing = computed(() => props.row.rowProps?.includes('Overwing') ?? false);

  // Ряд у аварийного выхода — тем же механизмом, что и Overwing
  const isExitRow = computed(() => props.row.rowProps?.includes('Exit') ?? false);

  // Ряд с увеличенным пространством для ног (в т.ч. ряд у аварийного выхода —
  // физически там всегда больше места из-за двери) — тем же механизмом
  const isExtraLegRoom = computed(
    () => props.row.rowProps?.includes('ExtraLegRoom') ?? false,
  );

  function buildSeatId(letter: string): string {
    return generateSeatId(props.flightId, props.segmentId, props.row.rowNumber, letter);
  }

  // Полный номер места (например "12F")
  function seatNumber(letter: string): string {
    return `${props.row.rowNumber}${letter}`;
  }

  function isSeatSelected(letter: string): boolean {
    return props.selectedSeatIds.includes(buildSeatId(letter));
  }

  // Единое условие "кликабельности" ячейки — используется и для клика, и в
  // разметке для role/tabindex/aria-*, и в обработчике клавиатуры. Занятое/
  // заблокированное место выбрать нельзя — availability должна быть 'available'
  // (сам выбор при этом её не меняет, поэтому уже выбранное место остаётся
  // кликабельным — можно снять выбор)
  function isSeatClickable(cell: Cell): boolean {
    return (
      cell.kind === 'seat' &&
      cell.availability === 'available' &&
      props.interactive &&
      !isServiceRow.value
    );
  }

  function handleSeatClick(letter: string) {
    onSeatClick(buildSeatId(letter));
  }

  function handleSeatKeydown(event: KeyboardEvent, cell: Cell) {
    if (!isSeatClickable(cell) || cell.kind !== 'seat') return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    // Пробел по умолчанию скроллит страницу — гасим это только для наших "кнопок"
    event.preventDefault();
    handleSeatClick(cell.letter);
  }

  function getSeatClasses(cell: Cell): Record<string, boolean> {
    if (cell.kind !== 'seat') return {};
    return {
      'seat-available': cell.availability === 'available',
      'seat-occupied': cell.availability === 'occupied',
      'seat-blocked':
        cell.availability === 'blocked' || cell.availability === 'unavailable',
      'seat-selected': isSeatSelected(cell.letter),
      'seat-interactive': isSeatClickable(cell),
    };
  }

  // Отдельное заблокированное/недоступное место внутри обычного ряда (не сама
  // перегородка целиком, а лишь одна её ячейка)
  function isBulkheadCell(cell: Cell): boolean {
    return (cell.kind === 'empty' && cell.props?.includes('Bulkhead')) ?? false;
  }

  function isNoRowCell(cell: Cell): boolean {
    return (cell.kind === 'empty' && cell.props?.includes('NoRow')) ?? false;
  }

  function ariaLabelFor(cell: Cell): string | undefined {
    if (cell.kind !== 'seat') return undefined;
    const status = AVAILABILITY_LABELS[cell.availability] ?? cell.availability;
    const selected = isSeatSelected(cell.letter) ? ', выбрано' : '';
    const exit = isExitRow.value ? ', у аварийного выхода' : '';
    const wing = isOverwing.value ? ', над крылом' : '';
    const legRoom = isExtraLegRoom.value ? ', увеличенное пространство для ног' : '';
    return `Место ${seatNumber(cell.letter)}, ${status}${selected}${exit}${wing}${legRoom}`;
  }

  return {
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
  };
}
