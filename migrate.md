# План миграции на Nuxt 3 + SSR

Цель: перевести текущий Vite + Vue 3 проект на **Nuxt 3 (SSR)**, сохранив UI/поведение и добавив серверный слой для получения данных из API.

## Текущее состояние (кратко)

- **Vite SPA**: точка входа `src/main.ts`, HTML-шаблон `index.html`.
- **Роутинг**: `vue-router` с маршрутами:
  - `/:locale?`
  Всё рендерится через `src/view/pages/index.vue` (скролл-секции), **без отражения секций в URL**.
- **i18n**: кастомный слой на `vue-i18n` + ленивая загрузка JSON локалей (`src/locales/*`), сейчас завязан на `localStorage` и `window`.
- **Динамические данные (3 зоны)**:
  - `src/view/components/experience-timeline/*` → API `GET https://macrulez-api.ru/api/portfolio/company?lang=...`
  - `src/view/components/arts/*` → API `GET https://macrulez-api.ru/api/portfolio/arts`
  - `src/view/components/stuff/parts/npm-packages/*` → API `GET https://macrulez-api.ru/api/portfolio/npm?lang=...`
  Сейчас запросы выполняются на клиенте через `rest-pipeline-js`.

## Основные риски SSR (что нужно “разрулить”)

- **Код с `window/document/localStorage`** в `setup()`/композаблах должен выполняться только на клиенте (`process.client`) или быть перенесён в `onMounted`.
- **Responsive/media плагины** и логика скролл-роутинга (DOM) — нужно аккуратно изолировать от SSR.
- **SEO/meta** сейчас завязаны на Vite-плейсхолдеры в `index.html` (`%VITE_*%`) — в Nuxt это нужно перевести на `useHead()`/runtime config.
- **Аналитика (Yandex.Metrika)**: перенести в Nuxt plugin `client`-only.

## Стратегия миграции (инкрементально, без “большого взрыва”)

### Этап 0 — Подготовка (сделано/начато)
- Удалён Storybook (не относится к Nuxt, но чистит проект).

### Этап 1 — Nuxt каркас рядом с текущим приложением (первый рабочий результат)
Цель: поднять Nuxt SSR в папке `nuxt/`, не ломая текущий `npm run dev/build`.

- Добавить зависимости Nuxt и скрипты:
  - `npm run nuxt:dev`
  - `npm run nuxt:build`
  - `npm run nuxt:preview`
- Добавить минимальные файлы Nuxt:
  - `nuxt/nuxt.config.ts`
  - `nuxt/app.vue`
  - `nuxt/pages/ssr-smoke.vue` (проверка SSR + server fetch)

### Этап 2 — Server API proxy (то, что вы называете “middleware”)
Цель: на Node-хосте тянуть данные **с сервера Nuxt**, а фронту отдавать через `/api/...`.

- Реализовать Nitro routes:
  - `/api/portfolio/company?lang=ru`
  - `/api/portfolio/npm?lang=ru`
  - `/api/portfolio/arts`
- Добавить **кэширование** на стороне сервера (TTL) и нормализацию ответов под текущие типы.
- Перенести в Nuxt-слой композаблы, которые ходят уже в `/api/...` (не трогая текущие Vite-композаблы на первом шаге).

### Этап 3 — Перенос роутинга и оболочки страницы
Цель: в Nuxt остаётся только URL-локаль, без секций/featureId в пути.

- Завести страницу:
  - `pages/[[locale]].vue` (или `pages/[[locale]]/index.vue`)
- Добавить route middleware:
  - валидация `locale`
  - установка локали (cookie вместо localStorage на SSR)

### Этап 4 — i18n SSR-ready
Цель: локаль определяется на сервере, на клиенте — синхронизируется.

- Источник локали (приоритет):
  1) `route.params.locale`
  2) cookie `user-locale`
  3) `Accept-Language`
  4) RU по умолчанию
- Убрать прямые чтения `localStorage` из кода, выполняющегося до `mounted`.

### Этап 5 — Перенос 3 динамических разделов на SSR fetching
Цель: данные для experience / arts / npm-packages грузятся на сервере при SSR, а на клиенте гидратируются.

- Компоненты должны использовать Nuxt-данные:
  - `useAsyncData` / `useFetch` (внутри Nuxt-обёрток)
  - запросы только к `/api/...`

### Этап 6 — Перенос остального UI/секций
Цель: остальной контент (в основном статичный) переносится в Nuxt без регрессий.

### Этап 7 — SEO, head, аналитика, деплой
- `useHead()` вместо `%VITE_*%`
- Yandex.Metrika — plugin `*.client.ts`
- Деплой на Node: `nuxt build` → `node .output/server/index.mjs`

## “Definition of Done” для миграции
- Nuxt SSR отдаёт HTML (не пустой shell) для основных страниц.
- 3 динамических раздела грузятся сервером через `/api/...`, без прямых запросов к `macrulez-api.ru` из браузера.
- Локаль корректно работает на SSR (cookie/route), без ошибок `window is not defined`.
- Сборка/preview стабильны (`nuxt build` + `nuxt preview`).

