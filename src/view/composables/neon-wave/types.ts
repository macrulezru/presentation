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
  particleTrails?: boolean;
  trailLength?: number;
  ribbonBreathing?: boolean;
  breathingStrength?: number;
  smoothIntersections?: boolean;
  activityCycles?: boolean;
  activityStrength?: number;
}

export interface NeonWavesOptions {
  effects?: NeonWavesEffects;
  fps?: number; // 0 = частота монитора, по умолчанию 60
  pauseWhenHidden?: boolean;
  maxDpr?: number;
  performance?: 'auto' | 'high' | 'balanced' | 'low';
}
