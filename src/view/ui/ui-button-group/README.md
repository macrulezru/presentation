# UI Button Group Component

Переиспользуемый компонент объединенной группы кнопок, где кнопки визуально объединены в общий блок с разделительными линиями между ними.

Внутри использует компонент [`ui-button`](../ui-button/README.md) для рендеринга отдельных кнопок.

## Использование

### Базовый пример (режим row)

```vue
<script setup lang="ts">
  import UiButtonGroup from '@/view/ui/ui-button-group/ui-button-group.vue';
  import type { ButtonConfig } from '@/view/ui/ui-button-group/types';

  const buttons: ButtonConfig[] = [
    {
      id: 'btn-1',
      label: 'Кнопка 1',
      action: () => console.log('Clicked 1'),
    },
    {
      id: 'btn-2',
      label: 'Кнопка 2',
      action: () => console.log('Clicked 2'),
    },
    {
      id: 'btn-3',
      label: 'Кнопка 3',
      action: () => console.log('Clicked 3'),
    },
  ];
</script>

<template>
  <UiButtonGroup :buttons="buttons" mode="row" />
</template>
```

### Вертикальный режим (column)

```vue
<UiButtonGroup :buttons="buttons" mode="column" />
```

### С отключенными кнопками

```typescript
const buttons: ButtonConfig[] = [
  {
    id: 'btn-1',
    label: 'Активная',
    action: () => console.log('Clicked 1'),
  },
  {
    id: 'btn-2',
    label: 'Отключена',
    action: () => console.log('Clicked 2'),
    disabled: true,
  },
];
```

### С подсказками

```typescript
const buttons: ButtonConfig[] = [
  {
    id: 'btn-1',
    label: '🔍',
    action: () => console.log('Search'),
    title: 'Поиск',
  },
  {
    id: 'btn-2',
    label: '⚙️',
    action: () => console.log('Settings'),
    title: 'Параметры',
  },
];
```

### С кастомными CSS классами

```typescript
const buttons: ButtonConfig[] = [
  {
    id: 'btn-1',
    label: 'Важная кнопка',
    action: () => console.log('Clicked'),
    class: 'custom-highlight',
  },
];
```

### С HTML в label

```typescript
const buttons: ButtonConfig[] = [
  {
    id: 'btn-1',
    label: '<strong>Bold</strong> Text',
    action: () => console.log('Clicked'),
  },
];
```

### С активным состоянием

```typescript
const buttons: ButtonConfig[] = [
  {
    id: 'btn-1',
    label: 'Обычная',
    action: () => console.log('Clicked 1'),
  },
  {
    id: 'btn-2',
    label: 'Активная',
    action: () => console.log('Clicked 2'),
    active: true,
  },
  {
    id: 'btn-3',
    label: 'Обычная',
    action: () => console.log('Clicked 3'),
  },
];
```

### С выбором темы

```vue
<!-- Light theme (default) -->
<UiButtonGroup :buttons="buttons" theme="light" />

<!-- Dark theme -->
<UiButtonGroup :buttons="buttons" theme="dark" />

<!-- Custom theme -->
<UiButtonGroup :buttons="buttons" theme="my-custom-theme" />
```

### С разными размерами

```vue
<!-- Small size -->
<UiButtonGroup :buttons="buttons" size="sm" />

<!-- Medium size (default) -->
<UiButtonGroup :buttons="buttons" size="md" />

<!-- Large size -->
<UiButtonGroup :buttons="buttons" size="lg" />
```

## Props

| Параметр    | Тип                    | По умолчанию | Описание                                                  |
| ----------- | ---------------------- | ------------ | --------------------------------------------------------- |
| `buttons`   | `ButtonConfig[]`       | -            | Массив конфигураций кнопок (обязательный)                 |
| `mode`      | `'row' \| 'column'`    | `'row'`      | Режим отображения                                         |
| `border`    | `boolean`              | `true`       | Отображать внешнюю рамку                                  |
| `radius`    | `number`               | `4`          | Радиус скругления углов (px)                              |
| `theme`     | `string`               | `'light'`    | Идентификатор цветовой темы (встроенные: 'light', 'dark') |
| `size`      | `'sm' \| 'md' \| 'lg'` | `'md'`       | Размер кнопок: маленький, средний или большой             |
| `ariaLabel` | `string`               | -            | Доступный текст для группы кнопок                         |

## ButtonConfig Interface

