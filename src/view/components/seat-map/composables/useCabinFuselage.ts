// composables/useCabinFuselage.ts
import { computed } from 'vue';

import type { Cell } from '../types/seatmap.types';

export interface FuselageRowData {
  rowNumber: number;
  rowProps?: string[];
  cells: Cell[];
}

export interface FuselageCabinData {
  rows: FuselageRowData[];
}

export type ColumnSlot = { type: 'seat'; letter: string } | { type: 'aisle' };

export interface ZoneRange {
  startIndex: number;
  endIndex: number;
}

function isContentRow(row: FuselageRowData): boolean {
  const props = row.rowProps ?? [];
  return !props.includes('Bulkhead') && !props.includes('NoRow');
}

/**
 * Геометрия салона, производная от списка рядов — то, что нужно скину для
 * отрисовки силуэта фюзеляжа: раскладка колонок (буквы мест/проходы — для
 * заголовка над сеткой) и относительное положение зон крыла/аварийного
 * выхода вдоль салона (индексы рядов; скин сам переводит их в проценты
 * высоты при рисовании крыльев/стрелок).
 *
 * Принимает геттер, а не готовое значение — так `computed` внутри реально
 * реагирует на смену салона (например, при переключении сегмента/рейса,
 * когда `cabin` целиком заменяется новым объектом), а не застревает на
 * значении, которое было на момент вызова composable.
 */
export function useCabinFuselage(getCabin: () => FuselageCabinData) {
  const rowCount = computed(() => getCabin().rows.length);

  // Раскладку колонок собираем со всех "содержательных" рядов (не перегородка
  // и не служебный), а не с первого попавшегося — единичное заблокированное
  // место в одном ряду (EmptyCell среди обычных мест) не должно испортить
  // общий заголовок, если в других рядах на этой позиции есть настоящее место.
  const columns = computed<ColumnSlot[]>(() => {
    const contentRows = getCabin().rows.filter(isContentRow);
    if (contentRows.length === 0) return [];

    const width = Math.max(...contentRows.map(row => row.cells.length));
    const slots: ColumnSlot[] = Array.from({ length: width }, () => ({ type: 'aisle' }));

    for (const row of contentRows) {
      row.cells.forEach((cell, index) => {
        if (cell.kind === 'seat' && slots[index].type !== 'seat') {
          slots[index] = { type: 'seat', letter: cell.letter };
        }
      });
    }

    return slots;
  });

  function findZone(feature: string): ZoneRange | null {
    const indices = getCabin()
      .rows.map((row, index) => ({
        index,
        has: row.rowProps?.includes(feature) ?? false,
      }))
      .filter(r => r.has)
      .map(r => r.index);
    if (indices.length === 0) return null;
    return { startIndex: indices[0], endIndex: indices[indices.length - 1] };
  }

  const wingZone = computed<ZoneRange | null>(() => findZone('Overwing'));

  const exitRowIndices = computed<number[]>(() =>
    getCabin()
      .rows.map((row, index) => ({
        index,
        isExit: row.rowProps?.includes('Exit') ?? false,
      }))
      .filter(r => r.isExit)
      .map(r => r.index),
  );

  return { rowCount, columns, wingZone, exitRowIndices };
}
