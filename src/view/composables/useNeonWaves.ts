import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue';

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
};

// ==========================================
// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cloneDeep) as unknown as T;
  const copy = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = cloneDeep(obj[key]);
    }
  }
  return copy;
}

// ==========================================
// 4. ОСНОВНАЯ ФУНКЦИЯ
// ==========================================

export function useNeonWaves(
  canvasRef: Ref<HTMLCanvasElement | null>,
  configSource: NeonWavesConfig,
) {
  const initialConfig = configSource ? configSource : DEFAULT_CONFIG;
  let activeConfig: NeonWavesConfig = cloneDeep(initialConfig);

  let ctx: CanvasRenderingContext2D | null = null;
  let rafId = 0;
  let startTime = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let isAnimating = false;

  const alphaCache = new Map<string, Map<number, string>>();
  function getColorWithAlpha(rgba: string, alpha: number): string {
    const a = Math.round(alpha * 100) / 100;
    let colorCache = alphaCache.get(rgba);
    if (!colorCache) {
      colorCache = new Map();
      alphaCache.set(rgba, colorCache);
    }
    const cached = colorCache.get(a);
    if (cached) return cached;
    const result = rgba.replace(/[\d.]+\)$/, `${a})`);
    colorCache.set(a, result);
    return result;
  }

  let xs: Float32Array | null = null;
  let ys: Float32Array | null = null;
  let envs: Float32Array | null = null;

  function ensureBuffers(steps: number) {
    if (!xs || xs.length < steps + 1) {
      xs = new Float32Array(steps + 1);
      ys = new Float32Array(steps + 1);
      envs = new Float32Array(steps + 1);
    }
  }

  function resize() {
    const canvas = canvasRef.value;
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!isAnimating) {
      renderFrame(performance.now() / 1000);
    }
  }

  function envelope(x: number): number {
    return Math.pow(Math.sin(Math.PI * x), activeConfig.envelopePower);
  }

  function waveY(x: number, w: WaveConfig, t: number): number {
    let phaseX: number;
    if (w.speedXRange) {
      const [min, max] = w.speedXRange;
      const mid = (min + max) / 2;
      const amp = (max - min) / 2;
      const f = w.modFreqX ?? 0.5;
      phaseX = mid * t - (amp / f) * Math.cos(f * t);
    } else {
      phaseX = t * (w.speedX ?? 0);
    }

    let driftY: number;
    if (w.speedYRange) {
      const [min, max] = w.speedYRange;
      const mid = (min + max) / 2;
      const amp = (max - min) / 2;
      const f = w.modFreqY ?? 0.3;
      const driftPhase = mid * t - (amp / f) * Math.cos(f * t);
      driftY = w.ampY * Math.sin(driftPhase + w.phase);
    } else {
      driftY = w.ampY * Math.sin(t * (w.speedY ?? 0) + w.phase);
    }

    const s = Math.sin(x * Math.PI * 2 * w.freq + w.phase + phaseX);
    const s2 = Math.sin(x * Math.PI * 2 * w.freq2 - w.phase * 1.3 + phaseX * 1.4);
    return s * w.amp + s2 * w.amp2 + driftY;
  }

  function getWaveCalculations(t: number) {
    const topWaves = activeConfig.waves.filter(w => w.zone === 'top');
    const bottomWaves = activeConfig.waves.filter(w => w.zone === 'bottom');

    const gapPx =
      typeof activeConfig.gap === 'string'
        ? (parseFloat(activeConfig.gap) / 100) * height
        : activeConfig.gap;
    const halfGap = gapPx / 2;
    const centerY = height / 2;

    const topZoneBottom = Math.max(activeConfig.padding, centerY - halfGap);
    const bottomZoneTop = Math.min(height - activeConfig.padding, centerY + halfGap);

    const result: { wave: WaveConfig; baseY: number; compression: number }[] = [];

    const processZone = (waves: WaveConfig[], spaceTop: number, spaceBottom: number) => {
      const available = Math.max(0, spaceBottom - spaceTop);
      waves.forEach((w, i) => {
        const step = waves.length > 1 ? i / (waves.length - 1) : 0.5;
        let baseY = spaceTop + available * step;

        let minRaw = Infinity;
        let maxRaw = -Infinity;
        for (let j = 0; j <= 32; j++) {
          const raw = waveY(j / 32, w, t);
          if (raw < minRaw) minRaw = raw;
          if (raw > maxRaw) maxRaw = raw;
        }

        const maxPulse = 1 + activeConfig.pulseAmp;
        const halfTh = Math.max(
          (w.thickness * maxPulse) / 2,
          Math.max(0, ...activeConfig.edgeLayers.map(l => l.width)) / 2,
        );

        const neededTop = baseY + minRaw - halfTh;
        const neededBottom = baseY + maxRaw + halfTh;

        let compression = 1;
        if (neededTop < spaceTop || neededBottom > spaceBottom) {
          const avail = spaceBottom - spaceTop;
          const needed = neededBottom - neededTop;
          if (needed > avail) {
            compression = (avail - 4) / needed;
          }

          const compressedTop = baseY + minRaw * compression - halfTh * compression;
          const compressedBottom = baseY + maxRaw * compression + halfTh * compression;

          if (compressedTop < spaceTop) {
            baseY += spaceTop - compressedTop;
          } else if (compressedBottom > spaceBottom) {
            baseY -= compressedBottom - spaceBottom;
          }
        }

        result.push({ wave: w, baseY, compression: Math.max(0.1, compression) });
      });
    };

    processZone(topWaves, activeConfig.padding, topZoneBottom);
    processZone(bottomWaves, bottomZoneTop, height - activeConfig.padding);

    return result.sort((a, b) => a.baseY - b.baseY);
  }

  function drawWave(
    w: WaveConfig,
    t: number,
    steps: number,
    baseY: number,
    compression: number,
  ) {
    if (!ctx || !xs || !ys || !envs) return;
    const c = activeConfig.colors[w.color];
    if (!c) return;

    const isTopDown = w.gradientDirection === 'top-down';
    const cTop = isTopDown ? c.top : c.bot;
    const cBot = isTopDown ? c.bot : c.top;

    let yMin = Infinity;
    let yMax = -Infinity;

    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      xs[i] = x * width;
      const rawY = waveY(x, w, t);
      const finalY = baseY + rawY * compression;
      ys[i] = finalY;
      envs[i] = envelope(x);

      // Используем ! для безопасного доступа
      const currentY = ys[i]!;
      if (currentY < yMin) yMin = currentY;
      if (currentY > yMax) yMax = currentY;
    }

    const pulse =
      1 + activeConfig.pulseAmp * Math.sin(t * activeConfig.pulseSpeed + w.phase);
    const th = w.thickness * pulse * compression;
    const halfTh = th * 0.5;

    for (const layer of activeConfig.ribbonLayers) {
      ctx.beginPath();
      let first = true;
      for (let i = 0; i <= steps; i++) {
        const h = halfTh * layer.scale * envs[i]!;
        const y = ys[i]! - h;
        if (first) {
          ctx.moveTo(xs[i]!, y);
          first = false;
        } else {
          ctx.lineTo(xs[i]!, y);
        }
      }
      for (let i = steps; i >= 0; i--) {
        const h = halfTh * layer.scale * envs[i]!;
        ctx.lineTo(xs[i]!, ys[i]! + h);
      }
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, yMin - halfTh, 0, yMax + halfTh);
      grad.addColorStop(0, getColorWithAlpha(cTop, layer.alpha));
      grad.addColorStop(0.5, getColorWithAlpha(c.mid, layer.alpha * 0.9));
      grad.addColorStop(1, getColorWithAlpha(cBot, layer.alpha * 0.1));
      ctx.fillStyle = grad;
      ctx.fill();
    }

    for (const layer of activeConfig.edgeLayers) {
      const baseColor = c[layer.colorKey];
      for (let i = 1; i <= steps; i++) {
        const env = (envs[i]! + envs[i - 1]!) * 0.5;
        if (env < 0.01) continue;
        const lw = Math.max(0.5, layer.width * (0.3 + 0.7 * env) * compression);
        const finalAlpha = env * layer.alpha;

        ctx.beginPath();
        ctx.moveTo(xs[i - 1]!, ys[i - 1]!);
        ctx.lineTo(xs[i]!, ys[i]!);
        ctx.lineWidth = lw;
        ctx.strokeStyle = getColorWithAlpha(baseColor, finalAlpha);
        ctx.stroke();
      }
    }
  }

  function applyEdgeFade() {
    if (!ctx || activeConfig.fadeEdgeWidth <= 0) return;
    const fadeW = Math.min(activeConfig.fadeEdgeWidth, width / 2);
    const leftRatio = fadeW / width;
    const rightRatio = 1 - leftRatio;
    ctx.globalCompositeOperation = 'destination-in';
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(leftRatio, 'rgba(0,0,0,1)');
    grad.addColorStop(rightRatio, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }

  function renderFrame(t: number) {
    if (!ctx || !xs || !ys || !envs) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    ctx.globalAlpha = activeConfig.maxBrightness;
    ctx.globalCompositeOperation = 'lighter';

    const steps = activeConfig.segments;
    const wavesData = getWaveCalculations(t);

    for (const { wave, baseY, compression } of wavesData) {
      drawWave(wave, t, steps, baseY, compression);
    }

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';

    applyEdgeFade();
  }

  function frame(now: number) {
    if (!ctx || !xs || !ys || !envs) return;
    if (!startTime) startTime = now;
    const t = (now - startTime) / 1000;

    renderFrame(t);

    if (isAnimating) {
      rafId = requestAnimationFrame(frame);
    }
  }

  // ==========================================
  // 5. УПРАВЛЕНИЕ АНИМАЦИЕЙ
  // ==========================================

  function start() {
    if (typeof window === 'undefined') return;
    if (isAnimating) return;
    isAnimating = true;

    if (!ctx) {
      const canvas = canvasRef.value;
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      if (!ctx) return;
      ensureBuffers(activeConfig.segments);
      resize();
    }

    startTime = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    isAnimating = false;
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(rafId);
    }
  }

  watch(
    () => configSource,
    newConfig => {
      if (newConfig) {
        activeConfig = cloneDeep(newConfig);
        if (ctx) {
          renderFrame(performance.now() / 1000);
        }
      }
    },
    { deep: true },
  );

  onMounted(() => {
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.value;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) return;

    ensureBuffers(activeConfig.segments);
    resize();
    window.addEventListener('resize', resize);

    renderFrame(0);
  });

  onBeforeUnmount(() => {
    stop();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', resize);
    }
    ctx = null;
    alphaCache.clear();
    xs = null;
    ys = null;
    envs = null;
  });

  return { start, stop };
}
