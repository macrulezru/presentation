import { ref, watch } from 'vue';

import UiSelect from '../ui-select.vue';

import type { Props, SelectOption } from '../types';
import type { Meta, StoryObj } from '@storybook/vue3';

const options: SelectOption[] = [
  { value: 'vue', name: 'Vue 3' },
  { value: 'react', name: 'React' },
  { value: 'svelte', name: 'Svelte' },
  { value: 'angular', name: 'Angular' },
];

const meta: Meta<typeof UiSelect> = {
  title: 'UI/Select',
  component: UiSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Кастомный выпадающий список с клавиатурной навигацией, подсветкой активного пункта и v-model.',
      },
    },
  },
  argTypes: {
    modelValue: {
      description: 'Текущее выбранное значение (SelectOption) для v-model',
      control: 'object',
    },
    options: {
      description: 'Массив доступных опций { value, name }',
      control: 'object',
    },
    placeholder: { description: 'Текст плейсхолдера', control: 'text' },
  },
  args: {
    modelValue: options[0],
    options,
    placeholder: 'Выберите фреймворк',
  },
};

type Story = StoryObj<Props>;

export const Default: Story = {
  render: args => ({
    components: { UiSelect },
    setup() {
      const model = ref(args.modelValue);

      watch(
        () => args.modelValue,
        value => {
          model.value = value;
        },
      );

      const handleUpdate = (value: SelectOption) => {
        model.value = value;
      };

      return { args, model, handleUpdate };
    },
    template: `
      <div style="min-height: 350px; max-width: 320px; padding: 1rem; background: linear-gradient(135deg, #1b232b 0%, #0f1419 100%); border-radius: 8px;">
        <UiSelect
          v-bind="args"
          :model-value="model"
          @update:modelValue="handleUpdate"
          @change="args.change"
          style="--select-bg: #2a3441; --select-text: #e8eaed; --select-border: #3d4856; --select-hover: #3d4856;"
        />
      </div>
    `,
  }),
};

export default meta;
