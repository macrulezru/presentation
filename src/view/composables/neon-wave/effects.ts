import { Geometry } from './geometry';
import { Colors, clamp } from './utils';

import type { NeonWavesEffects } from './types';

interface Spark {
  x: number;
  y: number;
  alpha: number;
  color: string;
  age: number;
  key: string;
}

export class IntersectionEffects {
  private sparks: Spark[] = [];
  private last = -Infinity;
  private sprites = new Map<string, HTMLCanvasElement>();
  private colors = new Colors();
  constructor(
    private geo: Geometry,
    private fx: Required<NeonWavesEffects>,
  ) {}
  update(t: number, dt: number) {
    if (!this.fx.intersections) return;
    for (const s of this.sparks) {
      s.age += dt;
      s.alpha *= Math.exp(-dt * 3);
    }
    this.sparks = this.sparks.filter(s => s.alpha > 0.005 && s.age < 1.4);
    if (t - this.last < 0.1 || this.geo.width < 1) return;
    this.last = t;
    const next: Spark[] = [];
    const step = Math.max(10, Math.floor(this.geo.width / 48));
    const { ordered } = this.geo;
    for (let a = 0; a < ordered.length; a++)
      for (let b = a + 1; b < ordered.length; b++) {
        const ra = ordered[a]!,
          rb = ordered[b]!;
        if (ra.wave.zone !== rb.wave.zone) continue;
        let prev = this.geo.at(ra, 0) - this.geo.at(rb, 0);
        for (let px = step; px <= this.geo.width; px += step) {
          const x = Math.min(px / this.geo.width, 1);
          const diff = this.geo.at(ra, x) - this.geo.at(rb, x);
          if (prev * diff < 0 && next.length < 12) {
            const prevX = (px - step) / this.geo.width;
            const f = clamp(Math.abs(prev) / (Math.abs(prev) + Math.abs(diff)), 0, 1);
            const hit = prevX + (x - prevX) * f;
            const y = (this.geo.at(ra, hit) + this.geo.at(rb, hit)) / 2;
            const key = `${Math.min(ra.originalIndex, rb.originalIndex)}:${Math.max(ra.originalIndex, rb.originalIndex)}`;
            const old = this.fx.smoothIntersections
              ? this.sparks.find(
                  s => s.key === key && Math.abs(s.x - hit * this.geo.width) < 70,
                )
              : undefined;
            if (old) {
              old.x += (hit * this.geo.width - old.x) * 0.45;
              old.y += (y - old.y) * 0.45;
              old.alpha = Math.min(0.22, old.alpha + 0.04);
              old.age = 0;
              next.push(old);
            } else
              next.push({
                x: hit * this.geo.width,
                y,
                alpha: 0.12,
                color: this.geo.config.colors[ra.wave.color]?.core ?? '#a5c7ae',
                age: 0,
                key,
              });
          }
          prev = diff;
        }
      }
    if (this.fx.smoothIntersections) {
      for (const old of this.sparks)
        if (!next.includes(old) && next.length < 20) next.push(old);
    }
    this.sparks = next;
  }
  private sprite(color: string) {
    let s = this.sprites.get(color);
    if (s) return s;
    if (typeof document === 'undefined') return null;
    s = document.createElement('canvas');
    s.width = s.height = 48;
    const c = s.getContext('2d');
    if (!c) return null;
    const g = c.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, this.colors.alpha(color, 1));
    g.addColorStop(1, this.colors.alpha(color, 0));
    c.fillStyle = g;
    c.fillRect(0, 0, 48, 48);
    this.sprites.set(color, s);
    return s;
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.fx.intersections) return;
    const alpha = ctx.globalAlpha;
    for (const s of this.sparks) {
      const sprite = this.sprite(s.color);
      if (!sprite) continue;
      ctx.globalAlpha = clamp(s.alpha, 0, 1);
      ctx.drawImage(sprite, s.x - 17, s.y - 17, 34, 34);
    }
    ctx.globalAlpha = alpha;
  }
  reset() {
    this.sparks = [];
    this.sprites.clear();
    this.colors.clear();
    this.last = -Infinity;
  }
}

export function activityAt(t: number, fx: Required<NeonWavesEffects>) {
  return fx.activityCycles
    ? 1 +
        fx.activityStrength * (0.6 * Math.sin(t * 0.19) + 0.4 * Math.sin(t * 0.11 + 1.7))
    : 1;
}
