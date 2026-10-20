import {
  onBeforeUnmount,
  onMounted,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';

import { DEFAULT_CONFIG } from './config';
import { IntersectionEffects, activityAt } from './effects';
import { Geometry } from './geometry';
import { ParticleSystem } from './particles';
import { PerformanceManager } from './performance';
import { Renderer } from './renderer';
import { cloneConfig, clamp } from './utils';

import type { NeonWavesConfig, NeonWavesOptions, NeonWavesEffects } from './types';

export { DEFAULT_CONFIG } from './config';

export type {
  NeonWavesConfig,
  NeonWavesOptions,
  NeonWavesEffects,
  WaveConfig,
  WaveColorConfig,
  ParticleConfig,
  RibbonLayerConfig,
  EdgeLayerConfig,
} from './types';

function normalizeEffects(input: NeonWavesEffects = {}): Required<NeonWavesEffects> {
  return {
    organic: input.organic ?? true,
    organicStrength: clamp(input.organicStrength ?? 0.1, 0, 0.3),
    lightPulses: input.lightPulses ?? true,
    pulseCount: clamp(Math.floor(input.pulseCount ?? 1), 0, 4),
    pulseSpeed: input.pulseSpeed ?? 0.11,
    depth: input.depth ?? true,
    enhancedParticles: input.enhancedParticles ?? true,
    particleGlow: input.particleGlow ?? true,
    particleGlowStrength: clamp(input.particleGlowStrength ?? 0.55, 0, 2),
    particleGlowRadius: clamp(input.particleGlowRadius ?? 4, 1, 12),
    intersections: input.intersections ?? true,
    cursor: input.cursor ?? true,
    cursorStrength: clamp(input.cursorStrength ?? 13, 0, 100),
    cursorRadiusX: Math.max(1, input.cursorRadiusX ?? 230),
    cursorRadiusY: Math.max(1, input.cursorRadiusY ?? 145),
    cursorSmoothness: Math.max(0.001, input.cursorSmoothness ?? 0.24),
    particleTrails: input.particleTrails ?? true,
    trailLength: Math.max(0, input.trailLength ?? 13),
    ribbonBreathing: input.ribbonBreathing ?? true,
    breathingStrength: clamp(input.breathingStrength ?? 0.07, 0, 0.15),
    smoothIntersections: input.smoothIntersections ?? true,
    activityCycles: input.activityCycles ?? true,
    activityStrength: clamp(input.activityStrength ?? 0.07, 0, 0.2),
  };
}

export function useNeonWaves(
  canvasRef: Ref<HTMLCanvasElement | null>,
  configSource: MaybeRefOrGetter<NeonWavesConfig> = DEFAULT_CONFIG,
  options: NeonWavesOptions = {},
) {
  let config = cloneConfig(toValue(configSource));
  const fx = normalizeEffects(options.effects);
  const perf = new PerformanceManager(options);
  const geo = new Geometry(config, fx);
  let ctx: CanvasRenderingContext2D | null = null,
    canvas: HTMLCanvasElement | null = null;
  let renderer: Renderer | null = null,
    particles: ParticleSystem | null = null,
    intersections: IntersectionEffects | null = null;
  let dpr = 1,
    raf = 0,
    requested = false,
    pageVisible = true,
    lastTick = 0,
    elapsed = 0;
  let resizeObserver: ResizeObserver | null = null;
  const pauseWhenHidden = options.pauseWhenHidden ?? true;
  // InView owns viewport visibility; only Page Visibility is managed here.
  const running = () => requested && !!ctx && (!pauseWhenHidden || pageVisible);

  function render(t: number, dt: number) {
    if (
      !ctx ||
      !renderer ||
      !particles ||
      !intersections ||
      geo.width <= 0 ||
      geo.height <= 0
    )
      return;
    const start = perf.mode === 'auto' ? performanceNow() : 0;
    geo.update(t, dt);
    renderer.begin();
    const activity = activityAt(t, fx);
    for (const r of geo.ordered) renderer.drawWave(r, t, activity);
    if (perf.intersectionEnabled) intersections.update(t, dt);
    intersections.draw(ctx);
    ctx.globalAlpha = 1;
    particles.draw(ctx, t, dt, activity, perf.particleQuality);
    renderer.finish();
    if (start) perf.observe(performanceNow() - start);
  }

  function performanceNow() {
    return typeof performance !== 'undefined' ? performance.now() : 0;
  }

  function resize() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const nextDpr = Math.min(window.devicePixelRatio || 1, perf.dpr);
    const w = Math.max(0, Math.round(rect.width * nextDpr)),
      h = Math.max(0, Math.round(rect.height * nextDpr));
    if (
      rect.width === geo.width &&
      rect.height === geo.height &&
      nextDpr === dpr &&
      canvas.width === w &&
      canvas.height === h
    )
      return;
    dpr = nextDpr;
    canvas.width = w;
    canvas.height = h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    geo.resize(rect.width, rect.height);
    renderer?.resize();
    if (!running()) render(elapsed, 0);
  }

  function tick(now: number) {
    raf = 0;
    if (!running()) return;
    const interval = perf.fps > 0 ? 1000 / perf.fps : 0;
    if (lastTick === 0) lastTick = now - (interval || 16.667);
    const since = now - lastTick;
    if (interval === 0 || since >= interval - 0.5) {
      const dt = Math.min(since / 1000, 0.1);
      lastTick = now;
      elapsed += dt;
      render(elapsed, dt);
    }
    raf = requestAnimationFrame(tick);
  }

  function syncLoop() {
    if (running()) {
      if (!raf) {
        lastTick = 0;
        raf = requestAnimationFrame(tick);
      }
    } else {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastTick = 0;
    }
  }

  function start() {
    if (typeof window === 'undefined') return;
    if (!ctx) attach();
    if (!ctx) return;
    requested = true;
    syncLoop();
  }

  function stop() {
    requested = false;
    syncLoop();
  }

  function visibility() {
    pageVisible = !document.hidden;
    syncLoop();
  }

  function pointerMove(e: PointerEvent) {
    if (!canvas || e.pointerType === 'touch') return;
    const rect = canvas.getBoundingClientRect(),
      p = geo.pointer;
    p.targetX = e.clientX - rect.left;
    p.targetY = e.clientY - rect.top;
    if (
      p.targetX < 0 ||
      p.targetX > rect.width ||
      p.targetY < 0 ||
      p.targetY > rect.height
    ) {
      p.active = false;
      return;
    }
    if (!p.active) {
      p.x = p.targetX;
      p.y = p.targetY;
    }
    p.active = true;
  }

  function pointerLeave() {
    geo.pointer.active = false;
  }

  function attach() {
    const next = canvasRef.value;
    if (!next || ctx) return;
    canvas = next;
    ctx = next.getContext('2d');
    if (!ctx) {
      canvas = null;
      return;
    }
    renderer = new Renderer(ctx, geo, fx);
    particles = new ParticleSystem(geo, fx);
    intersections = new IntersectionEffects(geo, fx);
    resize();
    render(elapsed, 0);
    if (fx.cursor) {
      window.addEventListener('pointermove', pointerMove, { passive: true });
      window.addEventListener('pointerleave', pointerLeave);
      window.addEventListener('blur', pointerLeave);
    }
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(next);
    } else window.addEventListener('resize', resize);
  }

  // Only rebuild structural state if wave count/zone order changes. No resets for color or particle-size edits.
  watch(
    () => toValue(configSource),
    next => {
      if (!next) return;
      const old = config,
        updated = cloneConfig(next);
      const structure =
        old.waves.length !== updated.waves.length ||
        old.waves.some((w, i) => w.zone !== updated.waves[i]?.zone);
      const grid =
        old.segments !== updated.segments || old.envelopePower !== updated.envelopePower;
      const fade = old.fadeEdgeWidth !== updated.fadeEdgeWidth;
      const colorChange = JSON.stringify(old.colors) !== JSON.stringify(updated.colors);
      config = updated;
      geo.updateConfig(config, structure, grid);
      particles?.syncConfig(old, config, structure);
      if (colorChange) renderer?.invalidateColors();
      if (fade) renderer?.resize();
      if (ctx && !running()) render(elapsed, 0);
    },
    { deep: true },
  );

  onMounted(() => {
    if (typeof window === 'undefined') return;
    pageVisible = !document.hidden;
    attach();
    if (pauseWhenHidden) document.addEventListener('visibilitychange', visibility);
  });

  onBeforeUnmount(() => {
    stop();
    resizeObserver?.disconnect();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerleave', pointerLeave);
      window.removeEventListener('blur', pointerLeave);
      document.removeEventListener('visibilitychange', visibility);
    }
    particles?.clear();
    intersections?.reset();
    ctx = null;
    canvas = null;
    renderer = null;
    particles = null;
    intersections = null;
  });

  return { start, stop };
}
