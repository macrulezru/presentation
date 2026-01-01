import UiLoadingSpinner from '../ui-loading-spinner.vue';

import type { Props } from '../types';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof UiLoadingSpinner> = {
  title: 'UI/LoadingSpinner',
  component: UiLoadingSpinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Компактный спиннер с локализованной подписью. Можно скрыть текст или передать свой слот.',
      },
    },
  },
  argTypes: {
    size: {
      description: 'Размер спиннера',
      options: ['small', 'medium', 'large'],
      control: { type: 'inline-radio' },
    },
    showText: { description: 'Показывать подпись под спиннером', control: 'boolean' },
    textKey: { description: 'Ключ перевода для подписи', control: 'text' },
  },
  args: {
    size: 'medium',
    showText: true,
    textKey: 'common.loading',
  },
};

type Story = StoryObj<Props>;

export const Default: Story = {};

export const WithoutText: Story = {
  args: { showText: false },
};

export const CustomSlot: Story = {
  render: args => ({
    components: { UiLoadingSpinner },
    setup() {
      return { args };
    },
    template: `
      <UiLoadingSpinner v-bind="args">
        Скачиваем данные...
      </UiLoadingSpinner>
    `,
  }),
};

export default meta;
