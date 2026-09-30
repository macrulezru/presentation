import type { Row } from '../types/seatmap.types';

/**
 * Признаки, которые физически относятся к ряду целиком (крыло, аварийный
 * выход — конструктивные особенности салона), а не к отдельному месту,
 * но в исходных данных авиакомпаний обычно проставляются на уровне мест
 * (SeatFeature). Ряд считается несущим признак, если хотя бы одно место
 * в нём имеет соответствующий SeatFeature.
 *
 * Единая логика для всех драйверов (вызывается после построения rows),
 * чтобы не дублировать вычисление в каждом из ak1Driver/ak2Driver/ak3Driver.
 */
const ROW_LEVEL_FEATURES = ['Overwing', 'Exit', 'ExtraLegRoom'] as const;

/**
 * Дополняет rowProps ряда признаками из ROW_LEVEL_FEATURES, если хотя бы
 * одно место в ряду несёт соответствующий SeatFeature. Служебные ряды
 * (Bulkhead/NoRow) не трогает — в них нет мест типа 'seat', проверка
 * естественным образом не находит совпадений.
 */
export function deriveRowLevelFeatures(row: Row): Row {
  const existingProps = row.rowProps ?? [];
  const derived = ROW_LEVEL_FEATURES.filter(
    feature =>
      !existingProps.includes(feature) &&
      row.cells.some(cell => cell.kind === 'seat' && cell.features.includes(feature)),
  );

  if (derived.length === 0) return row;

  return {
    ...row,
    rowProps: [...existingProps, ...derived],
  };
}

/** То же самое, но сразу для всего списка рядов салона. */
export function deriveRowLevelFeaturesForRows(rows: Row[]): Row[] {
  return rows.map(deriveRowLevelFeatures);
}
