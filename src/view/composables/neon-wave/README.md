# useNeonWaves 4.0

Модульная композиция Vue 3 / TypeScript / Canvas 2D. Публичный API сохранён: `useNeonWaves(canvasRef, configSource, options)` возвращает `{ start, stop }`. `DEFAULT_CONFIG` и все публичные типы экспортируются из `useNeonWaves.ts`.

## Установка

Скопируйте девять файлов `.ts` (`useNeonWaves.ts`, `types.ts`, `config.ts`, `utils.ts`, `geometry.ts`, `renderer.ts`, `particles.ts`, `effects.ts`, `performance.ts`) в одну папку. Импортируйте `useNeonWaves` и `DEFAULT_CONFIG` из `./neon-waves/useNeonWaves`.

```ts
import { reactive, ref } from 'vue';
import { useNeonWaves, DEFAULT_CONFIG, type NeonWavesConfig } from './neon-waves/useNeonWaves';

const abuotWave = ref<HTMLCanvasElement | null>(null);
const wavesConfig = reactive<NeonWavesConfig>({
  ...structuredClone(DEFAULT_CONFIG),
  particles: { ...DEFAULT_CONFIG.particles, minRadius: 0.6, maxRadius: 2 },
});

const { start, stop } = useNeonWaves(abuotWave, wavesConfig, {
  fps: 60, maxDpr: 1.5, performance: 'auto',
  effects: {
    cursor: true, cursorStrength: 60, cursorRadiusX: 320,
    cursorRadiusY: 170, cursorSmoothness: 0.3,
    particleGlow: true, particleGlowStrength: 0.75, particleGlowRadius: 5,
    particleTrails: true, trailLength: 13,
    ribbonBreathing: true, breathingStrength: 0.07,
    smoothIntersections: true,
    activityCycles: true, activityStrength: 0.07,
  },
});
```

Запуск анимации по-прежнему выполняется вручную через `start()`; `stop()` останавливает её.

## Особенности

- Геометрия каждой волны рассчитывается один раз на кадр и сохраняется в `Float32Array`.
- Частицы и пересечения используют интерполяцию готовых координат. Для больших `segments` погрешность меньше; при малых значениях возможно небольшое отличие от исходной геометрии.
- Бегущие импульсы теперь рисуются одним градиентным `stroke()` вместо нескольких десятков.
- Изменение цвета или параметров частиц не пересоздаёт runtime-объекты волн. При изменении количества или зоны волн выполняется структурное обновление.
- `performance: 'auto'` динамически регулирует долю рисуемых частиц на основании стоимости отрисовки; не изменяет размеры Canvas или сегментацию на лету, чтобы избежать скачков.
- Режимы `high` (по умолчанию), `balanced`, `low` задают ограничения FPS и DPR. Установка `fps: 0` означает частоту экрана, кроме экономных режимов.
- В режиме `auto` качество меняется постепенно, а измерение времени рисования не включает ожидание следующего кадра.
- `particleTrails`, `ribbonBreathing`, `smoothIntersections`, `activityCycles` включены по умолчанию. Для максимально близкого вида к v3 отключите эти четыре флага.

## Проверка

`tsc --strict` пройден с локальным минимальным shim-описанием API Vue. Это не заменяет проверку `vue-tsc` в реальном проекте. Браузерные визуальные тесты и профилирование FPS здесь не проводились. Рекомендуется проверить работу после 5–10 минут, `ResizeObserver`, скрытие вкладки, изменение реактивного конфига и мобильные устройства.


## v4.1: InView controls viewport visibility

The composable no longer creates its own `IntersectionObserver`. The existing
`pauseWhenHidden` option now controls **only** the Page Visibility API
(`document.visibilitychange`), and defaults to `true`. `start()` / `stop()`
remain idempotent and are controlled by your Vue component.

```ts
import { watch } from 'vue'
import { useElementVisibility, usePrefersReducedMotion } from '@macrulez/inview-vue'

const { start, stop } = useNeonWaves(abuotWave, wavesConfig, {
  pauseWhenHidden: true,
  effects: {
    cursor: true, cursorStrength: 60,
    cursorRadiusX: 320, cursorRadiusY: 170, cursorSmoothness: 0.3,
    particleGlow: true, particleGlowStrength: 0.75, particleGlowRadius: 5,
  },
})

const { isVisible } = useElementVisibility(abuotWave, {
  rootMargin: '100px 0px', threshold: 0, once: false,
})
const reducedMotion = usePrefersReducedMotion()
watch([isVisible, reducedMotion], ([visible, reduced]) => {
  if (visible && !reduced) start()
  else stop()
}, { immediate: true })
```

`stop()` cancels scheduled frames but does not clear the last rendered canvas
frame. The composable also draws a frame on initial attachment.
