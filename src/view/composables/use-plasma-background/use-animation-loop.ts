import { ref } from 'vue'
import * as THREE from 'three'
import { COLOR_CYCLE_DURATION } from './config'
import type {
  AnimationState,
  PlasmaConfig,
  CameraState,
  InputState,
  AnimationControls,
  ThreeSceneContext,
} from './types'

export function useAnimationLoop() {
  // Разделяем реактивные и нереактивные данные
  const animationTime = ref(0) // Только время, которое нужно отслеживать
  const colorCycleTime = ref(0)
  const isAnimationActive = ref(false)
  const animationFrameId = ref(0)

  // Не реактивные внутренние состояния
  const internalState = {
    time: 0,
    colorCycleTime: 0,
  }

  const updateColorCycle = (
    deltaTime: number,
    config: PlasmaConfig,
    plasmaField: THREE.Mesh | null,
  ) => {
    if (!config.enableColorCycle || !config.baseColors || config.baseColors.length === 0)
      return

    internalState.colorCycleTime += deltaTime
    colorCycleTime.value = internalState.colorCycleTime

    const cycleProgress =
      (internalState.colorCycleTime % COLOR_CYCLE_DURATION) / COLOR_CYCLE_DURATION

    const totalColors = config.baseColors.length
    const progressPerColor = 1.0 / 4

    for (let i = 0; i < 4; i++) {
      const targetProgress = (cycleProgress + i * progressPerColor) % 1.0
      const colorIndex = Math.floor(targetProgress * (totalColors - 1))
      const nextIndex = (colorIndex + 1) % (totalColors - 1)
      const lerpFactor = (targetProgress * (totalColors - 1)) % 1.0

      // Безопасный доступ к цветам
      const startColor = config.baseColors[colorIndex]
      const endColor = config.baseColors[nextIndex]

      if (!startColor || !endColor) {
        console.warn(`Color at index ${colorIndex} or ${nextIndex} is undefined`)
        continue
      }

      // Создаем новый цвет, если currentColors[i] не существует
      let currentColor = config.currentColors[i]
      if (!currentColor) {
        currentColor = new THREE.Color()
        config.currentColors[i] = currentColor
      }

      // Теперь можем безопасно использовать currentColor
      currentColor.copy(startColor).lerp(endColor, lerpFactor)
      currentColor.multiplyScalar(0.7)
    }

    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      // Безопасный доступ к uniform
      const uniforms = plasmaField.material.uniforms
      const color1 = uniforms.uColor1
      const color2 = uniforms.uColor2
      const color3 = uniforms.uColor3
      const color4 = uniforms.uColor4

      // Проверяем, что currentColors[i] существует
      if (color1 && config.currentColors[0]) {
        color1.value = config.currentColors[0]
      }
      if (color2 && config.currentColors[1]) {
        color2.value = config.currentColors[1]
      }
      if (color3 && config.currentColors[2]) {
        color3.value = config.currentColors[2]
      }
      if (color4 && config.currentColors[3]) {
        color4.value = config.currentColors[3]
      }
    }

    return cycleProgress
  }

  const createAnimationLoop = (
    sceneContext: ThreeSceneContext,
    config: PlasmaConfig,
    cameraState: CameraState,
    inputState: InputState,
    deviceInfo: {
      isMobileDevice: boolean
      isGyroAvailable: boolean
      isCompassAvailable: boolean
    },
    smoothGyroUpdate: () => void,
    smoothMouseUpdate: () => void,
    updateCameraForGyro: (camera: THREE.PerspectiveCamera) => void,
    updateCameraForMouse: (camera: THREE.PerspectiveCamera) => void,
  ): AnimationControls => {
    const { scene, camera, renderer, plasmaField, plasmaParticles, glowParticles } =
      sceneContext

    const animate = () => {
      if (!isAnimationActive.value) return

      animationFrameId.value = requestAnimationFrame(animate)

      const deltaTime = 16
      const deltaTimeSeconds = deltaTime * 0.001

      internalState.time += deltaTimeSeconds
      animationTime.value = internalState.time

      // Обновление ввода
      if (deviceInfo.isMobileDevice && inputState.isGyroInitialized) {
        smoothGyroUpdate()
        updateCameraForGyro(camera)
      } else {
        smoothMouseUpdate()
        updateCameraForMouse(camera)
      }

      // Обновление цвета
      const cycleProgress = updateColorCycle(deltaTimeSeconds, config, plasmaField)

      // Обновление uniforms для плазменного поля
      if (plasmaField?.material instanceof THREE.ShaderMaterial) {
        const uniforms = plasmaField.material.uniforms
        const timeUniform = uniforms.uTime
        if (timeUniform) {
          timeUniform.value = internalState.time
        }
      }

      // Обновление uniforms для частиц плазмы
      if (plasmaParticles?.material instanceof THREE.ShaderMaterial) {
        const uniforms = plasmaParticles.material.uniforms
        const timeUniform = uniforms.uTime
        const progressUniform = uniforms.uCycleProgress
        const colorsUniform = uniforms.uColors

        if (timeUniform) {
          timeUniform.value = internalState.time
        }
        if (progressUniform) {
          progressUniform.value = cycleProgress
        }
        // Безопасный доступ к currentColors
        if (colorsUniform && config.currentColors && config.currentColors.length >= 4) {
          colorsUniform.value = config.currentColors
        }
      }

      // Обновление uniforms для светящихся частиц
      if (glowParticles?.material instanceof THREE.ShaderMaterial) {
        const uniforms = glowParticles.material.uniforms
        const timeUniform = uniforms.uTime
        const progressUniform = uniforms.uCycleProgress

        if (timeUniform) {
          timeUniform.value = internalState.time
        }
        if (progressUniform) {
          progressUniform.value = cycleProgress
        }
      }

      // Анимация плазменного поля
      if (plasmaField) {
        plasmaField.rotation.y += 0.0002 * config.fieldSpeed
        plasmaField.rotation.z += 0.0001 * config.fieldSpeed

        if (config.enablePulse) {
          const pulse = Math.sin(internalState.time * 0.8) * 0.02 + 1
          plasmaField.scale.setScalar(pulse)
        }
      }

      // Автоматическое движение камеры
      if (
        config.enableCameraAutoMovement &&
        !config.enableMouseParallax &&
        !(deviceInfo.isMobileDevice && config.enableGyroParallax)
      ) {
        cameraState.basePosition.x =
          Math.sin(internalState.time * config.cameraAutoSpeedX) *
          config.cameraAutoAmplitudeX
        cameraState.basePosition.y =
          config.cameraAutoOffsetY +
          Math.cos(internalState.time * config.cameraAutoSpeedY) *
            config.cameraAutoAmplitudeY
        cameraState.basePosition.z =
          config.cameraAutoOffsetZ +
          Math.sin(internalState.time * config.cameraAutoSpeedZ) *
            config.cameraAutoAmplitudeZ
        cameraState.targetPosition.copy(cameraState.basePosition)
      }

      // Направление взгляда камеры
      if (!(deviceInfo.isMobileDevice && config.enableGyroParallax)) {
        camera.lookAt(0, -5, 0)
      }

      // Анимация света
      const pointLight = scene.getObjectByName('mainPointLight') as THREE.PointLight
      if (pointLight && config.enablePulse) {
        pointLight.intensity = 0.4 + Math.sin(internalState.time * 0.6) * 0.08
        pointLight.position.x = Math.sin(internalState.time * 0.04) * 4
        pointLight.position.y = 4 + Math.cos(internalState.time * 0.03) * 1.5
        pointLight.position.z = Math.cos(internalState.time * 0.035) * 4
      }

      // Рендеринг сцены
      try {
        renderer.render(scene, camera)
      } catch (error) {
        console.error('Ошибка рендеринга:', error)
        stopAnimation()
      }
    }

    const startAnimation = () => {
      if (!isAnimationActive.value) {
        isAnimationActive.value = true
        animate()
      }
    }

    const stopAnimation = () => {
      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value)
        animationFrameId.value = 0
      }
      isAnimationActive.value = false
    }

    return {
      startAnimation,
      stopAnimation,
      isActive: isAnimationActive,
    }
  }

  // Возвращаем публичное API
  return {
    animationTime,
    colorCycleTime,
    isAnimationActive,
    createAnimationLoop,

    // Вспомогательные методы для отладки
    getAnimationState: (): AnimationState => ({
      time: internalState.time,
      colorCycleTime: internalState.colorCycleTime,
      isActive: isAnimationActive.value,
      animationFrameId: animationFrameId.value,
    }),
  }
}
