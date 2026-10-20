import {
  onBeforeUnmount,
  onMounted,
  watch,
  toValue,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';

// ==========================================

// 1. ИНТЕРФЕЙСЫ КОНФИГУРАЦИИ

// ==========================================

export interface WaveColorConfig {
  top: string;

  mid: string;

  bot: string;

  edge: string;

  core: string;
}

export interface WaveConfig {
  amp: number;

  amp2: number;

  freq: number;

  freq2: number;

  phase: number;

  thickness: number;

  color: number;

  gradientDirection: 'top-down' | 'bottom-up';

  zone: 'top' | 'bottom';

  speedX?: number;

  speedY?: number;

  ampY: number;

  speedXRange?: [number, number];

  speedYRange?: [number, number];

  modFreqX?: number;

  modFreqY?: number;
}

export interface RibbonLayerConfig {
  scale: number;

  alpha: number;
}

export interface EdgeLayerConfig {
  width: number;

  colorKey: 'edge' | 'core' | 'top' | 'mid';

  alpha: number;
}

export interface ParticleConfig {
  enabled: boolean;

  count: number;

  minRadius: number;

  maxRadius: number;

  speedMultiplier: number;

  colors: string[];

  minAlpha: number;

  maxAlpha: number;

  direction?: 'ltr' | 'rtl' | 'auto';
}

export interface NeonWavesConfig {
  colors: WaveColorConfig[];

  waves: WaveConfig[];

  maxBrightness: number;

  envelopePower: number;

  ribbonLayers: RibbonLayerConfig[];

  edgeLayers: EdgeLayerConfig[];

  segments: number;

  pulseSpeed: number;

  pulseAmp: number;

  padding: number;

  fadeEdgeWidth: number;

  gap: number | string;

  particles: ParticleConfig;
}

// ==========================================

// 2. КОНФИГ ПО УМОЛЧАНИЮ

// ==========================================

export const DEFAULT_CONFIG: NeonWavesConfig = {
  maxBrightness: 0.35,

  envelopePower: 0.7,

  segments: 64,

  pulseSpeed: 0.8,

  pulseAmp: 0.02,

  padding: 20,

  fadeEdgeWidth: 260,

  gap: 320,

  colors: [
    {
      top: 'rgba(60, 75, 45, 1)',

      mid: 'rgba(90, 110, 70, 0.5)',

      bot: 'rgba(60, 75, 45, 0)',

      edge: 'rgba(120, 140, 100, 0.2)',

      core: 'rgba(180, 195, 160, 0.5)',
    },

    {
      top: 'rgba(110, 60, 50, 1)',

      mid: 'rgba(150, 80, 70, 0.5)',

      bot: 'rgba(110, 60, 50, 0)',

      edge: 'rgba(190, 100, 90, 0.15)',

      core: 'rgba(220, 160, 150, 0.4)',
    },

    {
      top: 'rgba(70, 80, 90, 1)',

      mid: 'rgba(100, 120, 140, 0.5)',

      bot: 'rgba(70, 80, 90, 0)',

      edge: 'rgba(140, 160, 180, 0.2)',

      core: 'rgba(180, 200, 220, 0.5)',
    },

    {
      top: 'rgba(30, 40, 45, 1)',

      mid: 'rgba(50, 70, 80, 0.5)',

      bot: 'rgba(30, 40, 45, 0)',

      edge: 'rgba(80, 100, 110, 0.2)',

      core: 'rgba(140, 170, 180, 0.5)',
    },

    {
      top: 'rgba(70, 80, 50, 1)',

      mid: 'rgba(100, 120, 70, 0.5)',

      bot: 'rgba(70, 80, 50, 0)',

      edge: 'rgba(130, 150, 100, 0.2)',

      core: 'rgba(170, 190, 140, 0.5)',
    },
  ],

  waves: [
    // --- ВЕРХНЯЯ ЗОНА (4 волны) ---

    {
      zone: 'top',

      amp: 190,

      amp2: 70,

      freq: 1.1,

      freq2: 1.9,

      phase: 0.0,

      speedXRange: [0.02, 0.15],

      modFreqX: 0.1,

      speedYRange: [-0.2, 0.3],

      modFreqY: 0.15,

      ampY: 25,

      thickness: 275,

      color: 3,

      gradientDirection: 'bottom-up',
    },

    {
      zone: 'top',

      amp: 170,

      amp2: 60,

      freq: 1.3,

      freq2: 2.1,

      phase: 1.2,

      speedXRange: [0.05, 0.25],

      modFreqX: 0.15,

      speedY: 0.1,

      ampY: 15,

      thickness: 125,

      color: 2,

      gradientDirection: 'bottom-up',
    },

    {
      zone: 'top',

      amp: 45,

      amp2: 50,

      freq: 1.5,

      freq2: 2.3,

      phase: 2.5,

      speedX: 0.4,

      speedY: 0.0,

      ampY: 12,

      thickness: 140,

      color: 4,

      gradientDirection: 'bottom-up',
    },

    {
      zone: 'top',

      amp: 110,

      amp2: 45,

      freq: 1.8,

      freq2: 2.8,

      phase: 3.8,

      speedX: 0.3,

      speedY: 0.0,

      ampY: 8,

      thickness: 50,

      color: 0,

      gradientDirection: 'bottom-up',
    },

    // --- НИЖНЯЯ ЗОНА (2 тонкие волны) ---

    {
      zone: 'bottom',

      amp: 90,

      amp2: 40,

      freq: 1.4,

      freq2: 2.2,

      phase: 0.5,

      speedX: 0.2,

      speedY: 0.0,

      ampY: 5,

      thickness: 120,

      color: 3,

      gradientDirection: 'top-down',
    },

    {
      zone: 'bottom',

      amp: 120,

      amp2: 50,

      freq: 1.6,

      freq2: 2.5,

      phase: 2.2,

      speedX: 0.35,

      speedY: 0.0,

      ampY: 8,

      thickness: 90,

      color: 0,

      gradientDirection: 'top-down',
    },
  ],

  ribbonLayers: [
    { scale: 1.0, alpha: 0.35 },

    { scale: 0.65, alpha: 0.55 },

    { scale: 0.3, alpha: 0.85 },
  ],

  edgeLayers: [
    { width: 10.0, colorKey: 'edge', alpha: 0.75 },

    { width: 4.2, colorKey: 'core', alpha: 0.15 },

    { width: 1.5, colorKey: 'core', alpha: 0.2 },
  ],

  particles: {
    enabled: true,

    count: 120,

    minRadius: 1,

    maxRadius: 3,

    speedMultiplier: 0.3,

    colors: ['rgb(180, 195, 160)', 'rgb(107, 164, 184)', 'rgb(196, 220, 150)'],

    minAlpha: 0.2,

    maxAlpha: 0.8,

    direction: 'auto',
  },
};

// Оптимизированная реализация Canvas 2D.
// configSource поддерживает обычный объект, ref и getter.

export interface NeonWavesEffects {
  organic?: boolean;
  organicStrength?: number; // 0..0.3
  lightPulses?: boolean;
  pulseCount?: number; // per wave, 0..4
  pulseSpeed?: number;
  depth?: boolean;
  enhancedParticles?: boolean;
  particleGlow?: boolean; // soft halo around particles
  particleGlowStrength?: number; // 0..2, default 0.55
  particleGlowRadius?: number; // halo radius multiplier, default 4
  intersections?: boolean;
  cursor?: boolean;
  cursorStrength?: number; // pixels, 0..100
  cursorRadiusX?: number; // pixels, default 230
  cursorRadiusY?: number; // pixels, default 145
  cursorSmoothness?: number; // seconds, default 0.24
}

export interface NeonWavesOptions {
  effects?: NeonWavesEffects;
  fps?: number; // 0 = частота монитора, по умолчанию 60
  pauseWhenHidden?: boolean;
  maxDpr?: number;
}

interface Particle {
  waveIndex: number;
  x: number;
  yOffset: number;
  radius: number;
  color: string;
  baseAlpha: number;
  phase: number;
  kind: number;
  sizeFactor: number;
}

interface WaveRuntime {
  wave: WaveConfig;
  originalIndex: number;
  baseY: number;
  compression: number;
  geometryInitialized: boolean;
  phase1: number;
  phase2: number;
  driftY: number;
  freq1: number;
  freq2: number;
  particleSpeed: number;
  particleDirection: number;
  organicPhase: number;
  depthPhase: number;
  pulsePhase: number;
}

const TAU = Math.PI * 2;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function cloneConfig(config: NeonWavesConfig): NeonWavesConfig {
  return {
    ...config,
    colors: config.colors.map(c => ({ ...c })),
    waves: config.waves.map(w => ({
      ...w,
      speedXRange: w.speedXRange ? ([...w.speedXRange] as [number, number]) : undefined,
      speedYRange: w.speedYRange ? ([...w.speedYRange] as [number, number]) : undefined,
    })),
    ribbonLayers: config.ribbonLayers.map(l => ({ ...l })),
    edgeLayers: config.edgeLayers.map(l => ({ ...l })),
    particles: { ...config.particles, colors: [...config.particles.colors] },
  };
}

// CSS-цвета с альфой: в соответствии с исходным кодом заменяем alpha, а не умножаем.
function withAlpha(color: string, alpha: number): string {
  const a = clamp(alpha, 0, 1);
  if (/^rgba\(/i.test(color)) {
    return color.replace(/,\s*(?:\d*\.)?\d+\s*\)\s*$/i, `, ${a})`);
  }
  if (/^rgb\(/i.test(color))
    return color.replace(/^rgb\(/i, 'rgba(').replace(/\)\s*$/, `, ${a})`);
  if (/^#[\da-f]{6}$/i.test(color)) {
    const n = parseInt(color.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  if (/^#[\da-f]{3}$/i.test(color)) {
    const r = parseInt(color[1]!, 16) * 17;
    const g = parseInt(color[2]!, 16) * 17;
    const b = parseInt(color[3]!, 16) * 17;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return color;
}

export function useNeonWaves(
  canvasRef: Ref<HTMLCanvasElement | null>,
  configSource: MaybeRefOrGetter<NeonWavesConfig> = DEFAULT_CONFIG,
  options: NeonWavesOptions = {},
) {
  let config = cloneConfig(toValue(configSource));
  const maxDpr = Math.max(0.5, options.maxDpr ?? 1.5);
  const targetFPS = Math.max(0, options.fps ?? 60);
  const pauseWhenHidden = options.pauseWhenHidden ?? true;
  const fx = {
    organic: options.effects?.organic ?? true,
    organicStrength: clamp(options.effects?.organicStrength ?? 0.1, 0, 0.3),
    lightPulses: options.effects?.lightPulses ?? true,
    pulseCount: clamp(Math.floor(options.effects?.pulseCount ?? 1), 0, 4),
    pulseSpeed: options.effects?.pulseSpeed ?? 0.11,
    depth: options.effects?.depth ?? true,
    enhancedParticles: options.effects?.enhancedParticles ?? true,
    particleGlow: options.effects?.particleGlow ?? true,
    particleGlowStrength: clamp(options.effects?.particleGlowStrength ?? 0.55, 0, 2),
    particleGlowRadius: clamp(options.effects?.particleGlowRadius ?? 4, 1, 12),
    intersections: options.effects?.intersections ?? true,
    cursor: options.effects?.cursor ?? true,
    cursorStrength: clamp(options.effects?.cursorStrength ?? 13, 0, 100),
    cursorRadiusX: Math.max(1, options.effects?.cursorRadiusX ?? 230),
    cursorRadiusY: Math.max(1, options.effects?.cursorRadiusY ?? 145),
    cursorSmoothness: Math.max(0.001, options.effects?.cursorSmoothness ?? 0.24),
  };
  let pointerX = -10000;
  let pointerY = -10000;
  let pointerTargetX = -10000;
  let pointerTargetY = -10000;
  let pointerActive = false;
  let pointerInfluence = 0;
  let lastIntersectionCheck = -Infinity;
  interface Spark {
    x: number;
    y: number;
    alpha: number;
    color: string;
  }
  let sparks: Spark[] = [];

  let ctx: CanvasRenderingContext2D | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let requested = false;
  let visible = true;
  let pageVisible = true;
  let lastTick = 0;
  let elapsed = 0;
  let particles: Particle[] = [];
  let runtimes: WaveRuntime[] = [];
  let ordered: WaveRuntime[] = [];
  let xs = new Float32Array(0);
  let ys = new Float32Array(0);
  let envs = new Float32Array(0);
  let maxEdgeWidth = 0;
  let fadeGradient: CanvasGradient | null = null;
  let observer: IntersectionObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;
  const colorCache = new Map<string, Map<number, string>>();

  function cachedAlpha(color: string, alpha: number): string {
    const a = Math.round(clamp(alpha, 0, 1) * 100) / 100;
    let cache = colorCache.get(color);
    if (!cache) {
      cache = new Map();
      colorCache.set(color, cache);
    }
    let value = cache.get(a);
    if (!value) {
      value = withAlpha(color, a);
      cache.set(a, value);
    }
    return value;
  }

  function rebuildStatic() {
    const steps = Math.max(2, Math.floor(config.segments));
    xs = new Float32Array(steps + 1);
    ys = new Float32Array(steps + 1);
    envs = new Float32Array(steps + 1);
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      xs[i] = x * width;
      envs[i] = Math.pow(Math.max(0, Math.sin(Math.PI * x)), config.envelopePower);
    }
    maxEdgeWidth = Math.max(0, ...config.edgeLayers.map(l => l.width));
    runtimes = config.waves.map((wave, originalIndex) => ({
      wave,
      originalIndex,
      baseY: 0,
      compression: 1,
      geometryInitialized: false,
      phase1: 0,
      phase2: 0,
      driftY: 0,
      freq1: TAU * wave.freq,
      freq2: TAU * wave.freq2,
      particleSpeed: wave.speedXRange
        ? (wave.speedXRange[0] + wave.speedXRange[1]) / 2
        : (wave.speedX ?? 0.1),
      organicPhase: originalIndex * 2.39996 + wave.phase,
      depthPhase: originalIndex * 1.618,
      pulsePhase: originalIndex * 0.37,
      particleDirection:
        config.particles.direction === 'ltr'
          ? 1
          : config.particles.direction === 'rtl'
            ? -1
            : wave.zone === 'top'
              ? -1
              : 1,
    }));
    ordered = [
      ...runtimes.filter(r => r.wave.zone === 'top'),
      ...runtimes.filter(r => r.wave.zone === 'bottom'),
    ];
    colorCache.clear();
    particleGlowSprites.clear();
    updateFade();
  }

  function initParticles() {
    particles = [];
    const p = config.particles;
    if (!p.enabled || !config.waves.length || !p.colors.length) return;
    for (let i = 0; i < Math.max(0, Math.floor(p.count)); i++) {
      particles.push({
        waveIndex: Math.floor(Math.random() * config.waves.length),
        x: Math.random(),
        yOffset: (Math.random() - 0.5) * 40,
        radius: p.minRadius + Math.random() * (p.maxRadius - p.minRadius),
        color: p.colors[Math.floor(Math.random() * p.colors.length)]!,
        baseAlpha: p.minAlpha + Math.random() * (p.maxAlpha - p.minAlpha),
        phase: Math.random() * TAU,
        kind: fx.enhancedParticles ? (i % 12 === 0 ? 2 : i % 3 === 0 ? 1 : 0) : 0,
        sizeFactor: 0.7 + Math.random() * 0.6,
      });
    }
  }

  function updateFade() {
    fadeGradient = null;
    if (!ctx || width <= 0 || config.fadeEdgeWidth <= 0) return;
    const ratio = Math.min(config.fadeEdgeWidth, width / 2) / width;
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(ratio, 'rgba(0,0,0,1)');
    grad.addColorStop(1 - ratio, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    fadeGradient = grad;
  }

  function resize() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const nextDpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const pxW = Math.max(0, Math.round(w * nextDpr));
    const pxH = Math.max(0, Math.round(h * nextDpr));
    if (
      w === width &&
      h === height &&
      nextDpr === dpr &&
      canvas.width === pxW &&
      canvas.height === pxH
    )
      return;
    width = w;
    height = h;
    dpr = nextDpr;
    if (canvas.width !== pxW) canvas.width = pxW;
    if (canvas.height !== pxH) canvas.height = pxH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildStatic();
    if (!running()) renderFrame(elapsed, 0);
  }

  function preparePhase(r: WaveRuntime, t: number) {
    const w = r.wave;
    const direction = w.zone === 'top' ? 1 : -1;
    let phaseX: number;
    if (w.speedXRange) {
      const [min, max] = w.speedXRange;
      const f = w.modFreqX ?? 0.5;
      phaseX = (min + max) * 0.5 * direction * t;
      if (f !== 0) phaseX -= (((max - min) * 0.5) / f) * Math.cos(f * t);
    } else phaseX = t * (w.speedX ?? 0) * direction;
    let driftPhase: number;
    if (w.speedYRange) {
      const [min, max] = w.speedYRange;
      const f = w.modFreqY ?? 0.3;
      driftPhase = (min + max) * 0.5 * t;
      if (f !== 0) driftPhase -= (((max - min) * 0.5) / f) * Math.cos(f * t);
    } else driftPhase = t * (w.speedY ?? 0);
    r.phase1 = w.phase + phaseX;
    r.phase2 = -w.phase * 1.3 + phaseX * 1.4;
    r.driftY = w.ampY * Math.sin(driftPhase + w.phase);
  }

  // The cursor deformation is applied only when drawing/sampling the final wave.
  // Layout calculations deliberately use the undeformed wave to avoid feedback.
  function sampleY(x: number, r: WaveRuntime, t: number, withCursor = true): number {
    const raw =
      Math.sin(x * r.freq1 + r.phase1) * r.wave.amp +
      Math.sin(x * r.freq2 + r.phase2) * r.wave.amp2;
    const organic = fx.organic
      ? 1 + fx.organicStrength * Math.sin(x * Math.PI * 2.1 - t * 0.19 + r.organicPhase)
      : 1;
    const depth = fx.depth
      ? Math.sin(x * Math.PI * 1.7 + t * 0.13 + r.depthPhase) * 3.5
      : 0;
    const base = raw * organic + r.driftY + depth;
    if (!withCursor || !fx.cursor || pointerInfluence < 0.001 || width <= 0) {
      return base;
    }

    // Continuous, smooth repulsion. In particular, no sign() discontinuity
    // when the wave crosses the pointer's Y coordinate.
    const dx = x * width - pointerX;
    const dy = r.baseY + base * r.compression - pointerY;
    const sigmaX = fx.cursorRadiusX;
    const sigmaY = fx.cursorRadiusY;
    const nx = dx / sigmaX;
    const ny = dy / sigmaY;
    const falloff = Math.exp(-0.5 * (nx * nx + ny * ny));
    // ny * gaussian(ny) is continuous, and smoothly tends to zero at the center.
    // Convert pixel displacement back to the uncompressed coordinate space.
    const displacementPx = fx.cursorStrength * pointerInfluence * ny * falloff;
    return base + displacementPx / Math.max(0.1, r.compression);
  }

  function calculateGeometry(t: number, dt: number) {
    // Smooth layout transitions when the sampled extrema change.
    const blend = 1 - Math.exp(-Math.max(0, dt) / 0.22);
    for (const r of runtimes) preparePhase(r, t);
    const pointerBlend = 1 - Math.exp(-Math.max(0, dt) / fx.cursorSmoothness);
    pointerInfluence += ((pointerActive ? 1 : 0) - pointerInfluence) * pointerBlend;
    if (pointerActive) {
      pointerX += (pointerTargetX - pointerX) * pointerBlend;
      pointerY += (pointerTargetY - pointerY) * pointerBlend;
    }
    const gap =
      typeof config.gap === 'string'
        ? (parseFloat(config.gap) / 100) * height
        : config.gap;
    const center = height / 2;
    const topEnd = Math.max(config.padding, center - gap / 2);
    const bottomStart = Math.min(height - config.padding, center + gap / 2);
    const top = ordered.filter(r => r.wave.zone === 'top');
    const bottom = ordered.filter(r => r.wave.zone === 'bottom');

    function positionZone(items: WaveRuntime[], spaceTop: number, spaceBottom: number) {
      const available = Math.max(0, spaceBottom - spaceTop);
      for (let i = 0; i < items.length; i++) {
        const r = items[i]!;
        const w = r.wave;
        const step = items.length > 1 ? i / (items.length - 1) : 0.5;
        let baseY = spaceTop + available * step;
        let minRaw = Infinity;
        let maxRaw = -Infinity;
        for (let j = 0; j <= 32; j++) {
          const y = sampleY(j / 32, r, t, false);
          if (y < minRaw) minRaw = y;
          if (y > maxRaw) maxRaw = y;
        }
        const halfTh = Math.max(
          (w.thickness * (1 + config.pulseAmp)) / 2,
          maxEdgeWidth / 2,
        );
        const neededTop = baseY + minRaw - halfTh;
        const neededBottom = baseY + maxRaw + halfTh;
        let compression = 1;
        if (neededTop < spaceTop || neededBottom > spaceBottom) {
          const needed = neededBottom - neededTop;
          if (needed > spaceBottom - spaceTop) {
            compression = (spaceBottom - spaceTop - 4) / needed;
          }
          const compressedTop = baseY + (minRaw - halfTh) * compression;
          const compressedBottom = baseY + (maxRaw + halfTh) * compression;
          if (compressedTop < spaceTop) baseY += spaceTop - compressedTop;
          else if (compressedBottom > spaceBottom)
            baseY -= compressedBottom - spaceBottom;
        }
        const targetCompression = Math.max(0.1, compression);
        if (!r.geometryInitialized) {
          r.baseY = baseY;
          r.compression = targetCompression;
          r.geometryInitialized = true;
        } else {
          r.baseY += (baseY - r.baseY) * blend;
          r.compression += (targetCompression - r.compression) * blend;
        }
      }
    }
    positionZone(top, config.padding, topEnd);
    positionZone(bottom, bottomStart, height - config.padding);
    ordered.sort((a, b) => a.baseY - b.baseY);
  }

  function drawWave(r: WaveRuntime, t: number) {
    if (!ctx) return;
    const context = ctx;
    const w = r.wave;
    const c = config.colors[w.color];
    if (!c) return;
    const steps = xs.length - 1;
    const cTop = w.gradientDirection === 'top-down' ? c.top : c.bot;
    const cBot = w.gradientDirection === 'top-down' ? c.bot : c.top;
    let yMin = Infinity;
    let yMax = -Infinity;
    for (let i = 0; i <= steps; i++) {
      const y = r.baseY + sampleY(i / steps, r, t) * r.compression;
      ys[i] = y;
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
    const pulse = 1 + config.pulseAmp * Math.sin(t * config.pulseSpeed + w.phase);
    const halfTh = w.thickness * pulse * r.compression * 0.5;
    for (let layerIndex = 0; layerIndex < config.ribbonLayers.length; layerIndex++) {
      const layer = config.ribbonLayers[layerIndex]!;
      // Depth is expressed through subtle width/opacity parallax, not extra waves.
      const depthScale = fx.depth
        ? 1 + 0.045 * Math.sin(t * 0.23 + r.depthPhase + layerIndex)
        : 1;
      context.beginPath();
      for (let i = 0; i <= steps; i++) {
        const y = ys[i]! - halfTh * layer.scale * depthScale * envs[i]!;
        if (i === 0) context.moveTo(xs[i]!, y);
        else context.lineTo(xs[i]!, y);
      }
      for (let i = steps; i >= 0; i--) {
        context.lineTo(xs[i]!, ys[i]! + halfTh * layer.scale * depthScale * envs[i]!);
      }
      context.closePath();
      const grad = context.createLinearGradient(0, yMin - halfTh, 0, yMax + halfTh);
      grad.addColorStop(0, cachedAlpha(cTop, layer.alpha));
      grad.addColorStop(0.5, cachedAlpha(c.mid, layer.alpha * 0.9));
      grad.addColorStop(1, cachedAlpha(cBot, layer.alpha * 0.1));
      context.fillStyle = grad;
      context.fill();
    }

    // Travelling highlights: few short strokes, reused wave geometry.
    if (fx.lightPulses && fx.pulseCount > 0) {
      const { core } = c;
      for (let k = 0; k < fx.pulseCount; k++) {
        const center =
          (((t * fx.pulseSpeed * (w.zone === 'top' ? 1 : -1) +
            r.pulsePhase +
            k / fx.pulseCount) %
            1) +
            1) %
          1;
        const span = 0.075;
        const from = Math.max(1, Math.floor((center - span) * steps));
        const to = Math.min(steps, Math.ceil((center + span) * steps));
        if (to <= from) continue;
        for (let i = from; i <= to; i++) {
          const distance = Math.abs(i / steps - center) / span;
          const brightness = Math.pow(Math.max(0, 1 - distance), 2) * envs[i]!;
          if (brightness < 0.035) continue;
          context.beginPath();
          context.moveTo(xs[i - 1]!, ys[i - 1]!);
          context.lineTo(xs[i]!, ys[i]!);
          context.lineWidth = 1.3 + 2 * brightness;
          context.strokeStyle = cachedAlpha(core, brightness * 0.48);
          context.stroke();
        }
      }
    }

    // Объединяем соседние сегменты с близкой толщиной/альфой.
    // Вместо 64 отдельных stroke() на слой обычно получается ~8–20.
    for (const layer of config.edgeLayers) {
      const color = c[layer.colorKey];
      let pathOpen = false;
      let currentWidth = -1;
      let currentAlpha = -1;
      for (let i = 1; i <= steps; i++) {
        const env = (envs[i]! + envs[i - 1]!) * 0.5;
        if (env < 0.01) {
          if (pathOpen) {
            context.stroke();
            pathOpen = false;
          }
          continue;
        }
        const lw = Math.max(0.5, layer.width * (0.3 + 0.7 * env) * r.compression);
        const alpha = env * layer.alpha;
        // Квантование уменьшает число смен стиля с минимальным отличием от оригинала.
        const quantWidth = Math.max(0.5, Math.round(lw * 2) / 2);
        const quantAlpha = Math.round(alpha * 16) / 16;
        if (!pathOpen || quantWidth !== currentWidth || quantAlpha !== currentAlpha) {
          if (pathOpen) context.stroke();
          context.beginPath();
          context.moveTo(xs[i - 1]!, ys[i - 1]!);
          context.lineWidth = quantWidth;
          context.strokeStyle = cachedAlpha(color, quantAlpha);
          currentWidth = quantWidth;
          currentAlpha = quantAlpha;
          pathOpen = true;
        }
        context.lineTo(xs[i]!, ys[i]!);
      }
      if (pathOpen) context.stroke();
    }
  }

  // Pre-render a radial glow once per particle color. No gradients or blur
  // filters are created inside the animation loop.
  const particleGlowSprites = new Map<string, HTMLCanvasElement>();
  const GLOW_TEXTURE_SIZE = 64;

  function getParticleGlowSprite(color: string): HTMLCanvasElement | null {
    const cached = particleGlowSprites.get(color);
    if (cached) return cached;
    if (typeof document === 'undefined') return null;

    const sprite = document.createElement('canvas');
    sprite.width = GLOW_TEXTURE_SIZE;
    sprite.height = GLOW_TEXTURE_SIZE;
    const spriteCtx = sprite.getContext('2d');
    if (!spriteCtx) return null;

    const center = GLOW_TEXTURE_SIZE / 2;
    const gradient = spriteCtx.createRadialGradient(
      center,
      center,
      0,
      center,
      center,
      center,
    );
    gradient.addColorStop(0, withAlpha(color, 0.68));
    gradient.addColorStop(0.16, withAlpha(color, 0.36));
    gradient.addColorStop(0.42, withAlpha(color, 0.13));
    gradient.addColorStop(1, withAlpha(color, 0));
    spriteCtx.fillStyle = gradient;
    spriteCtx.fillRect(0, 0, GLOW_TEXTURE_SIZE, GLOW_TEXTURE_SIZE);
    particleGlowSprites.set(color, sprite);
    return sprite;
  }

  function drawParticles(t: number, dt: number) {
    if (!ctx || !config.particles.enabled) return;
    const context = ctx;
    context.globalCompositeOperation = 'lighter';
    const multiplier = config.particles.speedMultiplier;
    for (const p of particles) {
      const r = runtimes[p.waveIndex];
      if (!r) continue;
      const speedFactor = p.kind === 2 ? 1.65 : p.kind === 1 ? 0.48 : 1;
      p.x += r.particleDirection * r.particleSpeed * multiplier * speedFactor * dt;
      if (p.x > 1.1) p.x = -0.1;
      else if (p.x < -0.1) p.x = 1.1;
      const y = r.baseY + sampleY(p.x, r, t) * r.compression + p.yOffset;
      const twinkle =
        p.kind === 2
          ? 0.65 + 0.35 * Math.sin(t * 5 + p.phase)
          : p.kind === 1
            ? 0.7 + 0.12 * Math.sin(t * 1.2 + p.phase)
            : 0.8 + 0.2 * Math.sin(t * 3 + p.phase);
      const alpha = p.baseAlpha * twinkle * (p.kind === 1 ? 0.45 : 1);
      const particleX = p.x * width;
      const radius = p.radius * p.sizeFactor * (p.kind === 2 ? 1.25 : 1);
      if (fx.particleGlow && fx.particleGlowStrength > 0) {
        const sprite = getParticleGlowSprite(p.color);
        if (sprite) {
          const glowRadius = radius * fx.particleGlowRadius;
          context.globalAlpha = clamp(alpha * fx.particleGlowStrength, 0, 1);
          context.drawImage(
            sprite,
            particleX - glowRadius,
            y - glowRadius,
            glowRadius * 2,
            glowRadius * 2,
          );
          context.globalAlpha = 1;
        }
      }
      context.beginPath();
      context.arc(particleX, y, radius, 0, TAU);
      context.fillStyle = cachedAlpha(p.color, alpha);
      context.fill();
    }
  }

  function updateIntersections(t: number) {
    if (!fx.intersections || width < 1 || t - lastIntersectionCheck < 0.1) return;
    lastIntersectionCheck = t;
    sparks = [];
    // Only adjacent top/bottom zone waves; sparse sampling bounds CPU work.
    const step = Math.max(10, Math.floor(width / 48));
    for (let a = 0; a < ordered.length; a++) {
      const ra = ordered[a]!;
      for (let b = a + 1; b < ordered.length; b++) {
        const rb = ordered[b]!;
        if (ra.wave.zone !== rb.wave.zone) continue;
        let prev =
          ra.baseY +
          sampleY(0, ra, t) * ra.compression -
          (rb.baseY + sampleY(0, rb, t) * rb.compression);
        for (let px = step; px <= width; px += step) {
          const x = Math.min(px / width, 1);
          const ya = ra.baseY + sampleY(x, ra, t) * ra.compression;
          const yb = rb.baseY + sampleY(x, rb, t) * rb.compression;
          const diff = ya - yb;
          if (prev * diff < 0 && sparks.length < 12) {
            const strength = Math.min(0.22, 0.11 + 0.11 * (1 - Math.abs(diff) / 100));
            sparks.push({
              x: x * width,
              y: (ya + yb) / 2,
              alpha: strength,
              color: config.colors[ra.wave.color]?.core ?? '#a5c7ae',
            });
          }
          prev = diff;
        }
      }
    }
  }

  function drawIntersections() {
    if (!ctx || !fx.intersections) return;
    const context = ctx;
    for (const spark of sparks) {
      const gradient = context.createRadialGradient(
        spark.x,
        spark.y,
        0,
        spark.x,
        spark.y,
        17,
      );
      gradient.addColorStop(0, cachedAlpha(spark.color, spark.alpha));
      gradient.addColorStop(1, cachedAlpha(spark.color, 0));
      context.fillStyle = gradient;
      context.fillRect(spark.x - 17, spark.y - 17, 34, 34);
    }
  }

  function renderFrame(t: number, dt: number) {
    if (!ctx || width <= 0 || height <= 0 || xs.length < 3) return;
    const context = ctx;
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    context.clearRect(0, 0, width, height);
    context.globalAlpha = config.maxBrightness;
    context.globalCompositeOperation = 'lighter';
    calculateGeometry(t, dt);
    for (const r of ordered) drawWave(r, t);
    updateIntersections(t);
    drawIntersections();
    context.globalAlpha = 1;
    drawParticles(t, dt);
    context.globalCompositeOperation = 'source-over';
    if (fadeGradient) {
      context.globalCompositeOperation = 'destination-in';
      context.fillStyle = fadeGradient;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
    }
  }

  function running() {
    return requested && !!ctx && (!pauseWhenHidden || (visible && pageVisible));
  }

  function tick(now: number) {
    rafId = 0;
    if (!running()) return;
    const interval = targetFPS > 0 ? 1000 / targetFPS : 0;
    if (lastTick === 0) lastTick = now - (interval || 16.667);
    const since = now - lastTick;
    if (interval === 0 || since >= interval - 0.5) {
      const dt = Math.min(since / 1000, 0.1);
      lastTick = now;
      elapsed += dt;
      renderFrame(elapsed, dt);
    }
    rafId = requestAnimationFrame(tick);
  }

  function syncLoop() {
    if (running()) {
      if (!rafId) {
        lastTick = 0;
        rafId = requestAnimationFrame(tick);
      }
    } else {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      lastTick = 0;
    }
  }

  function start() {
    if (typeof window === 'undefined') return;
    if (!ctx) attachCanvas();
    if (!ctx) return;
    requested = true;
    syncLoop();
  }

  function stop() {
    requested = false;
    syncLoop();
  }

  function onVisibilityChange() {
    pageVisible = !document.hidden;
    syncLoop();
  }

  function onPointerMove(event: PointerEvent) {
    if (!canvas || event.pointerType === 'touch') return;
    const rect = canvas.getBoundingClientRect();
    pointerTargetX = event.clientX - rect.left;
    pointerTargetY = event.clientY - rect.top;
    if (
      pointerTargetX < 0 ||
      pointerTargetX > rect.width ||
      pointerTargetY < 0 ||
      pointerTargetY > rect.height
    ) {
      pointerActive = false;
      return;
    }
    if (!pointerActive) {
      pointerX = pointerTargetX;
      pointerY = pointerTargetY;
    }
    pointerActive = true;
  }
  function onPointerLeave() {
    pointerActive = false;
  }

  function attachCanvas() {
    const next = canvasRef.value;
    if (!next || ctx) return;
    canvas = next;
    ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas = null;
      return;
    }
    rebuildStatic();
    resize();
    initParticles();
    renderFrame(elapsed, 0);
    if (fx.cursor) {
      // Window listener allows pointer interaction even when canvas is behind content.
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave);
      window.addEventListener('blur', onPointerLeave);
    }
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    } else window.addEventListener('resize', resize);
    if (pauseWhenHidden && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(entries => {
        visible = !!entries[0]?.isIntersecting;
        syncLoop();
      });
      observer.observe(canvas);
    }
  }

  // Важно: reactive config, ref и getter поддерживаются; обычный объект — статичен.
  watch(
    () => toValue(configSource),
    next => {
      if (!next) return;
      const old = config.particles;
      const reinitParticles =
        old.enabled !== next.particles.enabled ||
        old.count !== next.particles.count ||
        config.waves.length !== next.waves.length ||
        old.colors.join('|') !== next.particles.colors.join('|');
      config = cloneConfig(next);
      rebuildStatic();
      if (reinitParticles) initParticles();
      if (ctx && !running()) renderFrame(elapsed, 0);
    },
    { deep: true },
  );

  onMounted(() => {
    if (typeof window === 'undefined') return;
    pageVisible = !document.hidden;
    attachCanvas();
    if (pauseWhenHidden)
      document.addEventListener('visibilitychange', onVisibilityChange);
  });

  onBeforeUnmount(() => {
    stop();
    observer?.disconnect();
    resizeObserver?.disconnect();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
    ctx = null;
    canvas = null;
    particles = [];
    runtimes = [];
    ordered = [];
    colorCache.clear();
    particleGlowSprites.clear();
    fadeGradient = null;
    sparks = [];
  });

  return { start, stop };
}
