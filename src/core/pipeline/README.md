# Конвейерная система REST API (Pipeline)

Модуль для организации последовательных HTTP-запросов к REST API с передачей данных между этапами, отслеживанием прогресса, интеллектуальной обработкой ошибок, пользовательскими паузами и полной типобезопасностью.

## Схема работы конвейера

```
┌────────────┐   ┌────────────┐   ┌────────────┐
│  Шаг 1     │──▶│  Шаг 2     │──▶│  Шаг 3     │
│ (request)  │   │ (request)  │   │ (request)  │
└─────┬──────┘   └─────┬──────┘   └─────┬──────┘
      │                │                │
      ▼                ▼                ▼
  [Пауза?]         [Пауза?]         [Пауза?]
      │                │                │
      ▼                ▼                ▼
[Подтверждение/изменение результата пользователем]
      │                │                │
      ▼                ▼                ▼
 ──────────────────────────────────────────▶
      (Данные и ошибки накапливаются в results/errors)
```

Каждый шаг может быть пропущен по условию, завершиться ошибкой, либо быть изменён пользователем перед переходом к следующему шагу.

---

## Ключевые возможности и примеры

### 1. Последовательное выполнение шагов

```ts
const pipelineConfig = {
  stages: [
    {
      key: '/step1',
      request: async () => {
        /*...*/
      },
    },
    {
      key: '/step2',
      request: async () => {
        /*...*/
      },
    },
    {
      key: '/step3',
      request: async () => {
        /*...*/
      },
    },
  ],
};
const orchestrator = new PipelineOrchestrator(pipelineConfig, httpConfig);
orchestrator.run();
```

### 2. Автоматическая передача данных между этапами

```ts
const pipelineConfig = {
  stages: [
    { key: '/user', request: async () => getUser() },
    { key: '/orders', request: async user => getOrders(user.id) },
    { key: '/summary', request: async orders => summarize(orders) },
  ],
};
```

### 3. Детальное отслеживание прогресса

```ts
const progress = orchestrator.progress.getProgress();
console.log(progress.currentStage, progress.stageStatuses);
```

### 4. Retry-логика и обработка ошибок

```ts
{
  key: '/unstable',
  request: async () => fetchData(),
  retryCount: 2,
  timeoutMs: 3000,
}
```

### 5. Условная логика выполнения этапов

```ts
{
  key: '/orders',
  condition: (prev, all, shared) => !!prev && shared.userId > 0,
  request: async () => getOrders(),
}
```

### 6. Автоматическая отмена цепочки при критических ошибках

Если обработчик ошибки возвращает ошибку — выполнение прерывается, последующие шаги не выполняются.

### 7. Типобезопасность на всех этапах

Типы PipelineConfig, PipelineStageConfig, PipelineResult позволяют использовать строгую типизацию для входных/выходных данных.

### 8. Пауза между шагами, пользовательское подтверждение и изменение результата

```ts
async function onStepPause(stepIndex, stepResult, allResults) {
  // Покажите результат пользователю, дождитесь подтверждения или редактирования
  const userConfirmed = await showModalAndWaitUser(stepResult);
  if (userConfirmed.changed) {
    return userConfirmed.newResult;
  }
  return stepResult;
}
orchestrator.run(onStepPause);
```

---

## Ключевые возможности

- Последовательное выполнение цепочек взаимосвязанных HTTP-запросов
- Автоматическая передача данных между этапами
- Детальное отслеживание прогресса выполнения
- Интеллектуальная обработка HTTP-ошибок с retry-логикой
- Условная логика выполнения этапов
- Автоматическая отмена цепочки при критических ошибках
- Типобезопасность на всех этапах

- **Пауза между шагами и пользовательское подтверждение**: можно приостановить выполнение после любого шага, запросить подтверждение пользователя, изменить результат шага перед передачей в следующий этап (например, через UI).

## Архитектура

- **PipelineOrchestrator** — управляет последовательностью этапов, передачей данных и прогрессом
- **RequestExecutor** — выполняет HTTP-запросы через существующий rest.ts, поддерживает retry и timeout
- **ProgressTracker** — отслеживает статус каждого этапа
- **ErrorHandler** — классифицирует и обрабатывает ошибки
- **types.ts** — типы для конфигурирования и результатов

## Сложные примеры использования

### 0. Пауза между шагами, подтверждение и изменение результата

