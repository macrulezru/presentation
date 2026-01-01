# UI Button Component

Базовый переиспользуемый компонент кнопки. Используется как самостоятельно, так и в составе других компонентов (например, `ui-button-group`).

## Использование

### Базовый пример

```vue
<script setup lang="ts">
  import UiButton from '@/view/ui/ui-button/ui-button.vue';
</script>

<template>
  <UiButton label="Нажми меня" @click="handleClick" />
</template>
```

### С использованием слота

```vue
<template>
  <UiButton @click="handleClick">
    <strong>Жирный</strong>
    текст
  </UiButton>
</template>
```

### Состояния кнопки

```vue
<template>
  <!-- Обычная кнопка -->
  <UiButton label="Обычная" @click="handleClick" />

  <!-- Отключённая кнопка -->
  <UiButton label="Отключена" :disabled="true" />

  <!-- Активная кнопка -->
  <UiButton label="Активная" :active="true" @click="handleClick" />

  <!-- Кнопка в фокусе -->
  <UiButton label="В фокусе" :focused="true" @click="handleClick" />
</template>
```

### Разные размеры

```vue
<template>
  <!-- Маленькая кнопка -->
  <UiButton label="Маленькая" size="sm" @click="handleClick" />

  <!-- Средняя кнопка (по умолчанию) -->
  <UiButton label="Средняя" size="md" @click="handleClick" />

  <!-- Большая кнопка -->
  <UiButton label="Большая" size="lg" @click="handleClick" />
</template>
```

### С подсказкой

```vue
<template>
  <UiButton label="🔍" title="Поиск" @click="handleSearch" />
</template>
```

### Обработка событий

```vue
<script setup lang="ts">
  const handleClick = (event: MouseEvent) => {
    console.log('Clicked!', event);
  };

  const handleFocus = () => {
    console.log('Button focused');
  };

  const handleBlur = () => {
    console.log('Button blurred');
  };

  const handleKeydown = (event: KeyboardEvent) => {
    console.log('Key pressed:', event.key);
  };
</script>

<template>
  <UiButton
    label="Интерактивная кнопка"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
  />
</template>
```

## Props

| Параметр       | Тип                    | По умолчанию | Описание                                                                 |
| -------------- | ---------------------- | ------------ | ------------------------------------------------------------------------ |
| `label`        | `string`               | -            | Текст кнопки (может содержать HTML). Опционально, если используется слот |
| `disabled`     | `boolean`              | `false`      | Отключена ли кнопка                                                      |
| `title`        | `string`               | -            | Tooltip (всплывающая подсказка)                                          |
| `active`       | `boolean`              | `false`      | Активное состояние кнопки                                                |
| `focused`      | `boolean`              | `false`      | Состояние фокуса (управляется извне)                                     |
| `size`         | `'sm' \| 'md' \| 'lg'` | `'md'`       | Размер кнопки: маленький, средний или большой                            |
| `ariaDisabled` | `boolean`              | -            | ARIA disabled атрибут (по умолчанию совпадает с `disabled`)              |

## События

| Событие   | Параметры              | Описание                        |
| --------- | ---------------------- | ------------------------------- |
| `click`   | `event: MouseEvent`    | Вызывается при клике на кнопку  |
| `focus`   | -                      | Вызывается при получении фокуса |
| `blur`    | -                      | Вызывается при потере фокуса    |
| `keydown` | `event: KeyboardEvent` | Вызывается при нажатии клавиши  |

## Слоты

| Слот      | Описание                                                   |
| --------- | ---------------------------------------------------------- |
| `default` | Контент кнопки. Если не используется, отображается `label` |

## Особенности

- ✅ Минимальные базовые стили — большинство стилей наследуются от контекста
- ✅ Поддержка HTML в `label` (через `v-html`)
- ✅ Не отправляет событие `click` если кнопка отключена
- ✅ Автоматически устанавливает `aria-disabled` атрибут
- ✅ Поддержка всех стандартных событий клавиатуры
- ✅ Полная поддержка доступности

## Стилизация

Компонент имеет минимальные базовые стили. Стилизация должна производиться:

- Через родительский контекст (например, в `ui-button-group`)
- Через дополнительные CSS классы
- Через переопределение базовых стилей `.ui-button`

### Базовые стили

```scss
.ui-button {
  // Default size variables
  --ui-button-padding: 0.75rem var(--spacing-lg);
  --ui-button-font-size: var(--font-size-md);

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ui-button-padding);
  background: inherit;
  border: none;
  font-size: var(--ui-button-font-size);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  font-weight: var(--font-weight-medium);
}
```

### Модификаторы состояний

- `.ui-button_disabled` — отключённое состояние
- `.ui-button_active` — активное состояние
- `.ui-button_focused` — состояние фокуса

### Модификаторы размеров

- `.ui-button_size-sm` — маленький размер (padding: 0.5rem, font-size: sm)
- `.ui-button_size-md` — средний размер по умолчанию (padding: 0.75rem, font-size: md)
- `.ui-button_size-lg` — большой размер (padding: 1rem, font-size: lg)

Размеры управляются через CSS переменные `--ui-button-padding` и `--ui-button-font-size`.

- `ui-button-group` — группа объединённых кнопок

При использовании в составе других компонентов стили наследуются от родительского контекста.
