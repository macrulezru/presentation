import UiSwiper from '../ui-swiper.vue';

import type { Meta, StoryObj } from '@storybook/vue3';

type Slide = { preview: string; description: string };

const slides: Slide[] = [
  {
    preview:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    description: 'Горы на рассвете',
  },
  {
    preview:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    description: 'Океан и песчаный берег',
  },
  {
    preview:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    description: 'Лес в тумане',
  },
  {
    preview:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    description: 'Ночной город',
  },
];

const meta: Meta<typeof UiSwiper> = {
  title: 'UI/Swiper',
  component: UiSwiper,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Карусель слайдов с drag/touch навигацией, автоплеем и lazy loading. Эмитит события начала/конца перехода, свайпов и кликов.',
      },
    },
  },
  argTypes: {
    slides: { description: 'Массив слайдов { preview, description }', control: 'object' },
    lazyLoad: { description: 'Ленивая загрузка изображений', control: 'boolean' },
    animationDuration: {
      description: 'Длительность анимации перехода (мс)',
      control: { type: 'number', min: 100, max: 2000, step: 50 },
    },
    autoplay: { description: 'Автоматическое переключение слайдов', control: 'boolean' },
    autoplayDelay: {
      description: 'Интервал автоплея (мс)',
      control: { type: 'number', min: 1000, max: 10000, step: 250 },
    },
    loop: { description: 'Циклическая прокрутка', control: 'boolean' },
    initialIndex: {
      description: 'Начальный индекс слайда',
      control: { type: 'number', min: 0 },
    },
    dragThreshold: {
      description: 'Порог пикселей для старта drag',
      control: { type: 'number', min: 0, max: 100 },
    },
    dragVelocityThreshold: {
      description: 'Процент ширины для перехода при drag (0–1)',
      control: { type: 'number', min: 0, max: 1, step: 0.05 },
    },
  },
  args: {
    slides,
    lazyLoad: true,
    animationDuration: 320,
    autoplay: false,
    autoplayDelay: 3200,
    loop: true,
    initialIndex: 0,
    dragThreshold: 5,
    dragVelocityThreshold: 0.25,
  },
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => ({
    components: { UiSwiper },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width: 960px; margin: 0 auto; padding: 32px;">
        <UiSwiper v-bind="args" />
      </div>
    `,
  }),
};

export const Autoplay: Story = {
  args: { autoplay: true, autoplayDelay: 2500 },
};

export default meta;
