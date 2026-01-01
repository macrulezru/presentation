import { ref, watch } from 'vue';

import UiImageModal from '../ui-image-modal.vue';

import type { Props } from '../types';
import type { Meta, StoryObj } from '@storybook/vue3';

const demoImages: Props['images'] = [
  {
    preview: 'https://picsum.photos/id/1015/420/260',
    full: 'https://picsum.photos/id/1015/1200/800',
    description: 'Горный пейзаж',
  },
  {
    preview: 'https://picsum.photos/id/1035/420/260',
    full: 'https://picsum.photos/id/1035/1200/800',
    description: 'Закат над озером',
  },
  {
    preview: 'https://picsum.photos/id/1041/420/260',
    full: 'https://picsum.photos/id/1041/1200/800',
    description: 'Город ночью',
  },
];

const meta: Meta<typeof UiImageModal> = {
  title: 'UI/ImageModal',
  component: UiImageModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Полноэкранная галерея с клавиатурной и мышиной навигацией, ленивая загрузка превью и опцией открыть изображение в новой вкладке.',
      },
    },
  },
  argTypes: {
    isOpen: { description: 'Состояние открытия модалки', control: 'boolean' },
    images: {
      description: 'Массив изображений { preview, full, description }',
      control: 'object',
    },
    initialIndex: {
      description: 'Стартовый индекс изображения',
      control: { type: 'number', min: 0 },
    },
    showNavigation: { description: 'Показывать стрелки навигации', control: 'boolean' },
    showCounter: { description: 'Отображать счетчик изображений', control: 'boolean' },
    showThumbnails: { description: 'Показывать ленту превью', control: 'boolean' },
    lazyThumbnails: { description: 'Ленивая загрузка превьюшек', control: 'boolean' },
    allowOpenInNewTab: {
      description: 'Разрешить открытие текущего изображения в новой вкладке',
      control: 'boolean',
    },
  },
  args: {
    isOpen: true,
    images: demoImages,
    initialIndex: 0,
    showNavigation: true,
    showCounter: true,
    showThumbnails: true,
    lazyThumbnails: true,
    allowOpenInNewTab: true,
  },
};

type Story = StoryObj<Props>;

export const Default: Story = {
  render: args => ({
    components: { UiImageModal },
    setup() {
      const state = ref(args.isOpen);

      watch(
        () => args.isOpen,
        value => {
          state.value = value;
        },
      );

      const handleUpdate = (value: boolean) => {
        state.value = value;
      };

      return { args, state, handleUpdate };
    },
    template: `
      <div style="height: 100vh; background: #0f1115;">
        <UiImageModal
          v-bind="args"
          :is-open="state"
          @update:isOpen="handleUpdate"
        />
      </div>
    `,
  }),
};

export default meta;
