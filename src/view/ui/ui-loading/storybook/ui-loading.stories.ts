import UiLoading from '../ui-loading.vue';

import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof UiLoading> = {
  title: 'UI/Loading',
  component: UiLoading,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div style="min-width: 400px; display: inline-block;"><story /></div>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Индикатор загрузки в виде полосы прогресса или кольца. Поддерживает детерминированный и индетерминированный режимы.',
      },
    },
  },
  argTypes: {
    type: {
      description: 'Тип индикатора',
      options: ['bar', 'circle'],
      control: { type: 'inline-radio' },
    },
    progress: {
      description:
        'Текущее значение прогресса (0–100). Если не задан, индикатор становится индетерминированным.',
      control: { type: 'number', min: 0, max: 100 },
    },
    thickness: {
      description: 'Толщина линии/полосы',
      control: { type: 'number', min: 1, max: 30 },
    },
    circleRadius: {
      description: 'Радиус круга (для type="circle")',
      control: { type: 'number', min: 20, max: 120 },
    },
    strokeColor: { description: 'Цвет фона прогресса', control: 'color' },
    progressColor: { description: 'Цвет заполнения прогресса', control: 'color' },
    percentageColor: { description: 'Цвет текста процента', control: 'color' },
    barStrokeColor: { description: 'Цвет рамки полосы', control: 'color' },
    barStrokeWidth: {
      description: 'Толщина рамки полосы',
      control: { type: 'number', min: 0, max: 10 },
    },
    barInset: {
      description: 'Внутренний отступ рамки',
      control: { type: 'number', min: 0, max: 10 },
    },
  },
  args: {
    type: 'bar',
    progress: 42,
    thickness: 8,
    circleRadius: 48,
    strokeColor: '#e0e0e0',
    progressColor: '#048eed',
    percentageColor: '#048eed',
    barStrokeColor: '#e0e0e0',
    barStrokeWidth: 1,
    barInset: 1,
  },
};

type Story = StoryObj<typeof meta>;

export const Bar: Story = {};

export const BarIndeterminate: Story = {
  args: { progress: undefined },
};

export const Circle: Story = {
  args: { type: 'circle', progress: 68 },
};

export const CircleIndeterminate: Story = {
  args: { type: 'circle', progress: undefined },
};

export default meta;
