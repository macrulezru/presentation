export interface Props {
  /**
   * Значение в процентах (0-100)
   * @example 75
   */
  value: number;

  /**
   * Цвет сегмента прогресса
   * @example "#42b883"
   */
  segmentColor: string;

  /**
   * Размер компонента в пикселях (ширина и высота)
   * @default 300
   */
  size?: number;

  /**
   * Толщина линии круга
   * @default 20
   */
  lineThick?: number;

  /**
   * Цвет фонового круга
   * @default "#e3e3e3"
   */
  strokeColor?: string;

  /**
   * Показывать ли значение в центре
   * @default true
   */
  showValue?: boolean;

  /**
   * Размер шрифта для значения
   * @default 28
   */
  valueFontSize?: number;

  /**
   * Цвет текста значения
   * @default "#333333"
   */
  valueColor?: string;

  /**
   * Длительность анимации в миллисекундах
   * @default 1000
   */
  animationDuration?: number;

  /**
   * Запускать анимацию сразу после монтирования
   * @default false
   * @remarks Работает только если не указаны autoPlay или autoPlayOnce
   */
  animateOnMount?: boolean;

  /**
   * Автоматический запуск анимации при каждом появлении во вьюпорте
   * @default false
   * @remarks При скролле туда-обратно анимация будет повторяться
   */
  autoPlay?: boolean;

  /**
   * Однократный автоматический запуск анимации при первом появлении во вьюпорте
   * @default false
   * @remarks Приоритет над autoPlay, если указаны оба
   */
  autoPlayOnce?: boolean;

  /**
   * Порог видимости для автостарта (0.0-1.0)
   * @default 0.5
   * @remarks 0.0 = любая видимость, 1.0 = полностью виден
   */
  autoPlayThreshold?: number;

  /**
   * Задержка перед запуском анимации в миллисекундах
   * @default 0
   */
  autoPlayDelay?: number;

  /**
   * Описание графика
   * @default 0
   */
  label?: string;
}
