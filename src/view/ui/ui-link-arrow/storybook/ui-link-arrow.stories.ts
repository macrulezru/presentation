import UiLinkArrow from '../ui-link-arrow.vue';

import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof UiLinkArrow> = {
  title: 'UI/LinkArrow',
  component: UiLinkArrow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Минимальный декоративный индикатор ссылки со стрелкой. Можно использовать внутри текстовых ссылок или карточек.',
      },
    },
  },
};

type Story = StoryObj;

export const Default: Story = {};

export default meta;
