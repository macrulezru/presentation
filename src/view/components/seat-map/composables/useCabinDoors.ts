// composables/useCabinDoors.ts
import { computed } from 'vue';

import type { Door } from '../types/seatmap.types';

export type DoorSide = 'left' | 'right';

// 'both' — это фактически две отдельные двери (по одной на каждую сторону
// фюзеляжа), а не одна широкая — разворачиваем сразу, чтобы скину не нужно
// было думать про этот частный случай
function expandSides(door: Door): DoorSide[] {
  return door.side === 'both' ? ['left', 'right'] : [door.side];
}

/**
 * Универсальная логика дверей салона: группировка по положению вдоль
 * фюзеляжа (перед/за средней частью). Двери не привязаны к конкретному
 * ряду (см. Cabin.doors) — скин решает, как и где их нарисовать.
 *
 * Принимает геттер, а не готовый массив — так `computed` внутри реально
 * реагирует на смену салона (например, при переключении сегмента/рейса),
 * а не застревает на значении, которое было на момент вызова composable.
 */
export function useCabinDoors(getDoors: () => Door[] | undefined) {
  const frontDoorSides = computed<DoorSide[]>(() =>
    (getDoors() ?? []).filter(d => d.position === 'front').flatMap(expandSides),
  );
  const rearDoorSides = computed<DoorSide[]>(() =>
    (getDoors() ?? []).filter(d => d.position === 'rear').flatMap(expandSides),
  );
  const midDoorSides = computed<DoorSide[]>(() =>
    (getDoors() ?? []).filter(d => d.position === 'mid').flatMap(expandSides),
  );

  const hasDoors = computed(
    () =>
      frontDoorSides.value.length > 0 ||
      rearDoorSides.value.length > 0 ||
      midDoorSides.value.length > 0,
  );

  return { frontDoorSides, rearDoorSides, midDoorSides, hasDoors };
}
