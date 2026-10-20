import type { NeonWavesConfig } from './types';

export const TAU = Math.PI * 2;

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function cloneConfig(c: NeonWavesConfig): NeonWavesConfig {
  return {
    ...c,
    colors: c.colors.map(x => ({ ...x })),
    waves: c.waves.map(x => ({
      ...x,
      speedXRange: x.speedXRange ? ([...x.speedXRange] as [number, number]) : undefined,
      speedYRange: x.speedYRange ? ([...x.speedYRange] as [number, number]) : undefined,
    })),
    ribbonLayers: c.ribbonLayers.map(x => ({ ...x })),
    edgeLayers: c.edgeLayers.map(x => ({ ...x })),
    particles: { ...c.particles, colors: [...c.particles.colors] },
  };
}

export function withAlpha(color: string, alpha: number): string {
  const a = clamp(alpha, 0, 1);
  if (/^rgba\(/i.test(color))
    return color.replace(/,\s*(?:\d*\.)?\d+\s*\)\s*$/i, `, ${a})`);
  if (/^rgb\(/i.test(color))
    return color.replace(/^rgb\(/i, 'rgba(').replace(/\)\s*$/, `, ${a})`);
  if (/^#[\da-f]{6}$/i.test(color)) {
    const n = parseInt(color.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  if (/^#[\da-f]{3}$/i.test(color))
    return `rgba(${parseInt(color[1]!, 16) * 17}, ${parseInt(color[2]!, 16) * 17}, ${parseInt(color[3]!, 16) * 17}, ${a})`;
  return color;
}

export class Colors {
  private cache = new Map<string, string>();
  alpha(color: string, a: number): string {
    const key = `${color}|${Math.round(clamp(a, 0, 1) * 100)}`;
    let v = this.cache.get(key);
    if (!v) {
      v = withAlpha(color, Math.round(clamp(a, 0, 1) * 100) / 100);
      this.cache.set(key, v);
    }
    return v;
  }
  clear() {
    this.cache.clear();
  }
}
