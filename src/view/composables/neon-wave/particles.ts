import { Geometry } from './geometry';
import { Colors, TAU, clamp, withAlpha } from './utils';

import type { NeonWavesConfig, NeonWavesEffects } from './types';

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

export class ParticleSystem {
  private particles: Particle[] = [];
  private sprites = new Map<string, HTMLCanvasElement>();
  private colors = new Colors();
  constructor(
    private geo: Geometry,
    private fx: Required<NeonWavesEffects>,
  ) {
    this.reset();
  }
  reset() {
    this.particles = [];
    const p = this.geo.config.particles;
    if (!p.enabled || !this.geo.waves.length || !p.colors.length) return;
    for (let i = 0; i < Math.max(0, Math.floor(p.count)); i++)
      this.particles.push({
        waveIndex: Math.floor(Math.random() * this.geo.waves.length),
        x: Math.random(),
        yOffset: (Math.random() - 0.5) * 40,
        radius: p.minRadius + Math.random() * (p.maxRadius - p.minRadius),
        color: p.colors[Math.floor(Math.random() * p.colors.length)]!,
        baseAlpha: p.minAlpha + Math.random() * (p.maxAlpha - p.minAlpha),
        phase: Math.random() * TAU,
        kind: this.fx.enhancedParticles ? (i % 12 === 0 ? 2 : i % 3 === 0 ? 1 : 0) : 0,
        sizeFactor: 0.7 + Math.random() * 0.6,
      });
  }
  syncConfig(previous: NeonWavesConfig, next: NeonWavesConfig, structure: boolean) {
    const a = previous.particles,
      b = next.particles;
    if (
      structure ||
      a.count !== b.count ||
      a.enabled !== b.enabled ||
      a.colors.join('|') !== b.colors.join('|')
    ) {
      this.reset();
      this.sprites.clear();
      this.colors.clear();
      return;
    }
    if (a.minRadius !== b.minRadius || a.maxRadius !== b.maxRadius) {
      const oldSpan = Math.max(0.00001, a.maxRadius - a.minRadius);
      for (const p of this.particles) {
        const relative = clamp((p.radius - a.minRadius) / oldSpan, 0, 1);
        p.radius = b.minRadius + relative * (b.maxRadius - b.minRadius);
      }
    }
    if (a.minAlpha !== b.minAlpha || a.maxAlpha !== b.maxAlpha) {
      const span = Math.max(0.00001, a.maxAlpha - a.minAlpha);
      for (const p of this.particles) {
        const relative = clamp((p.baseAlpha - a.minAlpha) / span, 0, 1);
        p.baseAlpha = b.minAlpha + relative * (b.maxAlpha - b.minAlpha);
      }
    }
  }
  private sprite(color: string) {
    let s = this.sprites.get(color);
    if (s) return s;
    if (typeof document === 'undefined') return null;
    s = document.createElement('canvas');
    s.width = s.height = 64;
    const c = s.getContext('2d');
    if (!c) return null;
    const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, withAlpha(color, 0.68));
    gr.addColorStop(0.16, withAlpha(color, 0.36));
    gr.addColorStop(0.42, withAlpha(color, 0.13));
    gr.addColorStop(1, withAlpha(color, 0));
    c.fillStyle = gr;
    c.fillRect(0, 0, 64, 64);
    this.sprites.set(color, s);
    return s;
  }
  draw(
    ctx: CanvasRenderingContext2D,
    t: number,
    dt: number,
    activity: number,
    quality: number,
  ) {
    const cfg = this.geo.config.particles;
    if (!cfg.enabled) return;
    const previousAlpha = ctx.globalAlpha,
      previousComposite = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1;
    for (let index = 0; index < this.particles.length; index++) {
      const p = this.particles[index]!,
        r = this.geo.waves[p.waveIndex];
      if (!r) continue;
      const speed = p.kind === 2 ? 1.65 : p.kind === 1 ? 0.48 : 1;
      p.x += r.particleDirection * r.particleSpeed * cfg.speedMultiplier * speed * dt;
      if (p.x > 1.1) p.x = -0.1;
      else if (p.x < -0.1) p.x = 1.1;
      if (quality < 1 && index % 4 >= Math.ceil(quality * 4)) continue;
      const px = p.x * this.geo.width,
        y = this.geo.at(r, p.x) + p.yOffset;
      const twinkle =
        p.kind === 2
          ? 0.65 + 0.35 * Math.sin(t * 5 + p.phase)
          : p.kind === 1
            ? 0.7 + 0.12 * Math.sin(t * 1.2 + p.phase)
            : 0.8 + 0.2 * Math.sin(t * 3 + p.phase);
      const alpha = p.baseAlpha * twinkle * (p.kind === 1 ? 0.45 : 1) * activity;
      const radius = p.radius * p.sizeFactor * (p.kind === 2 ? 1.25 : 1);
      const glow = radius * this.fx.particleGlowRadius;
      if (
        px < -glow - 30 ||
        px > this.geo.width + glow + 30 ||
        y < -glow - 30 ||
        y > this.geo.height + glow + 30
      )
        continue;
      if (this.fx.particleTrails && this.fx.trailLength > 0) {
        const slope = this.geo.slope(r, p.x);
        const len = this.fx.trailLength * (p.kind === 2 ? 1.4 : 1) * speed;
        const norm = Math.hypot(1, slope);
        const sign = r.particleDirection;
        const tx = px - (sign * len) / norm,
          ty = y - (sign * len * slope) / norm;
        const grad = ctx.createLinearGradient(tx, ty, px, y);
        grad.addColorStop(0, this.colors.alpha(p.color, 0));
        grad.addColorStop(1, this.colors.alpha(p.color, alpha * 0.48));
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, y);
        ctx.lineWidth = Math.max(0.4, radius * 0.65);
        ctx.strokeStyle = grad;
        ctx.stroke();
      }
      if (this.fx.particleGlow && this.fx.particleGlowStrength > 0) {
        const s = this.sprite(p.color);
        if (s) {
          ctx.globalAlpha = clamp(alpha * this.fx.particleGlowStrength, 0, 1);
          ctx.drawImage(s, px - glow, y - glow, glow * 2, glow * 2);
          ctx.globalAlpha = 1;
        }
      }
      ctx.beginPath();
      ctx.arc(px, y, radius, 0, TAU);
      ctx.fillStyle = this.colors.alpha(p.color, alpha);
      ctx.fill();
    }
    ctx.globalAlpha = previousAlpha;
    ctx.globalCompositeOperation = previousComposite;
  }
  clear() {
    this.sprites.clear();
    this.colors.clear();
    this.particles = [];
  }
}
