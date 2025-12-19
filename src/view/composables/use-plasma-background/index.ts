import { onMounted, onUnmounted, type Ref } from 'vue'
import { useThreeScene } from './use-three-scene'
import { usePlasmaEffects } from './use-plasma-effects'
import { useParticles } from './use-particles'
import { useInputHandlers } from './use-input-handlers'
import { useAnimationLoop } from './use-animation-loop'
import { useVisibility } from './use-visibility'
import { useResponsive } from '@/view/composables/use-responsive'
import {
  PARALLAX_INTENSITY,
  GYRO_INTENSITY,
  GYRO_SMOOTHING,
  COLOR_CYCLE_DURATION,
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
  MOUSE_PARALLAX_INTENSITY_X,
  MOUSE_PARALLAX_INTENSITY_Y,
  MOUSE_PARALLAX_INTENSITY_Z,
} from './config'
import type { UsePlasmaBackgroundReturn } from './types'

export function usePlasmaBackground(
  containerRef: Ref<HTMLElement | undefined>,
): UsePlasmaBackgroundReturn {
  // Инициализация модулей
  const threeScene = useThreeScene(containerRef)
  const plasmaEffects = usePlasmaEffects()
  const particles = useParticles()
  const inputHandlers = useInputHandlers(containerRef)
  const animationLoop = useAnimationLoop()
  const visibility = useVisibility(containerRef)
  // Используем ваш существующий хук
  const responsive = useResponsive()

  let controls: any = null
  let sceneContext: any = null // Сохраняем ссылку на контекст сцены

  const init = async () => {
    // Инициализация Three.js сцены
    const sceneResult = await threeScene.init()
    if (!sceneResult) return

    const {
      sceneContext: ctx,
      config,
      cameraState,
      deviceInfo,
      cleanup: sceneCleanup,
    } = sceneResult

    sceneContext = ctx // Сохраняем для доступа из методов

    // Определяем тип устройства с учетом размера экрана
    // Если пользователь на десктопном браузере, но с мобильного разрешения,
    // считаем это мобильным режимом для оптимизации
    const isMobileSize = responsive.isMobile.value
    const isMobileDevice = deviceInfo.isMobileDevice || isMobileSize

    // Создание эффектов с учетом типа устройства
    const plasmaField = plasmaEffects.createPlasmaField(config, isMobileDevice)
    const plasmaParticles = particles.createPlasmaParticles(config, isMobileDevice)
    const glowParticles = particles.createGlowParticles(config, isMobileDevice)

    // Добавление объектов в сцену
    sceneContext.scene.add(plasmaField)
    sceneContext.scene.add(plasmaParticles)
    sceneContext.scene.add(glowParticles)

    sceneContext.plasmaField = plasmaField
    sceneContext.plasmaParticles = plasmaParticles
    sceneContext.glowParticles = glowParticles

    // Настройка обработчиков ввода для мыши (только на десктопе)
    if (!isMobileDevice) {
      inputHandlers.setupMouseHandlers(config, isMobileDevice)
    }

    // Создание цикла анимации
    const { startAnimation, stopAnimation, isActive } = animationLoop.createAnimationLoop(
      sceneContext, // Обычный объект
      config, // Обычный объект
      cameraState, // Обычный объект
      inputHandlers.inputState, // Используем inputState из inputHandlers
      // Передаем обновленный deviceInfo с учетом размера экрана
      {
        ...deviceInfo,
        isMobileDevice: isMobileDevice,
      },
      inputHandlers.smoothGyroUpdate,
      inputHandlers.smoothMouseUpdate,
      camera =>
        inputHandlers.updateCameraForGyro(
          camera,
          config,
          isMobileDevice,
          cameraState,
          GYRO_INTENSITY,
          GYRO_SMOOTHING,
        ),
      camera => {
        // Используем адаптивную интенсивность параллакса
        // Для мобильных размеров уменьшаем интенсивность даже на десктопном устройстве
        const adaptiveParallaxIntensity = isMobileDevice
          ? config.mobileParallaxIntensity || PARALLAX_INTENSITY * 0.3
          : PARALLAX_INTENSITY

        inputHandlers.updateCameraForMouse(
          camera,
          config,
          isMobileDevice,
          cameraState,
          adaptiveParallaxIntensity,
        )
      },
    )

    // Инициализация наблюдения за видимостью
    visibility.initIntersectionObserver(startAnimation, stopAnimation)

    // Задержка перед началом анимации
    setTimeout(() => {
      if (visibility.isElementInViewport()) {
        startAnimation()
      }
    }, 150)

    // Создание публичного API
    controls = {
      cleanup: () => {
        sceneCleanup()
        inputHandlers.cleanup()
        visibility.cleanup()
        stopAnimation()
      },
      updateBrightness: (value: number) => {
        plasmaEffects.updateBrightness(config, plasmaField, value)
      },
      updateParticleBrightness: (value: number) => {
        particles.updateParticleBrightness(config, plasmaParticles, glowParticles, value)
      },
      updateSpeed: (value: number) => {
        config.fieldSpeed = value * 0.6
        config.particleSpeed = value * 0.8
        config.glowParticleSpeed = value * 0.5
      },
      toggleMouseParallax: (enabled: boolean) => {
        config.enableMouseParallax = enabled
        if (!enabled && sceneContext && sceneContext.camera) {
          // Сбрасываем позицию камеры к базовой
          cameraState.targetPosition.copy(cameraState.basePosition)
          sceneContext.camera.position.copy(cameraState.basePosition)
        }
      },
      toggleGyroParallax: async (enabled: boolean) => {
        config.enableGyroParallax = enabled
        if (enabled && isMobileDevice && !inputHandlers.inputState.isGyroInitialized) {
          await inputHandlers.initGyroscope(config)
        }
        if (!enabled && isMobileDevice && sceneContext && sceneContext.camera) {
          cameraState.targetRotation.set(0, 0, 0, 'YXZ')
          cameraState.currentRotation.set(0, 0, 0, 'YXZ')
          sceneContext.camera.rotation.set(0, 0, 0, 'YXZ')
        }
      },
      startAnimation,
      stopAnimation,
      getDeviceInfo: () => ({
        isMobile: isMobileDevice,
        hasGyro: deviceInfo.isGyroAvailable,
        hasCompass: deviceInfo.isCompassAvailable,
        isGyroEnabled:
          config.enableGyroParallax && inputHandlers.inputState.isGyroInitialized,
      }),
      getConfig: () => ({
        ...config,
        colorCycleDuration: COLOR_CYCLE_DURATION,
        minBrightness: MIN_BRIGHTNESS,
        maxBrightness: MAX_BRIGHTNESS,
        parallaxIntensity: PARALLAX_INTENSITY,
        gyroIntensity: GYRO_INTENSITY,
        mobileParallaxIntensity: config.mobileParallaxIntensity,
      }),
      updateMouseParallaxIntensity: (x: number, y: number, z: number) => {
        config.mouseParallaxIntensityX = x
        config.mouseParallaxIntensityY = y
        config.mouseParallaxIntensityZ = z
      },

      getMouseParallaxIntensity: () => ({
        x: config.mouseParallaxIntensityX,
        y: config.mouseParallaxIntensityY,
        z: config.mouseParallaxIntensityZ,
      }),

      resetMouseParallaxIntensity: () => {
        config.mouseParallaxIntensityX = MOUSE_PARALLAX_INTENSITY_X
        config.mouseParallaxIntensityY = MOUSE_PARALLAX_INTENSITY_Y
        config.mouseParallaxIntensityZ = MOUSE_PARALLAX_INTENSITY_Z
      },

      updateCameraAutoMovement: (speedX: number, speedY: number, speedZ: number) => {
        config.cameraAutoSpeedX = speedX
        config.cameraAutoSpeedY = speedY
        config.cameraAutoSpeedZ = speedZ
      },

      updateCameraAutoAmplitude: (
        amplitudeX: number,
        amplitudeY: number,
        amplitudeZ: number,
      ) => {
        config.cameraAutoAmplitudeX = amplitudeX
        config.cameraAutoAmplitudeY = amplitudeY
        config.cameraAutoAmplitudeZ = amplitudeZ
      },

      updateCameraAutoOffset: (offsetY: number, offsetZ: number) => {
        config.cameraAutoOffsetY = offsetY
        config.cameraAutoOffsetZ = offsetZ
      },

      getCameraAutoMovement: () => ({
        speedX: config.cameraAutoSpeedX,
        speedY: config.cameraAutoSpeedY,
        speedZ: config.cameraAutoSpeedZ,
        amplitudeX: config.cameraAutoAmplitudeX,
        amplitudeY: config.cameraAutoAmplitudeY,
        amplitudeZ: config.cameraAutoAmplitudeZ,
        offsetY: config.cameraAutoOffsetY,
        offsetZ: config.cameraAutoOffsetZ,
        enabled: config.enableCameraAutoMovement,
      }),

      toggleCameraAutoMovement: (enabled: boolean) => {
        config.enableCameraAutoMovement = enabled
        if (!enabled && sceneContext && sceneContext.camera) {
          // Сбрасываем позицию камеры к базовой
          cameraState.basePosition.set(0, 5, 15)
          cameraState.targetPosition.copy(cameraState.basePosition)
          sceneContext.camera.position.copy(cameraState.basePosition)
        }
      },
    }

    return {
      controls,
      startAnimation,
      stopAnimation,
      isAnimationActive: isActive,
    }
  }

  onMounted(async () => {
    controls = await init()
  })

  onUnmounted(() => {
    if (controls) {
      controls.cleanup()
    }
  })

  return {
    updateBrightness: (value: number) => controls?.updateBrightness(value),
    updateParticleBrightness: (value: number) =>
      controls?.updateParticleBrightness(value),
    updateSpeed: (value: number) => controls?.updateSpeed(value),
    toggleMouseParallax: (enabled: boolean) => controls?.toggleMouseParallax(enabled),
    toggleGyroParallax: async (enabled: boolean) => {
      if (controls) await controls.toggleGyroParallax(enabled)
    },
    startAnimation: () => controls?.startAnimation(),
    stopAnimation: () => controls?.stopAnimation(),
    getDeviceInfo: () =>
      controls?.getDeviceInfo() || {
        isMobile: false,
        hasGyro: false,
        hasCompass: false,
        isGyroEnabled: false,
      },

    updateMouseParallaxIntensity: (x: number, y: number, z: number) =>
      controls?.updateMouseParallaxIntensity(x, y, z),

    getMouseParallaxIntensity: () =>
      controls?.getMouseParallaxIntensity() || {
        x: MOUSE_PARALLAX_INTENSITY_X,
        y: MOUSE_PARALLAX_INTENSITY_Y,
        z: MOUSE_PARALLAX_INTENSITY_Z,
      },

    resetMouseParallaxIntensity: () => controls?.resetMouseParallaxIntensity(),
    isAnimationActive: animationLoop.isAnimationActive,

    updateCameraAutoMovement: (speedX: number, speedY: number, speedZ: number) =>
      controls?.updateCameraAutoMovement(speedX, speedY, speedZ),

    updateCameraAutoAmplitude: (
      amplitudeX: number,
      amplitudeY: number,
      amplitudeZ: number,
    ) => controls?.updateCameraAutoAmplitude(amplitudeX, amplitudeY, amplitudeZ),

    updateCameraAutoOffset: (offsetY: number, offsetZ: number) =>
      controls?.updateCameraAutoOffset(offsetY, offsetZ),

    getCameraAutoMovement: () =>
      controls?.getCameraAutoMovement() || {
        speedX: 0.008,
        speedY: 0.006,
        speedZ: 0.005,
        amplitudeX: 1.5,
        amplitudeY: 0.5,
        amplitudeZ: 1.0,
        offsetY: 5.0,
        offsetZ: 15.0,
        enabled: true,
      },

    toggleCameraAutoMovement: (enabled: boolean) =>
      controls?.toggleCameraAutoMovement(enabled),
  }
}
