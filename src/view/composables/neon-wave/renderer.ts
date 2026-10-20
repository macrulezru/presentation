import { Geometry, type WaveRuntime } from './geometry';
import { Colors, clamp } from './utils';

import type { NeonWavesEffects } from './types';

export class Renderer {
  private colors = new Colors();
  private fade: CanvasGradient | null = null;
  constructor(
    private ctx: CanvasRenderingContext2D,
    private geo: Geometry,
    private fx: Required<NeonWavesEffects>,
  ) {}
  invalidateColors() {
    this.colors.clear();
  }
  resize() {
    const { width } = this.geo;
    this.fade = null;
    const fadeWidth = this.geo.config.fadeEdgeWidth;
    if (width <= 0 || fadeWidth <= 0) return;
    const ratio = Math.min(fadeWidth, width / 2) / width;
    const g = this.ctx.createLinearGradient(0, 0, width, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(ratio, 'rgba(0,0,0,1)');
    g.addColorStop(1 - ratio, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    this.fade = g;
  }
  begin() {
    const c = this.ctx,
      g = this.geo;
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, g.width, g.height);
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = g.config.maxBrightness;
  }
  drawWave(r: WaveRuntime, t: number, activity: number) {
    const c = this.ctx,
      g = this.geo,
      w = r.wave,
      col = g.config.colors[w.color];
    if (!col) return;
    const { xs } = g,
      { ys } = r,
      { env } = g,
      n = xs.length - 1;
    let min = Infinity,
      max = -Infinity;
    for (let i = 0; i <= n; i++) {
      const y = ys[i]!;
      if (y < min) min = y;
      if (y > max) max = y;
    }
    const pulse = 1 + g.config.pulseAmp * Math.sin(t * g.config.pulseSpeed + w.phase);
    const half = w.thickness * pulse * r.compression * 0.5;
    const cTop = w.gradientDirection === 'top-down' ? col.top : col.bot;
    const cBot = w.gradientDirection === 'top-down' ? col.bot : col.top;
    for (let l = 0; l < g.config.ribbonLayers.length; l++) {
      const layer = g.config.ribbonLayers[l]!;
      const depth = this.fx.depth ? 1 + 0.045 * Math.sin(t * 0.23 + r.depthPhase + l) : 1;
      c.beginPath();
      for (let i = 0; i <= n; i++) {
        const x = i / n;
        const breath = this.fx.ribbonBreathing
          ? 1 +
            this.fx.breathingStrength *
              Math.sin(x * Math.PI * 3.1 - t * 0.31 + r.organicPhase + l * 0.4)
          : 1;
        const y = ys[i]! - half * layer.scale * depth * env[i]! * breath;
        if (i === 0) c.moveTo(xs[i]!, y);
        else c.lineTo(xs[i]!, y);
      }
      for (let i = n; i >= 0; i--) {
        const x = i / n;
        const breath = this.fx.ribbonBreathing
          ? 1 +
            this.fx.breathingStrength *
              Math.sin(x * Math.PI * 3.1 - t * 0.31 + r.organicPhase + l * 0.4)
          : 1;
        c.lineTo(xs[i]!, ys[i]! + half * layer.scale * depth * env[i]! * breath);
      }
      c.closePath();
      const grad = c.createLinearGradient(0, min - half, 0, max + half);
      grad.addColorStop(0, this.colors.alpha(cTop, layer.alpha));
      grad.addColorStop(0.5, this.colors.alpha(col.mid, layer.alpha * 0.9));
      grad.addColorStop(1, this.colors.alpha(cBot, layer.alpha * 0.1));
      c.fillStyle = grad;
      c.fill();
    }
    // One stroke per highlight, with continuous alpha gradient instead of one stroke per segment.
    if (this.fx.lightPulses && this.fx.pulseCount > 0) {
      for (let k = 0; k < this.fx.pulseCount; k++) {
        const center =
          (((t * this.fx.pulseSpeed * (w.zone === 'top' ? 1 : -1) +
            r.pulsePhase +
            k / this.fx.pulseCount) %
            1) +
            1) %
          1;
        const span = 0.075;
        const start = Math.max(0, center - span),
          end = Math.min(1, center + span);
        if (end <= start) continue;
        const from = Math.max(0, Math.floor(start * n)),
          to = Math.min(n, Math.ceil(end * n));
        if (to <= from) continue;
        const grad = c.createLinearGradient(start * g.width, 0, end * g.width, 0);
        const left = clamp((center - start) / (end - start), 0.00001, 0.99999);
        grad.addColorStop(0, this.colors.alpha(col.core, 0));
        grad.addColorStop(left, this.colors.alpha(col.core, 0.48 * activity));
        grad.addColorStop(1, this.colors.alpha(col.core, 0));
        c.beginPath();
        c.moveTo(xs[from]!, ys[from]!);
        for (let i = from + 1; i <= to; i++) c.lineTo(xs[i]!, ys[i]!);
        c.lineWidth = 2;
        c.strokeStyle = grad;
        c.stroke();
      }
    }
    for (const layer of g.config.edgeLayers) {
      const color = col[layer.colorKey];
      let open = false,
        currentWidth = -1,
        currentAlpha = -1;
      for (let i = 1; i <= n; i++) {
        const e = (env[i]! + env[i - 1]!) * 0.5;
        if (e < 0.01) {
          if (open) {
            c.stroke();
            open = false;
          }
          continue;
        }
        const lw = Math.max(0.5, layer.width * (0.3 + 0.7 * e) * r.compression);
        const qw = Math.max(0.5, Math.round(lw * 2) / 2),
          qa = Math.round(e * layer.alpha * 16) / 16;
        if (!open || qw !== currentWidth || qa !== currentAlpha) {
          if (open) c.stroke();
          c.beginPath();
          c.moveTo(xs[i - 1]!, ys[i - 1]!);
          c.lineWidth = qw;
          c.strokeStyle = this.colors.alpha(color, qa);
          currentWidth = qw;
          currentAlpha = qa;
          open = true;
        }
        c.lineTo(xs[i]!, ys[i]!);
      }
      if (open) c.stroke();
    }
  }
  finish() {
    const c = this.ctx;
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    if (this.fade) {
      c.globalCompositeOperation = 'destination-in';
      c.fillStyle = this.fade;
      c.fillRect(0, 0, this.geo.width, this.geo.height);
      c.globalCompositeOperation = 'source-over';
    }
  }
}
