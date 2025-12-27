import type * as THREE from 'three';
import type { Ref } from 'vue';

export interface PlasmaConfig {
  baseColors: THREE.Color[];
  currentColors: (THREE.Color | undefined)[];

  // Десктоп параметры
  fieldSize: number;
  fieldDetail: number;

  // Мобильные параметры
  mobileFieldSize: number;
  mobileFieldDetail: number;

  fieldSpeed: number;
  fieldAmplitude: number;

  // Десктоп параметры частиц
  particleCount: number;
  glowParticleCount: number;

  // Мобильные параметры частиц
  mobileParticleCount: number;
  mobileGlowParticleCount: number;

  particleSize: number;
  particleSpeed: number;
  particleBrightness: number;
  glowParticleSize: number;
  glowParticleSpeed: number;
  glowParticleBrightness: number;

  brightness: number;
  pulseIntensity: number;
  fogDensity: number;

  enableWaves: boolean;
  enablePulse: boolean;
  enableFlow: boolean;
  enableSwirl: boolean;
  enableColorCycle: boolean;
  enableMouseParallax: boolean;
  enableGyroParallax: boolean;
  enableCameraAutoMovement: boolean;

  // Адаптивные параметры
  mobileParallaxIntensity: number;

  cameraAutoSpeedX: number;
  cameraAutoSpeedY: number;
  cameraAutoSpeedZ: number;
  cameraAutoAmplitudeX: number;
  cameraAutoAmplitudeY: number;
  cameraAutoAmplitudeZ: number;
  cameraAutoOffsetY: number;
  cameraAutoOffsetZ: number;

  mouseParallaxIntensityX: number;
  mouseParallaxIntensityY: number;
  mouseParallaxIntensityZ: number;
}

export interface InputState {
  mouseX: number;
  mouseY: number;
  normalizedMouseX: number;
  normalizedMouseY: number;
  targetMouseX: number;
  targetMouseY: number;
  deviceAlpha: number;
  deviceBeta: number;
  deviceGamma: number;
  targetDeviceAlpha: number;
  targetDeviceBeta: number;
  targetDeviceGamma: number;
  isGyroInitialized: boolean;
  isGyroEnabled: boolean;
}

export interface CameraState {
  basePosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  targetRotation: THREE.Euler;
  currentRotation: THREE.Euler;
}

export interface DeviceInfo {
  isMobile: boolean;
  hasGyro: boolean;
  hasCompass: boolean;
  isGyroEnabled: boolean;
}

export interface UsePlasmaBackgroundReturn {
  updateBrightness: (value: number) => void;
  updateParticleBrightness: (value: number) => void;
  updateSpeed: (value: number) => void;
  toggleMouseParallax: (enabled: boolean) => void;
  toggleGyroParallax: (enabled: boolean) => Promise<void>;
  startAnimation: () => void;
  stopAnimation: () => void;
  getDeviceInfo: () => DeviceInfo;
  isAnimationActive: Ref<boolean>;
  updateMouseParallaxIntensity: (x: number, y: number, z: number) => void;
  getMouseParallaxIntensity: () => { x: number; y: number; z: number };
  resetMouseParallaxIntensity: () => void;
  updateCameraAutoMovement: (speedX: number, speedY: number, speedZ: number) => void;
  updateCameraAutoAmplitude: (
    amplitudeX: number,
    amplitudeY: number,
    amplitudeZ: number,
  ) => void;
  updateCameraAutoOffset: (offsetY: number, offsetZ: number) => void;
  getCameraAutoMovement: () => {
    speedX: number;
    speedY: number;
    speedZ: number;
    amplitudeX: number;
    amplitudeY: number;
    amplitudeZ: number;
    offsetY: number;
    offsetZ: number;
    enabled: boolean;
  };
  toggleCameraAutoMovement: (enabled: boolean) => void;
}

export interface AnimationState {
  time: number;
  colorCycleTime: number;
  isActive: boolean;
  animationFrameId: number;
}

export interface AnimationControls {
  startAnimation: () => void;
  stopAnimation: () => void;
  isActive: Ref<boolean>;
}

export interface ThreeSceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  plasmaField: THREE.Mesh | null;
  plasmaParticles: THREE.Points | null;
  glowParticles: THREE.Points | null;
}

export interface StartStopAnimation {
  startAnimation: () => void;
  stopAnimation: () => void;
}
