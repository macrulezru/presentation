import { type Ref } from 'vue'
import * as THREE from 'three'
import type { InputState, CameraState, PlasmaConfig } from './types'
import {
  PARALLAX_SMOOTHING,
  GYRO_SMOOTHING,
  GYRO_DEAD_ZONE,
  PARALLAX_INTENSITY,
} from './config'

export function useInputHandlers(containerRef: Ref<HTMLElement | undefined>) {
  const inputState: InputState = {
    mouseX: 0,
    mouseY: 0,
    normalizedMouseX: 0,
    normalizedMouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    deviceAlpha: 0,
    deviceBeta: 0,
    deviceGamma: 0,
    targetDeviceAlpha: 0,
    targetDeviceBeta: 0,
    targetDeviceGamma: 0,
    isGyroInitialized: false,
    isGyroEnabled: false,
  }

  // Добавьте состояние для хранения обработчика
  let mouseMoveHandler: ((event: MouseEvent) => void) | null = null
  let gyroHandler: ((event: DeviceOrientationEvent) => void) | null = null

  const requestGyroPermission = async (): Promise<boolean> => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        return permission === 'granted'
      } catch {
        return false
      }
    }
    return true
  }

  const initGyroscope = async (config: PlasmaConfig): Promise<boolean> => {
    if (!config.enableGyroParallax) return false

    const hasPermission = await requestGyroPermission()
    if (!hasPermission) {
      config.enableGyroParallax = false
      return false
    }

    gyroHandler = (event: DeviceOrientationEvent) => {
      if (!inputState.isGyroEnabled || !config.enableGyroParallax) return

      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        inputState.targetDeviceAlpha = event.alpha || 0
        inputState.targetDeviceBeta = event.beta - 30 || 0
        inputState.targetDeviceGamma = event.gamma / 5 || 0

        if (inputState.targetDeviceBeta > 90) inputState.targetDeviceBeta = 90
        if (inputState.targetDeviceBeta < -90) inputState.targetDeviceBeta = -90
        if (inputState.targetDeviceGamma > 90) inputState.targetDeviceGamma = 90
        if (inputState.targetDeviceGamma < -90) inputState.targetDeviceGamma = -90
      }
    }

    window.addEventListener('deviceorientation', gyroHandler)
    inputState.isGyroInitialized = true
    inputState.isGyroEnabled = true

    return true
  }

  const updateMousePosition = (
    event: MouseEvent,
    config: PlasmaConfig,
    isMobileDevice: boolean,
  ) => {
    if (!containerRef.value || !config.enableMouseParallax || isMobileDevice) return

    const rect = containerRef.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    inputState.targetMouseX = (mouseX / rect.width) * 2 - 1
    inputState.targetMouseY = -(mouseY / rect.height) * 2 + 1
  }

  const smoothGyroUpdate = () => {
    const state = inputState

    state.deviceAlpha += (state.targetDeviceAlpha - state.deviceAlpha) * GYRO_SMOOTHING
    state.deviceBeta += (state.targetDeviceBeta - state.deviceBeta) * GYRO_SMOOTHING
    state.deviceGamma += (state.targetDeviceGamma - state.deviceGamma) * GYRO_SMOOTHING

    if (Math.abs(state.deviceBeta) < GYRO_DEAD_ZONE) state.deviceBeta = 0
    if (Math.abs(state.deviceGamma) < GYRO_DEAD_ZONE) state.deviceGamma = 0
    if (Math.abs(state.deviceAlpha) < GYRO_DEAD_ZONE * 10) state.deviceAlpha = 0
  }

  const smoothMouseUpdate = () => {
    const state = inputState
    state.normalizedMouseX +=
      (state.targetMouseX - state.normalizedMouseX) * PARALLAX_SMOOTHING
    state.normalizedMouseY +=
      (state.targetMouseY - state.normalizedMouseY) * PARALLAX_SMOOTHING
  }

  const updateCameraForMouse = (
    camera: THREE.PerspectiveCamera,
    config: PlasmaConfig,
    isMobileDevice: boolean,
    cameraState: CameraState,
    intensity: number = PARALLAX_INTENSITY,
  ) => {
    const state = inputState
    if (!config.enableMouseParallax || isMobileDevice) return

    // Используем индивидуальные коэффициенты из конфига
    const offsetX = state.normalizedMouseX * intensity * config.mouseParallaxIntensityX
    const offsetY = state.normalizedMouseY * intensity * config.mouseParallaxIntensityY
    const offsetZ =
      Math.abs(state.normalizedMouseX) * intensity * config.mouseParallaxIntensityZ

    cameraState.targetPosition.x = cameraState.basePosition.x + offsetX
    cameraState.targetPosition.y = cameraState.basePosition.y + offsetY
    cameraState.targetPosition.z = cameraState.basePosition.z + offsetZ

    // Плавное перемещение камеры
    camera.position.x +=
      (cameraState.targetPosition.x - camera.position.x) * PARALLAX_SMOOTHING
    camera.position.y +=
      (cameraState.targetPosition.y - camera.position.y) * PARALLAX_SMOOTHING
    camera.position.z +=
      (cameraState.targetPosition.z - camera.position.z) * PARALLAX_SMOOTHING
  }

  const updateCameraForGyro = (
    camera: THREE.PerspectiveCamera,
    config: PlasmaConfig,
    isMobileDevice: boolean,
    cameraState: CameraState,
    GYRO_INTENSITY: number = 0.015,
    GYRO_SMOOTHING: number = 0.05,
  ) => {
    const state = inputState

    if (!state.isGyroInitialized || !config.enableGyroParallax || !isMobileDevice) return
    const targetRotationY = -state.deviceGamma * GYRO_INTENSITY * 2
    const targetRotationX = -state.deviceBeta * GYRO_INTENSITY
    const targetRotationZ = -state.deviceAlpha * GYRO_INTENSITY * 0.1

    cameraState.targetRotation.set(
      targetRotationX,
      targetRotationY,
      targetRotationZ,
      'YXZ',
    )

    cameraState.currentRotation.x +=
      (cameraState.targetRotation.x - cameraState.currentRotation.x) * GYRO_SMOOTHING
    cameraState.currentRotation.y +=
      (cameraState.targetRotation.y - cameraState.currentRotation.y) * GYRO_SMOOTHING
    cameraState.currentRotation.z +=
      (cameraState.targetRotation.z - cameraState.currentRotation.z) * GYRO_SMOOTHING

    camera.rotation.copy(cameraState.currentRotation)
  }

  const setupMouseHandlers = (config: PlasmaConfig, isMobileDevice: boolean) => {
    if (isMobileDevice || mouseMoveHandler) return

    mouseMoveHandler = (event: MouseEvent) => {
      updateMousePosition(event, config, isMobileDevice)
    }

    containerRef.value?.addEventListener('mousemove', mouseMoveHandler)
  }

  const cleanup = () => {
    // Удаляем обработчик мыши
    if (mouseMoveHandler && containerRef.value) {
      containerRef.value.removeEventListener('mousemove', mouseMoveHandler)
      mouseMoveHandler = null
    }

    // Удаляем обработчик гироскопа
    if (gyroHandler) {
      window.removeEventListener('deviceorientation', gyroHandler)
      gyroHandler = null
      inputState.isGyroInitialized = false
      inputState.isGyroEnabled = false
    }
  }

  return {
    inputState,
    initGyroscope,
    updateMousePosition,
    smoothGyroUpdate,
    smoothMouseUpdate,
    updateCameraForMouse,
    updateCameraForGyro,
    setupMouseHandlers,
    cleanup,
  }
}
