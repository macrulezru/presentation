# UiLoading

Универсальный компонент индикатора загрузки с поддержкой двух типов визуализации: линейный бар и круговой прогресс.

## Возможности

- **Два типа отображения**: линейный бар (`bar`) и круговой прогресс (`circle`)
- **Детерминированный и индетерминированный режимы**:
  - Детерминированный — отображает конкретный процент выполнения
  - Индетерминированный — показывает анимированный индикатор без конкретного значения
- **Гибкая настройка внешнего вида**: цвета, толщина, размеры, отступы
- **Анимации**: плавные переходы для детерминированного режима, циклические анимации для индетерминированного

## Props

### Общие параметры

| Prop              | Type                  | Default     | Description                                                                  |
| ----------------- | --------------------- | ----------- | ---------------------------------------------------------------------------- |
| `type`            | `'bar' \| 'circle'`   | `'bar'`     | Тип индикатора загрузки                                                      |
| `progress`        | `number \| undefined` | `undefined` | Значение прогресса от 0 до 100. Если `undefined` — индетерминированный режим |
| `thickness`       | `number`              | `6`         | Толщина линии прогресса (в пикселях)                                         |
| `strokeColor`     | `string`              | `'#e0e0e0'` | Цвет фона/обводки для обоих типов (фон круга и фон бара)                     |
| `progressColor`   | `string`              | `'#048eed'` | Цвет прогресса для обоих типов (сегмент круга и заливка бара)                |
| `percentageColor` | `string`              | `'#048eed'` | Цвет текста процентов (отображается только в детерминированном режиме)       |

### Параметры круга

| Prop           | Type     | Default | Description             |
| -------------- | -------- | ------- | ----------------------- |
| `circleRadius` | `number` | `45`    | Радиус круга в пикселях |

### Параметры бара

| Prop             | Type     | Default     | Description                                                  |
| ---------------- | -------- | ----------- | ------------------------------------------------------------ |
| `barStrokeColor` | `string` | `undefined` | Цвет рамки бара (если не указан, используется `strokeColor`) |
| `barStrokeWidth` | `number` | `1`         | Толщина рамки бара в пикселях                                |
| `barInset`       | `number` | `1`         | Внутренний отступ содержимого бара от рамки в пикселях       |

## Примеры использования

### Базовое использование

```vue
<template>
  <!-- Линейный бар с детерминированным прогрессом -->
  <UiLoading type="bar" :progress="60" />

  <!-- Круговой индикатор с детерминированным прогрессом -->
  <UiLoading type="circle" :progress="75" />

  <!-- Индетерминированный линейный индикатор -->
  <UiLoading type="bar" />

  <!-- Индетерминированный круговой индикатор -->
  <UiLoading type="circle" />
</template>

<script setup lang="ts">
  import UiLoading from '@/view/ui/ui-loading/ui-loading.vue';
</script>
```

### Настройка цветов

```vue
<template>
  <!-- Линейный бар с кастомными цветами -->
  <UiLoading
    type="bar"
    :progress="50"
    stroke-color="#f0f0f0"
    progress-color="#00c853"
    percentage-color="#00c853"
  />

  <!-- Круговой индикатор с кастомными цветами -->
  <UiLoading
    type="circle"
    :progress="80"
    stroke-color="#e3f2fd"
    progress-color="#2196f3"
    percentage-color="#1976d2"
  />
</template>
```

### Настройка размеров

```vue
<template>
  <!-- Толстый бар -->
  <UiLoading type="bar" :progress="40" :thickness="12" />

  <!-- Большой круг -->
  <UiLoading type="circle" :progress="65" :circle-radius="80" :thickness="10" />

  <!-- Тонкий бар с рамкой -->
  <UiLoading
    type="bar"
    :progress="30"
    :thickness="4"
    :bar-stroke-width="2"
    :bar-inset="2"
    bar-stroke-color="#cccccc"
  />
</template>
```

### Динамическое обновление прогресса

```vue
<template>
  <div>
    <UiLoading type="bar" :progress="loadingProgress" />
    <button @click="startLoading">Start Loading</button>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import UiLoading from '@/view/ui/ui-loading/ui-loading.vue';

  const loadingProgress = ref(0);

  const startLoading = () => {
    loadingProgress.value = 0;
    const interval = setInterval(() => {
      loadingProgress.value += 10;
      if (loadingProgress.value >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };
</script>
```

### Переключение между детерминированным и индетерминированным режимами

```vue
<template>
  <div>
    <UiLoading type="circle" :progress="isLoading ? undefined : 100" />
    <p v-if="isLoading">Загрузка...</p>
    <p v-else>Готово!</p>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import UiLoading from '@/view/ui/ui-loading/ui-loading.vue';

  const isLoading = ref(true);

  onMounted(() => {
    setTimeout(() => {
      isLoading.value = false;
    }, 3000);
  });
</script>
```

## Режимы работы

### Детерминированный режим

Активируется при передаче числового значения в `progress` (от 0 до 100).

- Отображает конкретный процент выполнения
- Показывает текст с процентами
- Прогресс обновляется с плавной анимацией

### Индетерминированный режим

Активируется при `progress={undefined}` или отсутствии пропа `progress`.

- Отображает циклическую анимацию
- Не показывает процент выполнения
- Подходит для операций с неизвестной продолжительностью

## Стилизация

Компонент использует CSS-классы с BEM-методологией:

- `.ui-loading` — корневой элемент
- `.ui-loading_bar` — модификатор для типа "бар"
- `.ui-loading_circle` — модификатор для типа "круг"
- `.ui-loading_indeterminate` — модификатор для индетерминированного режима
- `.ui-loading__bar-container` — контейнер бара
- `.ui-loading__bar-fill` — заполнение бара
- `.ui-loading__circle-svg` — SVG контейнер круга
- `.ui-loading__circle-segment` — сегмент прогресса круга
- `.ui-loading__percentage` / `.ui-loading__circle-percentage` — текст процентов

## Playground

Для интерактивной настройки компонента используйте `UiLoadingSetting`:

```vue
<template>
  <UiLoadingSetting />
</template>

<script setup lang="ts">
  import UiLoadingSetting from '@/view/ui/ui-loading/ui-loading-setting.vue';
</script>
```

Компонент предоставляет UI для настройки всех доступных параметров в реальном времени.
