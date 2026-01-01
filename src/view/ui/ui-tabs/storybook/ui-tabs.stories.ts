import UiTab from '../parts/ui-tab/ui-tab.vue';
import UiTabs from '../ui-tabs.vue';

import type { Meta, StoryObj } from '@storybook/vue3';

interface TabData {
  title: string;
  content: string;
  id?: string;
}

const meta: Meta<typeof UiTabs> = {
  title: 'UI/Tabs',
  component: UiTabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Контейнер вкладок с клавиатурной навигацией (Arrow/Home/End). Добавляйте панели через вложенный компонент UiTab.',
      },
    },
  },
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

const tabsData: TabData[] = [
  {
    title: 'Общее',
    content: `Добро пожаловать в раздел с общей информацией о продукте.

Наш продукт создан с использованием современных технологий и следует лучшим практикам разработки. Мы уделяем особое внимание производительности, доступности и пользовательскому опыту.

**Основные преимущества:**
- Высокая производительность и оптимизация
- Адаптивный дизайн для всех устройств
- Доступность (WCAG 2.1 AA)
- Современный стек технологий

Мы постоянно работаем над улучшением продукта и внедрением новых функций на основе обратной связи от пользователей.`,
  },
  {
    title: 'Характеристики',
    content: `**Технические характеристики:**

Frontend:
- Vue 3 (Composition API)
- TypeScript
- Vite
- Pinia для state management
- Vue Router для навигации

UI компоненты:
- Собственная библиотека UI-компонентов
- Поддержка темной/светлой темы
- Адаптивная сетка и layouts
- Анимации и transitions

Производительность:
- Lazy loading компонентов и изображений
- Code splitting
- Tree shaking
- Оптимизация bundle size

Доступность:
- Клавиатурная навигация
- ARIA атрибуты
- Screen reader поддержка
- Контрастность и читаемость`,
  },
  {
    title: 'API',
    content: `**REST API интеграция:**

Наш продукт интегрирован с несколькими внешними API для демонстрации работы с асинхронными запросами и обработкой данных.

Endpoints:
- GET /api/product - получение случайного продукта
- GET /api/person - получение данных о случайном человеке
- GET /api/joke - получение случайной шутки

Особенности:
- Обработка ошибок и retry логика
- Кэширование запросов
- Optimistic updates
- Loading states
- Error boundaries

Метрики:
- Отслеживание времени выполнения запросов
- Мониторинг успешных/неуспешных запросов
- Визуализация в реальном времени`,
  },
  {
    title: 'Отзывы',
    content: `**Отзывы пользователей:**

⭐⭐⭐⭐⭐ "Отличный продукт! Очень удобный интерфейс и быстрая работа. Особенно понравилась адаптация под мобильные устройства."
— Анна К., frontend разработчик

⭐⭐⭐⭐⭐ "Впечатляющая реализация! Код чистый, документация подробная. Легко разобраться и начать использовать."
— Дмитрий М., tech lead

⭐⭐⭐⭐ "Хорошее решение для быстрого старта проекта. Есть все необходимые компоненты. Было бы здорово добавить больше примеров использования."
— Елена С., UI/UX designer

⭐⭐⭐⭐⭐ "Отличная типизация на TypeScript, продуманная архитектура. Рекомендую для изучения лучших практик Vue 3."
— Александр В., senior developer`,
  },
];

export const Default: Story = {
  render: () => ({
    components: { UiTabs, UiTab },
    setup() {
      return { tabsData };
    },
    template: `
      <div style="max-width: 920px; padding: 2rem; background: linear-gradient(135deg, #1b232b 0%, #0f1419 100%); border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
        <UiTabs>
          <UiTab
            v-for="tab in tabsData"
            :key="tab.id || tab.title"
            :title="tab.title"
            :id="tab.id"
          >
            <div style="padding: 1.5rem; color: #e8eaed; line-height: 1.7; white-space: pre-wrap; font-size: 14px;">{{ tab.content }}</div>
          </UiTab>
        </UiTabs>
      </div>
    `,
  }),
};

export const Simple: Story = {
  render: () => ({
    components: { UiTabs, UiTab },
    template: `
      <UiTabs>
        <UiTab title="Tab 1" id="tab1">
          <div>Content for Tab 1</div>
        </UiTab>
        <UiTab title="Tab 2" id="tab2">
          <div>Content for Tab 2</div>
        </UiTab>
        <UiTab title="Tab 3" id="tab3">
          <div>Content for Tab 3</div>
        </UiTab>
      </UiTabs>
    `,
  }),
};
