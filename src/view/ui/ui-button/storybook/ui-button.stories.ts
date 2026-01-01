import UiButton from '../ui-button.vue';

import type { Props } from '../types';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof UiButton> = {
  title: 'UI/Button',
  component: UiButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Кнопка для основных действий: поддерживает размеры, состояния, вариации цвета и работу через слот.',
      },
    },
  },
  argTypes: {
    text: {
      description: 'Текст внутри кнопки (используется, если не задан слот)',
      control: 'text',
    },
    variant: {
      description: 'Цветовая схема кнопки',
      options: ['primary', 'secondary', 'ghost'],
      control: { type: 'inline-radio' },
    },
    fullWidth: {
      description: 'Растягивать на всю ширину родителя',
      control: 'boolean',
    },
    small: {
      description: 'Компактная высота',
      control: 'boolean',
    },
    micro: {
      description: 'Минимальная высота и отступы',
      control: 'boolean',
    },
    disabled: {
      description: 'Отключенное состояние',
      control: 'boolean',
    },
    gray: {
      description: 'Серый фон вместо брендового',
      control: 'boolean',
    },
    reset: {
      description: 'Сброс базовых стилей браузера',
      control: 'boolean',
    },
    control: {
      description: 'Стиль для контролов (иконки и т.п.)',
      control: 'boolean',
    },
  },
  args: {
    text: 'Кнопка',
    variant: 'primary',
    fullWidth: false,
    small: false,
    micro: false,
    disabled: false,
    gray: false,
    reset: false,
    control: false,
  },
};

type Story = StoryObj<Props>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', text: 'Вторичная' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', text: 'Ghost' },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
};

export const Disabled: Story = {
  args: { disabled: true, text: 'Disabled' },
};

export const WithSlot: Story = {
  render: args => ({
    components: { UiButton },
    setup() {
      return { args };
    },
    template: '<UiButton v-bind="args"><span>Слот содержимое</span></UiButton>',
  }),
};

export default meta;
