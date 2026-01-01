import UiCircleChart from '../ui-circle-chart.vue';

import type { Props } from '../types';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof UiCircleChart> = {
  title: 'UI/CircleChart',
  component: UiCircleChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Круговая диаграмма с анимацией и автостартом при появлении во вьюпорте. Поддерживает подпись и кастомный слот.',
      },
    },
  },
  argTypes: {
    value: {
      description: 'Значение прогресса в процентах (0–100)',
      control: { type: 'number', min: 0, max: 100 },
    },
    segmentColor: { description: 'Цвет сегмента прогресса', control: 'color' },
    size: {
      description: 'Размер компонента (px)',
      control: { type: 'number', min: 80, max: 600 },
    },
    lineThick: {
      description: 'Толщина линии круга',
      control: { type: 'number', min: 1, max: 80 },
    },
    strokeColor: { description: 'Цвет фонового круга', control: 'color' },
    showValue: { description: 'Показывать процент в центре', control: 'boolean' },
    valueFontSize: {
      description: 'Размер текста значения',
      control: { type: 'number', min: 8, max: 80 },
    },
    valueColor: { description: 'Цвет текста значения', control: 'color' },
    animationDuration: {
      description: 'Длительность анимации (мс)',
      control: { type: 'number', min: 100, max: 5000, step: 50 },
    },
    animateOnMount: {
      description: 'Запускать анимацию при монтировании',
      control: 'boolean',
    },
    autoPlay: {
      description: 'Автостарт при каждом входе во вьюпорт',
      control: 'boolean',
    },
    autoPlayOnce: {
      description: 'Автостарт только при первом появлении',
      control: 'boolean',
    },
    autoPlayThreshold: {
      description: 'Порог видимости для автостарта (0–1)',
      control: { type: 'number', min: 0, max: 1, step: 0.05 },
    },
    autoPlayDelay: {
      description: 'Задержка перед автозапуском (мс)',
      control: { type: 'number', min: 0, max: 5000, step: 50 },
    },
    label: { description: 'Подпись под диаграммой или слот', control: 'text' },
  },
  args: {
    value: 72,
    segmentColor: '#42b883',
    size: 280,
    lineThick: 22,
    strokeColor: '#e3e3e3',
    showValue: true,
    valueFontSize: 28,
    valueColor: '#333333',
    animationDuration: 900,
    animateOnMount: true,
    autoPlay: false,
    autoPlayOnce: false,
    autoPlayThreshold: 0.5,
    autoPlayDelay: 0,
    label: 'Прогресс выполнения',
  },
};

type Story = StoryObj<Props>;

export const Default: Story = {};

export const AutoPlayOnce: Story = {
  args: {
    autoPlayOnce: true,
    autoPlay: false,
    animateOnMount: false,
    autoPlayDelay: 200,
  },
};

export const WithSlot: Story = {
  render: args => ({
    components: { UiCircleChart },
    setup() {
      return { args };
    },
    template: `
      <UiCircleChart v-bind="args">
        <div style="text-align:center;">До цели осталось 28%</div>
      </UiCircleChart>
    `,
  }),
};

export default meta;
