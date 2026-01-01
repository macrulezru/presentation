# UI Swiper Component - Обновленные возможности

## 📋 Список реализованных улучшений

### ✅ События (Events)

Компонент теперь эмитит следующие события:

```typescript
// Событие при начале перехода на новый слайд
@slide-start="(index: number) => void"

// Событие после завершения перехода
@slide-end="(index: number) => void"

// Событие при начале drag операции
@drag-start="({ startX: number, currentIndex: number }) => void"

// Событие при завершении drag операции
@drag-end="({ endX: number, currentIndex: number, moved: boolean }) => void"

// Событие при swipe жесте
@swipe="({ direction: 'left' | 'right', index: number }) => void"
```

**Пример использования:**

```vue
<UiSwiper
  :slides="images"
  @slide-start="onSlideStart"
  @slide-end="onSlideEnd"
  @drag-start="onDragStart"
  @drag-end="onDragEnd"
  @swipe="onSwipe"
  @slide-click="onImageClick"
/>

<script setup>
  const onSlideStart = index => console.log(`Starting transition to slide ${index}`);
  const onSlideEnd = index => console.log(`Finished transition to slide ${index}`);
  const onDragStart = ({ startX, currentIndex }) =>
    console.log(`Drag started from ${startX}`);
  const onDragEnd = ({ endX, currentIndex, moved }) =>
    console.log(`Drag ended, moved: ${moved}`);
  const onSwipe = ({ direction, index }) => console.log(`Swiped ${direction}`);
</script>
```

### ⚙️ Конфигурационные свойства (Props)

```typescript
interface Props {
  slides: Slide[]; // Массив слайдов (обязательно)
  lazyLoad?: boolean; // Ленивая загрузка (по умолчанию true)

  // Анимация и переходы
  animationDuration?: number; // Длительность анимации в ms (по умолчанию 300)

  // Автоматическое проигрывание
  autoplay?: boolean; // Включить автоплей (по умолчанию false)
  autoplayDelay?: number; // Задержка между слайдами в ms (по умолчанию 3000)

  // Навигация
  loop?: boolean; // Циклическое переключение (по умолчанию true)
  initialIndex?: number; // Начальный индекс слайда (по умолчанию 0)

  // Drag и взаимодействие
  dragThreshold?: number; // Минимальное смещение для начала drag в px (по умолчанию 5)
  dragVelocityThreshold?: number; // Процент ширины для переходов при драге (по умолчанию 0.25)
}
```

**Примеры использования:**

```vue
<!-- Базовое использование с autoplay -->
<UiSwiper
  :slides="images"
  :autoplay="true"
  :autoplay-delay="5000"
  :animation-duration="400"
/>

<!-- Без циклического переключения -->
<UiSwiper :slides="images" :loop="false" :initial-index="0" />

<!-- С настройками drag -->
<UiSwiper :slides="images" :drag-threshold="10" :drag-velocity-threshold="0.3" />
```

### 🎨 Улучшения стилей и UX

#### Плавные переходы

- Динамическая длительность переходов через CSS переменную `--swiper-duration`
- Плавное изменение высоты контейнера при переходе между слайдами разной высоты

#### Visual Feedback

- **Drag**: Курсор меняется на `grabbing` при перетаскивании
- **Изображения**:
  - Hover эффект с масштабированием (1.02x) и drop-shadow
  - Active состояние с уменьшением (0.98x)
  - Focus состояние с outline для accessibility
- **Кнопки навигации**:
  - Hover эффекты с масштабированием и тенями
  - Disabled состояние при единственном слайде
  - Плавные transitions при взаимодействии

- **Пагинация (точки)**:
  - Hover эффекты с масштабированием и glow эффектом
  - Active состояние с glow тенью
  - Focus состояние для accessibility

### 🔄 Управление Autoplay

Autoplay автоматически:

- **Запускается** при монтировании компонента
- **Останавливается** при:
  - Начале drag операции
  - Начале touch жеста
  - Ручной навигации (клики, клавиатура)
- **Возобновляется** после завершения взаимодействия пользователя

**Примечание**: Autoplay будет отключен, если слайдов меньше или равно 1.

### 🎯 Интеграция всех функций

```vue
<template>
  <div class="gallery">
    <h2>Галерея с полным функционалом</h2>
    <UiSwiper
      :slides="galleryImages"
      :autoplay="isAutoplayEnabled"
      :autoplay-delay="4000"
      :animation-duration="350"
      :loop="allowLoop"
      :initial-index="startIndex"
      :drag-threshold="8"
      :drag-velocity-threshold="0.3"
      :lazy-load="true"
      @slide-start="handleSlideStart"
      @slide-end="handleSlideEnd"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
      @swipe="handleSwipe"
      @slide-click="openImageViewer"
    />

    <div class="info">
      <p>Текущий слайд: {{ currentSlide + 1 }} / {{ galleryImages.length }}</p>
      <p>Статус: {{ status }}</p>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import UiSwiper from '@/view/ui/ui-swiper/ui-swiper.vue';

  const galleryImages = [
    { preview: '/images/1.jpg', description: 'Первое изображение' },
    { preview: '/images/2.jpg', description: 'Второе изображение' },
    // ...
  ];

  const currentSlide = ref(0);
  const status = ref('');
  const isAutoplayEnabled = ref(true);
  const startIndex = ref(0);
  const allowLoop = ref(true);

  const handleSlideStart = index => {
    currentSlide.value = index;
    status.value = 'Переход в процессе...';
  };

  const handleSlideEnd = index => {
    status.value = 'Переход завершен';
  };

  const handleDragStart = ({ startX, currentIndex }) => {
    status.value = 'Перетаскивание...';
  };

  const handleDragEnd = ({ endX, currentIndex, moved }) => {
    status.value = moved ? 'Слайд изменен' : 'Перетаскивание отменено';
  };

  const handleSwipe = ({ direction, index }) => {
    status.value = `Свайп ${direction}`;
  };

  const openImageViewer = index => {
    console.log(`Открыть полноэкранный просмотр слайда ${index}`);
  };
</script>

<style scoped>
  .gallery {
    max-width: 800px;
    margin: 0 auto;
  }

  .info {
    margin-top: 20px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: center;
  }
</style>
```

## 📊 Полнота реализации

| Категория               | Статус       | Задачи                          |
| ----------------------- | ------------ | ------------------------------- |
| **Events**              | ✅ Завершено | Все 5 событий реализованы       |
| **Configuration Props** | ✅ Завершено | Все 7 props реализованы         |
| **Styling & UX**        | ✅ Завершено | Все 6 улучшений реализованы     |
| **Keyboard Navigation** | ✅ Готово    | ArrowLeft, ArrowRight           |
| **Touch/Swipe**         | ✅ Готово    | Мобильная поддержка             |
| **Drag**                | ✅ Готово    | Перетаскивание мышкой           |
| **Accessibility**       | ✅ Готово    | ARIA атрибуты, focus management |
| **Lazy Loading**        | ✅ Готово    | Настраиваемая загрузка          |

## 🚀 Следующие этапы (опционально)

Из оригинального TODO списка, возможные будущие улучшения:

- Keyboard поддержка (Home, End, Page Up/Down)
- Thumbnail preview панель
- Parallax эффекты
- Virtual scrolling для больших количеств слайдов
- Unit тесты
- Storybook stories
