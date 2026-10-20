import type { NeonWavesOptions } from './types';

export type QualityMode = NonNullable<NeonWavesOptions['performance']>;

export class PerformanceManager {
  readonly mode: QualityMode;
  quality = 1;
  fps: number;
  dpr: number;
  private average = 0;
  private samples = 0;
  private cooldown = 0;
  constructor(options: NeonWavesOptions) {
    this.mode = options.performance ?? 'high';
    const fps = options.fps ?? 60,
      dpr = options.maxDpr ?? 1.5;
    if (this.mode === 'low') {
      this.fps = Math.min(fps || 30, 30);
      this.dpr = Math.min(dpr, 1);
      this.quality = 0.5;
    } else if (this.mode === 'balanced') {
      this.fps = Math.min(fps || 45, 45);
      this.dpr = Math.min(dpr, 1.25);
      this.quality = 0.75;
    } else {
      this.fps = fps;
      this.dpr = dpr;
    }
  }
  observe(frameMs: number) {
    if (this.mode !== 'auto') return;
    // Measure actual render cost, not requestAnimationFrame scheduling delays.
    this.average = this.samples === 0 ? frameMs : this.average * 0.95 + frameMs * 0.05;
    this.samples++;
    this.cooldown++;
    if (this.samples < 120 || this.cooldown < 120) return;
    this.cooldown = 0;
    const budget = 1000 / (this.fps || 60);
    if (this.average > budget * 0.8 && this.quality > 0.5)
      this.quality = Math.max(0.5, this.quality - 0.125);
    else if (this.average < budget * 0.42 && this.quality < 1)
      this.quality = Math.min(1, this.quality + 0.125);
  }
  get particleQuality() {
    return this.quality;
  }
  get intersectionEnabled() {
    return this.quality > 0.55;
  }
}
