export interface SelectOption {
  /** Значение опции */
  value: string;
  /** Отображаемое имя опции */
  name: string;
}

export interface Props {
  /** Текущее выбранное значение (v-model) */
  modelValue?: SelectOption;

  /** Массив доступных опций */
  options: SelectOption[];

  /** Текст плейсхолдера */
  placeholder?: string;
}

export interface Emits {
  /** Событие обновления значения (v-model) */
  (e: 'update:modelValue', value: SelectOption): void;

  /** Событие изменения значения */
  (e: 'change', value: SelectOption): void;
}
