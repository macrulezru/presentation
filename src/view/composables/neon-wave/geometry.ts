import { TAU, clamp } from './utils';

import type { NeonWavesConfig, WaveConfig, NeonWavesEffects } from './types';

export interface WaveRuntime {
  wave: WaveConfig;
  originalIndex: number;
  baseY: number;
  compression: number;
  initialized: boolean;
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
  ys: Float32Array;
}

export interface PointerState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  active: boolean;
  influence: number;
}

export class Geometry {
  config: NeonWavesConfig;
  fx: Required<NeonWavesEffects>;
  width = 0;
  height = 0;
  xs = new Float32Array(0);
  env = new Float32Array(0);
  waves: WaveRuntime[] = [];
  ordered: WaveRuntime[] = [];
  top: WaveRuntime[] = [];
  bottom: WaveRuntime[] = [];
  maxEdge = 0;
  pointer: PointerState = {
    x: -10000,
    y: -10000,
    targetX: -10000,
    targetY: -10000,
    active: false,
    influence: 0,
  };
  constructor(config: NeonWavesConfig, fx: Required<NeonWavesEffects>) {
    this.config = config;
    this.fx = fx;
    this.rebuild(true);
  }
  rebuild(structure: boolean) {
    const steps = Math.max(2, Math.floor(this.config.segments));
    if (this.xs.length !== steps + 1) this.xs = new Float32Array(steps + 1);
    if (this.env.length !== steps + 1) this.env = new Float32Array(steps + 1);
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      this.xs[i] = x * this.width;
      this.env[i] = Math.pow(
        Math.max(0, Math.sin(Math.PI * x)),
        this.config.envelopePower,
      );
    }
    this.maxEdge = Math.max(0, ...this.config.edgeLayers.map(x => x.width));
    if (structure) {
      const previous = this.waves;
      this.waves = this.config.waves.map((w, i) => {
        const old = previous[i];
        const preserve = old && old.wave.zone === w.zone;
        return {
          wave: w,
          originalIndex: i,
          baseY: preserve ? old.baseY : 0,
          compression: preserve ? old.compression : 1,
          initialized: !!preserve && old.initialized,
          phase1: 0,
          phase2: 0,
          driftY: 0,
          freq1: TAU * w.freq,
          freq2: TAU * w.freq2,
          particleSpeed: w.speedXRange
            ? (w.speedXRange[0] + w.speedXRange[1]) / 2
            : (w.speedX ?? 0.1),
          particleDirection:
            this.config.particles.direction === 'ltr'
              ? 1
              : this.config.particles.direction === 'rtl'
                ? -1
                : w.zone === 'top'
                  ? -1
                  : 1,
          organicPhase: i * 2.39996 + w.phase,
          depthPhase: i * 1.618,
          pulsePhase: i * 0.37,
          ys: new Float32Array(steps + 1),
        };
      });
      this.top = this.waves.filter(r => r.wave.zone === 'top');
      this.bottom = this.waves.filter(r => r.wave.zone === 'bottom');
      this.ordered = [...this.top, ...this.bottom];
    } else
      for (const r of this.waves)
        if (r.ys.length !== steps + 1) r.ys = new Float32Array(steps + 1);
  }
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.rebuild(false);
    for (const r of this.waves) r.initialized = false;
  }
  updateConfig(c: NeonWavesConfig, structure: boolean, grid: boolean) {
    this.config = c;
    if (structure) this.rebuild(true);
    else if (grid) this.rebuild(false);
    else {
      this.maxEdge = Math.max(0, ...c.edgeLayers.map(x => x.width));
      for (const r of this.waves) {
        r.wave = c.waves[r.originalIndex]!;
        r.freq1 = TAU * r.wave.freq;
        r.freq2 = TAU * r.wave.freq2;
        r.particleSpeed = r.wave.speedXRange
          ? (r.wave.speedXRange[0] + r.wave.speedXRange[1]) / 2
          : (r.wave.speedX ?? 0.1);
        r.particleDirection =
          c.particles.direction === 'ltr'
            ? 1
            : c.particles.direction === 'rtl'
              ? -1
              : r.wave.zone === 'top'
                ? -1
                : 1;
      }
    }
  }
  prepare(r: WaveRuntime, t: number) {
    const w = r.wave;
    const direction = w.zone === 'top' ? 1 : -1;
    let phaseX: number;
    if (w.speedXRange) {
      const [a, b] = w.speedXRange;
      const f = w.modFreqX ?? 0.5;
      phaseX = (a + b) * 0.5 * direction * t;
      if (f !== 0) phaseX -= (((b - a) * 0.5) / f) * Math.cos(f * t);
    } else phaseX = t * (w.speedX ?? 0) * direction;
    let drift: number;
    if (w.speedYRange) {
      const [a, b] = w.speedYRange;
      const f = w.modFreqY ?? 0.3;
      drift = (a + b) * 0.5 * t;
      if (f !== 0) drift -= (((b - a) * 0.5) / f) * Math.cos(f * t);
    } else drift = t * (w.speedY ?? 0);
    r.phase1 = w.phase + phaseX;
    r.phase2 = -w.phase * 1.3 + phaseX * 1.4;
    r.driftY = w.ampY * Math.sin(drift + w.phase);
  }
  sample(x: number, r: WaveRuntime, t: number, cursor = true): number {
    const raw =
      Math.sin(x * r.freq1 + r.phase1) * r.wave.amp +
      Math.sin(x * r.freq2 + r.phase2) * r.wave.amp2;
    const organic = this.fx.organic
      ? 1 +
        this.fx.organicStrength * Math.sin(x * Math.PI * 2.1 - t * 0.19 + r.organicPhase)
      : 1;
    const depth = this.fx.depth
      ? Math.sin(x * Math.PI * 1.7 + t * 0.13 + r.depthPhase) * 3.5
      : 0;
    const base = raw * organic + r.driftY + depth;
    const p = this.pointer;
    if (!cursor || !this.fx.cursor || p.influence < 0.001 || this.width <= 0) return base;
    const dx = x * this.width - p.x;
    if (Math.abs(dx) > this.fx.cursorRadiusX * 3.5) return base;
    const dy = r.baseY + base * r.compression - p.y;
    if (Math.abs(dy) > this.fx.cursorRadiusY * 3.5) return base;
    const nx = dx / this.fx.cursorRadiusX,
      ny = dy / this.fx.cursorRadiusY;
    const falloff = Math.exp(-0.5 * (nx * nx + ny * ny));
    const displacement = this.fx.cursorStrength * p.influence * ny * falloff;
    return base + displacement / Math.max(0.1, r.compression);
  }
  update(t: number, dt: number) {
    const p = this.pointer;
    const blend = 1 - Math.exp(-Math.max(0, dt) / 0.22);
    const pb = 1 - Math.exp(-Math.max(0, dt) / this.fx.cursorSmoothness);
    p.influence += ((p.active ? 1 : 0) - p.influence) * pb;
    if (p.active) {
      p.x += (p.targetX - p.x) * pb;
      p.y += (p.targetY - p.y) * pb;
    }
    for (const r of this.waves) this.prepare(r, t);
    const gap =
      typeof this.config.gap === 'string'
        ? (parseFloat(this.config.gap) / 100) * this.height
        : this.config.gap;
    const center = this.height / 2;
    this.position(
      this.top,
      this.config.padding,
      Math.max(this.config.padding, center - gap / 2),
      t,
      blend,
    );
    this.position(
      this.bottom,
      Math.min(this.height - this.config.padding, center + gap / 2),
      this.height - this.config.padding,
      t,
      blend,
    );
    this.ordered.sort((a, b) => a.baseY - b.baseY);
    // One final geometry cache for rendering, particles and intersection detection.
    const steps = this.xs.length - 1;
    for (const r of this.waves)
      for (let i = 0; i <= steps; i++)
        r.ys[i] = r.baseY + this.sample(i / steps, r, t) * r.compression;
  }
  private position(
    items: WaveRuntime[],
    spaceTop: number,
    spaceBottom: number,
    t: number,
    blend: number,
  ) {
    const available = Math.max(0, spaceBottom - spaceTop);
    for (let i = 0; i < items.length; i++) {
      const r = items[i]!,
        w = r.wave,
        step = items.length > 1 ? i / (items.length - 1) : 0.5;
      let baseY = spaceTop + available * step,
        min = Infinity,
        max = -Infinity;
      for (let j = 0; j <= 32; j++) {
        const y = this.sample(j / 32, r, t, false);
        if (y < min) min = y;
        if (y > max) max = y;
      }
      const half = Math.max(
        (w.thickness * (1 + this.config.pulseAmp)) / 2,
        this.maxEdge / 2,
      );
      const neededTop = baseY + min - half,
        neededBottom = baseY + max + half;
      let compression = 1;
      if (neededTop < spaceTop || neededBottom > spaceBottom) {
        const needed = neededBottom - neededTop;
        if (needed > spaceBottom - spaceTop)
          compression = (spaceBottom - spaceTop - 4) / needed;
        const ct = baseY + (min - half) * compression,
          cb = baseY + (max + half) * compression;
        if (ct < spaceTop) baseY += spaceTop - ct;
        else if (cb > spaceBottom) baseY -= cb - spaceBottom;
      }
      compression = Math.max(0.1, compression);
      if (!r.initialized) {
        r.baseY = baseY;
        r.compression = compression;
        r.initialized = true;
      } else {
        r.baseY += (baseY - r.baseY) * blend;
        r.compression += (compression - r.compression) * blend;
      }
    }
  }
  at(r: WaveRuntime, x: number): number {
    const n = r.ys.length - 1;
    if (n < 1) return r.baseY;
    const f = clamp(x, 0, 1) * n;
    const i = Math.min(n - 1, Math.floor(f));
    return r.ys[i]! + (r.ys[i + 1]! - r.ys[i]!) * (f - i);
  }
  slope(r: WaveRuntime, x: number): number {
    const n = r.ys.length - 1;
    const i = Math.min(n - 1, Math.max(0, Math.floor(clamp(x, 0, 1) * n)));
    return (r.ys[i + 1]! - r.ys[i]!) / (this.width / n || 1);
  }
}
