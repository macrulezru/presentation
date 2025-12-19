import * as THREE from 'three'
import type { PlasmaConfig } from './types'

export const COLOR_CYCLE_DURATION = 30
export const MIN_BRIGHTNESS = 0.05
export const MAX_BRIGHTNESS = 0.3
export const PARALLAX_INTENSITY = 0.5
export const PARALLAX_SMOOTHING = 0.08
export const GYRO_INTENSITY = 0.015
export const GYRO_SMOOTHING = 0.05
export const GYRO_DEAD_ZONE = 0.02
export const MOUSE_PARALLAX_INTENSITY_X = 8.0
export const MOUSE_PARALLAX_INTENSITY_Y = 5
export const MOUSE_PARALLAX_INTENSITY_Z = 1.5

export const createDefaultConfig = (): PlasmaConfig => ({
  // Цветовая палитра
  baseColors: [
    new THREE.Color(0x000a99),
    new THREE.Color(0x0044aa),
    new THREE.Color(0x0088bb),
    new THREE.Color(0x00aa88),
    new THREE.Color(0x00bb44),
    new THREE.Color(0x88bb00),
    new THREE.Color(0xbb8800),
    new THREE.Color(0xbb4400),
    new THREE.Color(0xbb0044),
    new THREE.Color(0x8800bb),
    new THREE.Color(0x4400aa),
    new THREE.Color(0x000a99),
  ],
  currentColors: [],

  // Плазменное поле
  fieldSize: 120, // Размер плазменного поля в 3D пространстве
  fieldDetail: 200, // Количество полигонов для плазменного поля (детализация)
  fieldSpeed: 0.6, // Общая скорость анимации плазменного поля
  fieldAmplitude: 5.0, // Амплитуда волн плазменного поля

  // Основные частицы
  particleCount: 12000, // Количество основных частиц
  particleSize: 0.1, // Базовый размер частиц
  particleSpeed: 0.8, // Скорость движения частиц
  particleBrightness: 1.3, // Яркость основных частиц

  // Светящиеся частицы (глоу)
  glowParticleCount: 1000, // Количество светящихся частиц
  glowParticleSize: 0.2, // Размер светящихся частиц
  glowParticleSpeed: 0.5, // Скорость движения светящихся частиц
  glowParticleBrightness: 1.3, // Яркость светящихся частиц

  // Общие настройки освещения
  brightness: 0.225, // Общая яркость сцены (0-1)
  pulseIntensity: 0.1, // Интенсивность пульсации эффектов
  fogDensity: 0.02, // Плотность тумана (атмосферного рассеяния)

  // Флаги включения эффектов
  enableWaves: true, // Включить волновые эффекты на плазменном поле
  enablePulse: true, // Включить пульсацию эффектов
  enableFlow: true, // Включить плавное течение эффектов
  enableSwirl: true, // Включить закручивающие эффекты (вихри)
  enableColorCycle: true, // Включить циклическую смену цветов
  enableMouseParallax: true, // Включить параллакс от движения мыши
  enableGyroParallax: true, // Включить параллакс от гироскопа (на мобильных)
  enableCameraAutoMovement: true, // Включить автоматическое движение камеры

  // Автоматическое движение камеры
  cameraAutoSpeedX: 0.008, // Скорость автоматического движения камеры по оси X
  cameraAutoSpeedY: 0.006, // Скорость автоматического движения камеры по оси Y
  cameraAutoSpeedZ: 0.005, // Скорость автоматического движения камеры по оси Z
  cameraAutoAmplitudeX: 1.5, // Амплитуда (размах) движения камеры по оси X
  cameraAutoAmplitudeY: 0.5, // Амплитуда (размах) движения камеры по оси Y
  cameraAutoAmplitudeZ: 1.0, // Амплитуда (размах) движения камеры по оси Z
  cameraAutoOffsetY: 5.0, // Базовое смещение камеры по оси Y (высота)
  cameraAutoOffsetZ: 15.0, // Базовое смещение камеры по оси Z (глубина)

  // Интенсивность параллакса от мыши
  mouseParallaxIntensityX: MOUSE_PARALLAX_INTENSITY_X, // Интенсивность по оси X (8.0)
  mouseParallaxIntensityY: MOUSE_PARALLAX_INTENSITY_Y, // Интенсивность по оси Y (5.0)
  mouseParallaxIntensityZ: MOUSE_PARALLAX_INTENSITY_Z, // Интенсивность по оси Z (1.5)
})

export const initColors = (config: PlasmaConfig) => {
  if (!config.baseColors || config.baseColors.length === 0) {
    console.error('Base colors array is empty or undefined')
    config.currentColors = [
      new THREE.Color(0x000a99),
      new THREE.Color(0x0044aa),
      new THREE.Color(0x0088bb),
      new THREE.Color(0x00aa88),
    ]
    return
  }

  const getColor = (index: number): THREE.Color => {
    const safeIndex = index % config.baseColors.length

    const color = config.baseColors[safeIndex]
    if (!color) {
      console.warn(`Color at index ${safeIndex} is undefined, using default`)
      return new THREE.Color(0x000a99)
    }

    return color.clone()
  }

  config.currentColors = [getColor(0), getColor(3), getColor(6), getColor(9)]
}
