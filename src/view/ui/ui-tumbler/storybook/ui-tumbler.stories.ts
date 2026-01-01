import { ref, watch } from 'vue';

import UiTumbler from '../ui-tumbler.vue';

import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof UiTumbler> = {
  title: 'UI/Tumbler',
  component: UiTumbler,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Переключатель с индикатором и опциональной подписью. Эмитит событие toggle по клику.',
      },
    },
  },
  argTypes: {
    active: { description: 'Текущее состояние переключателя', control: 'boolean' },
    shortcut: {
      description: 'Текстовый шорткат (отображается в title или подсказках)',
      control: 'text',
    },
    ariaLabel: { description: 'Подпись для ассистивных технологий', control: 'text' },
  },
  args: {
    active: false,
    shortcut: 'Shift+T',
    ariaLabel: 'Переключить режим',
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { UiTumbler },
    setup() {
      const state = ref(!!args.active);

      watch(
        () => args.active,
        value => {
          state.value = !!value;
        },
      );

      const handleToggle = () => {
        state.value = !state.value;
      };

      return { args, state, handleToggle };
    },
    template: `
      <UiTumbler
        :active="state"
        :shortcut="args.shortcut"
        :aria-label="args.ariaLabel"
        @toggle="handleToggle"
      >
        Уведомления
      </UiTumbler>
    `,
  }),
};

export default meta;