```ts
import { PipelineOrchestrator } from './orchestrator/pipeline-orchestrator';
import { PipelineConfig } from './types';
import { jokeConfig } from '@/core/rest/types';

const pipelineConfig: PipelineConfig = {
  /* ... */
};
const orchestrator = new PipelineOrchestrator(pipelineConfig, jokeConfig);

// Пример: пользователь подтверждает/редактирует результат каждого шага через UI
async function onStepPause(stepIndex, stepResult, allResults) {
  // Покажите результат пользователю, дождитесь подтверждения или редактирования
  // Например, через модальное окно или форму
  const userConfirmed = await showModalAndWaitUser(stepResult);
  if (userConfirmed.changed) {
    return userConfirmed.newResult; // Передать изменённый результат дальше
  }
  return stepResult; // Передать как есть
}

orchestrator.run(onStepPause).then(result => {
  // ...
});
```

> Если не передавать onStepPause — пайплайн работает как раньше (без пауз и подтверждений).

### 1. Передача данных между шагами и использование sharedData

```ts
import { PipelineOrchestrator } from './orchestrator/pipeline-orchestrator';
import { PipelineConfig } from './types';
import { jokeConfig } from '@/core/rest/types';

const sharedData = { userId: 42, log: [] };

const pipelineConfig: PipelineConfig = {
  stages: [
    {
      key: '/user',
      // Получаем пользователя по userId из sharedData
      request: async () => {},
      retryCount: 1,
      timeoutMs: 3000,
      errorHandler: (err, key, shared) => {
        shared.log.push(`Ошибка на user: ${err.message}`);
        // Вернуть объект для errors
        return { type: 'user-error', error: err, stageKey: key };
      },
    },
    {
      key: '/orders',
      // Выполнить только если user найден
      condition: (prev, all, shared) => !!prev && shared.userId > 0,
      request: async () => {},
      retryCount: 2,
      timeoutMs: 4000,
      errorHandler: (err, key, shared) => {
        shared.log.push(`Ошибка на orders: ${err.message}`);
        // Можно вернуть undefined, тогда сработает глобальный обработчик
      },
    },
    {
      key: '/recommendations',
      // Используем результат предыдущего шага
      condition: (prev, all, shared) => Array.isArray(all[1]) && all[1].length > 0,
      request: async () => {},
      retryCount: 1,
      timeoutMs: 2000,
    },
  ],
};

const orchestrator = new PipelineOrchestrator(pipelineConfig, jokeConfig, sharedData);

orchestrator.run().then(result => {
  if (result.success) {
    console.log('Результаты:', result.results);
    console.log('Лог:', sharedData.log);
  } else {
    console.error('Ошибки:', result.errors);
    console.log('Лог:', sharedData.log);
  }
});
```

### 2. Локальная и глобальная обработка ошибок

```ts
import { PipelineOrchestrator } from './orchestrator/pipeline-orchestrator';
import { PipelineConfig } from './types';
import { jokeConfig } from '@/core/rest/types';

const pipelineConfig: PipelineConfig = {
  stages: [
    {
      key: '/bad-endpoint',
      retryCount: 1,
      timeoutMs: 2000,
      errorHandler: (err, key) => {
        if (err.status === 404) {
          // Специфичная обработка 404
          return { type: 'not-found', error: err, stageKey: key };
        }
        // Вернуть undefined — сработает глобальный обработчик
      },
    },
    {
      key: '/categories',
      condition: (prev, all) => !!prev,
    },
  ],
};

const orchestrator = new PipelineOrchestrator(pipelineConfig, jokeConfig);

// Можно расширить глобальный обработчик через наследование ErrorHandler
orchestrator.run().then(result => {
  if (!result.success) {
    result.errors.forEach(err => {
      if (err.type === 'not-found') {
        // Локальная обработка 404
      } else if (err.type === 'unknown') {
        // Глобальная обработка
      }
    });
  }
});
```

## Типы и расширение

- Каждый этап может иметь:
  - `key` — путь/команда для rest.ts
  - `condition` — функция-условие для выполнения этапа
  - `retryCount`, `timeoutMs` — управление повторными попытками и таймаутом
- Можно расширять PipelineOrchestrator для поддержки параллельных этапов, сложных зависимостей и т.д.

## Визуализация прогресса

Можно использовать ProgressTracker для отображения статуса этапов в UI:

```ts
const progress = orchestrator.progress.getProgress();
// progress.currentStage, progress.stageStatuses
```

## Зависимости

- Использует существующий rest.ts для HTTP-запросов
- Не требует сторонних библиотек

---

**Вопросы и доработки:**

- Для интеграции с UI или расширения логики обращайтесь к разработчику модуля.
