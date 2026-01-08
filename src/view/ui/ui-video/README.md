# UiVideo — адаптивный компонент для вывода видео

Компонент `UiVideo` предназначен для удобного вывода адаптивного видео с поддержкой разных размеров, aspect-ratio, медиазапросов и управления воспроизведением.

## Пропсы

| Название       | Тип            | Описание                                             |
| -------------- | -------------- | ---------------------------------------------------- |
| video          | `UiVideoProps` | Объект с параметрами для всех брейкпоинтов и постера |
| controls       | `boolean`      | Показывать стандартные controls (по умолчанию: true) |
| autoplay       | `boolean`      | Автовоспроизведение (по умолчанию: false)            |
| loop           | `boolean`      | Зацикливание (по умолчанию: false)                   |
| muted          | `boolean`      | Без звука (по умолчанию: false)                      |
| showFullscreen | `boolean`      | Кнопка полноэкранного режима (по умолчанию: true)    |

### UiVideoProps

```ts
interface UiVideoSource {
  src: string; // Ссылка на видео
  width?: string | number; // Ширина (px, %, auto и т.д.)
  height?: string | number; // Высота (px, %, auto и т.д.)
}

interface UiVideoProps {
  src: UiVideoSource; // Desktop-видео (обязательно)
  tablet?: UiVideoSource; // Планшетная версия (опционально)
  mobile?: UiVideoSource; // Мобильная версия (опционально)
  poster?: string; // Постер (опционально)
}
```

## Пример использования

```vue
<template>
  <UiVideo
    :video="{
      src: { src: '/video/desktop.mp4', width: 800, height: 450 },
      tablet: { src: '/video/tablet.mp4', width: 600, height: 338 },
      mobile: { src: '/video/mobile.mp4', width: '100vw', height: 200 },
      poster: '/img/poster.jpg',
    }"
    controls
    autoplay
    loop
    muted
    showFullscreen
  />
</template>
```

## Особенности

- Для каждого брейкпоинта можно задать свою ширину и высоту (px, %, auto и т.д.).
- Для `<video>` применяется только ширина и aspect-ratio (высота не выставляется напрямую).
- aspect-ratio вычисляется автоматически из width и height через функцию getAspectRatioStyle.
- Поддержка постера, управления воспроизведением, полноэкранного режима.
- Если указаны только src, будет использоваться только одно видео.

## События

- `play` — воспроизведение начато
- `pause` — воспроизведение приостановлено
- `ended` — воспроизведение завершено
- `fullscreen` — переход в/из полноэкранного режима

## Стилизация

- Класс `.ui-video__element` применяется к `<video>`. Для кастомизации используйте SCSS-файл `ui-video.scss`.

## Внутренняя логика

- Для вычисления aspect-ratio и ширины используется функция getAspectRatioStyle, чтобы избежать дублирования кода.

## Зависимости

- Vue 3
- SCSS (для стилей)

## Лицензия

MIT
