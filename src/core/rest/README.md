# REST-клиент (src/core/rest)

Подробное описание механизма из [rest.ts](./rest.ts).

## Задачи и особенности

- Универсальный HTTP-клиент на базе axios.
- Единый формат ошибок (`ApiError`) и приведение через `toApiError()` / `isApiError()`.
- Повторные попытки с экспоненциальной задержкой (`RetryConfig`): по умолчанию 0 попыток, 300 мс задержка, множитель 2, ретраи на 429/5xx и сетевые ошибки.
- TTL-кэш ответов для GET (включается в конфиге или per-request; ключ по URL+method+params либо `cacheKey`).
- Ограничение параллелизма (`maxConcurrent`) и «токены за интервал» (`maxRequestsPerInterval` + `intervalMs`). Можно обойти лимиты через `skipRateLimit` в запросе.
- Метрики через callbacks `metrics.onRequestStart/onRequestEnd` (id, method, url, duration, status/error) — используется панель метрик.
- Отменяемые запросы: `cancellableRequest(key, ...)` + `cancelRequest(key)`, хранит `CancelTokenSource` в map.
- Синглтоны клиентов: `getRestClient(config)` кеширует экземпляры по сериализованному ключу конфига.

## Основные сущности

- `HttpConfig` (см. [types.ts](./types.ts)): baseURL, timeout, headers, withCredentials, retry, cache, rateLimit, metrics.
- `RestRequestConfig`: расширение `AxiosRequestConfig` с полями `useCache`, `cacheKey`, `cacheTtlMs`, `requestId`, `skipRateLimit`.
- Ответ: `ApiResponse<T>` = data, status, statusText, headers.
- Ошибка: `ApiError` = message, code?, status?, timestamp?.

## Жизненный цикл `request()`

1. Генерация `reqId` и отметки времени.
2. Проверка GET-кэша (если `useCache` или включён глобально). Возврат из кэша при попадании.
3. `metrics.onRequestStart` (если передано).
4. Выполнение с учётом rate-limit через `schedule()`: очередь + счётчик running + токены.
5. Retry-цикл: при ошибке, если `shouldRetry`, подождать `backoffDelay` и повторить.
6. Сохранение в кэш (GET) при успехе.
7. `metrics.onRequestEnd` с длительностью и статусом/ошибкой.
8. Возврат `ApiResponse<T>` или выброс `ApiError`.

## Публичное API клиента

- `request<T>(command, req?)` — общий метод.
- Шорткаты: `get/post/put/delete` (оборачивают `request` и проставляют method).
- `cancellableRequest(key, command, config?)` — создаёт/меняет `CancelTokenSource`, отменяет предыдущий с тем же ключом, удаляет из map после завершения.
- `cancelRequest(key)` — отмена по ключу.

## Создание

```ts
import { getRestClient } from '@/core/rest';
import { RestApiEnum } from '@/enums/rest-api.enum';
import { jokeConfig } from '@/core/rest/types';

const rest = getRestClient({
  ...jokeConfig,
  metrics: {
    onRequestStart: payload => metricsBus.publishStart(payload),
    onRequestEnd: payload => metricsBus.publishEnd(payload),
  },
});

const response = await rest.get(RestApiEnum.JokeRandom);
```

## Тонкости

- Кэш только для GET по умолчанию; для других методов можно форсировать `useCache` и `cacheKey`.
- Лимит по токенам обновляется через `setInterval`; `intervalMs` не должен быть слишком мал (<50 мс корректируется вверх).
- `retry.attempts` учитывает первую попытку отдельно: цикл идёт `while (attempt <= attempts)`.
- `performance.now` используется, если доступен, иначе `Date.now`.
- `metrics` callbacks вызываются и при успехе, и при ошибке (в том числе последней после всех ретраев).

## Быстрый чек-лист использования

- Создай конфиг в [types.ts](./types.ts) или используй готовые `jokeConfig/personConfig/...`.
- Получи клиент: `getRestClient(config)` — он вернёт singleton.
- Для отмены параллельных запросов по одному ключу используй `cancellableRequest`.
- Для метрик передай `metrics` в конфиг и подключи панель.
- Для кэша GET включи `cache.enabled` и задавай `ttlMs` (или `cacheTtlMs` в запросе).
- Для rate-limit настрой `maxConcurrent` и/или `maxRequestsPerInterval`.