```typescript
interface ButtonConfig {
  id: string; // Уникальный идентификатор
  label: string; // Текст кнопки (может содержать HTML)
  action: () => void; // Функция при клике
  disabled?: boolean; // Отключена ли кнопка
  class?: string; // Дополнительные CSS классы
  mode?: 'row' | 'column'; // Локальное переопределение режима
  title?: string; // Tooltip
  divider?: boolean; // Показывать разделитель
  active?: boolean; // Активное состояние кнопки
}
```

## Архитектура

Компонент использует композицию с [`ui-button`](../ui-button/README.md):

- Каждая кнопка в группе — это экземпляр компонента `ui-button`
- Размер кнопок (`size`) передаётся напрямую в каждый `ui-button` из пропса группы
- Стили группы переопределяют базовые стили кнопок через CSS переменные и селекторы
- Состояния кнопок (active, focused, disabled) управляются через пропсы `ui-button`
- Разделители между кнопками добавляются через слоты

## Доступность

- ✅ Навигация с клавиатуры (Tab, Enter, Space, стрелки)
- ✅ ARIA-атрибуты: `role="group"`, `aria-label`, `aria-disabled`
- ✅ Визуальный фокус с синей обводкой
- ✅ Поддержка `prefers-reduced-motion`

## Производительность

- ✅ Поддерживает до 50 кнопок без задержек
- ✅ Использует `v-for` с key для оптимизации рендеринга
- ✅ Отсутствие утечек памяти при динамическом обновлении

## Стилизация

Компонент использует CSS переменные для каждой темы. Встроенные темы используют селекторы класса `.ui-button-group_theme-{name}`.

### Встроенные темы

#### Light theme (по умолчанию)

```scss
.ui-button-group_theme-light {
  --btn-group-bg: #fff;
  --btn-group-text: #333;
  --btn-group-text-hover: #06c;
  --btn-group-bg-hover: #f0f0f0;
  --btn-group-bg-active: #e6e6e6;
  --btn-group-border: #ccc;
  --btn-group-divider: #ccc;
  --btn-group-focus: #06c;
  --btn-group-disabled: #999;
  --btn-group-active-bg: #d0d0d0;
  --btn-group-active-text: #06c;
}
```

#### Dark theme

```scss
.ui-button-group_theme-dark {
  --btn-group-bg: #1a1a1a;
  --btn-group-text: #e0e0e0;
  --btn-group-text-hover: #64b5f6;
  --btn-group-bg-hover: #2d2d2d;
  --btn-group-bg-active: #3d3d3d;
  --btn-group-border: #404040;
  --btn-group-divider: #505050;
  --btn-group-focus: #64b5f6;
  --btn-group-disabled: #666;
  --btn-group-active-bg: #4a4a4a;
  --btn-group-active-text: #64b5f6;
}
```

### Создание кастомной темы

Для создания кастомной темы определите CSS переменные для вашего идентификатора:

```scss
// В ваших глобальных стилях или в компоненте
.ui-button-group_theme-my-theme {
  --btn-group-bg: #f5f5f5;
  --btn-group-text: #222;
  --btn-group-text-hover: #ff6b6b;
  --btn-group-bg-hover: #efefef;
  --btn-group-bg-active: #e8e8e8;
  --btn-group-border: #d0d0d0;
  --btn-group-divider: #d0d0d0;
  --btn-group-focus: #ff6b6b;
  --btn-group-disabled: #aaa;
  --btn-group-active-bg: #e0e0e0;
  --btn-group-active-text: #ff6b6b;
}
```

Затем используйте её в компоненте:

```vue
<UiButtonGroup :buttons="buttons" theme="my-theme" />
```

### Управление размерами

Размеры кнопок управляются через пропс `size`, который передаётся во все дочерние компоненты `ui-button`:

```vue
<!-- Маленькие кнопки -->
<UiButtonGroup :buttons="buttons" size="sm" />

<!-- Средние кнопки (по умолчанию) -->
<UiButtonGroup :buttons="buttons" size="md" />

<!-- Большие кнопки -->
<UiButtonGroup :buttons="buttons" size="lg" />
```

Размеры определяются в компоненте [`ui-button`](../ui-button/README.md) через CSS переменные `--ui-button-padding` и `--ui-button-font-size`.

## Связанные компоненты

- [`ui-button`](../ui-button/README.md) — базовый компонент кнопки, используемый внутри группы
