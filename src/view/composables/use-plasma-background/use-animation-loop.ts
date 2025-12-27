import * as THREE from 'three';
import { ref } from 'vue';

import { COLOR_CYCLE_DURATION } from './config';

import type {
  AnimationState,
  PlasmaConfig,
  CameraState,
  InputState,
  AnimationControls,
  ThreeSceneContext,
} from './types';

export function useAnimationLoop() {
  // Разделяем реактивные и нереактивные данные
  const animationTime = ref(0); // Только время, которое нужно отслеживать
  const colorCycleTime = ref(0);
  const isAnimationActive = ref(false);
  const animationFrameId = ref(0);

  // Не реактивные внутренние состояния
  const internalState = {
    time: 0,
    colorCycleTime: 0,
    lastColorUpdate: 0,
  };

  const updateColorCycle = (
    deltaTime: number,
    config: PlasmaConfig,
    plasmaField: THREE.Mesh | null,
  ) => {
    if (!config.enableColorCycle || !config.baseColors || config.baseColors.length === 0)
      return;

    internalState.colorCycleTime += deltaTime;
    colorCycleTime.value = internalState.colorCycleTime;

    const cycleProgress =
      (internalState.colorCycleTime % COLOR_CYCLE_DURATION) / COLOR_CYCLE_DURATION;

    const totalColors = config.baseColors.length;
    const progressPerColor = 1.0 / 4;

    for (let i = 0; i < 4; i++) {
      const targetProgress = (cycleProgress + i * progressPerColor) % 1.0;
      const colorIndex = Math.floor(targetProgress * (totalColors - 1));
      const nextIndex = (colorIndex + 1) % (totalColors - 1);
      const lerpFactor = (targetProgress * (totalColors - 1)) % 1.0;

      // Безопасный доступ к цветам
      const startColor = config.baseColors[colorIndex];
      const endColor = config.baseColors[nextIndex];

      if (!startColor || !endColor) {
        console.warn(`Color at index ${colorIndex} or ${nextIndex} is undefined`);
        continue;
      }

      // Создаем новый цвет, если currentColors[i] не существует
      let currentColor = config.currentColors[i];
      if (!currentColor) {
        currentColor = new THREE.Color();
        config.currentColors[i] = currentColor;
      }

      // Теперь можем безопасно использовать currentColor
      currentColor.copy(startColor).lerp(endColor, lerpFactor);
      currentColor.multiplyScalar(0.7);
    }

    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      // Безопасный доступ к uniform
      const { uniforms } = plasmaField.material;
      const color1 = uniforms.uColor1;
      const color2 = uniforms.uColor2;
      const color3 = uniforms.uColor3;
      const color4 = uniforms.uColor4;

      // Проверяем, что currentColors[i] существует
      if (color1 && config.currentColors[0]) {
        color1.value = config.currentColors[0];
      }
      if (color2 && config.currentColors[1]) {
        color2.value = config.currentColors[1];
      }
      if (color3 && config.currentColors[2]) {
        color3.value = config.currentColors[2];
      }
      if (color4 && config.currentColors[3]) {
        color4.value = config.currentColors[3];
      }
    }

    return cycleProgress;
  };

  const createAnimationLoop = (
    sceneContext: ThreeSceneContext,
    config: PlasmaConfig,
    cameraState: CameraState,
    inputState: InputState,
    deviceInfo: {
      isMobileDevice: boolean;
      isGyroAvailable: boolean;
      isCompassAvailable: boolean;
    },
    smoothGyroUpdate: () => void,
    smoothMouseUpdate: () => void,
    updateCameraForGyro: (camera: THREE.PerspectiveCamera) => void,
    updateCameraForMouse: (camera: THREE.PerspectiveCamera) => void,
    degradeQuality?: () => void,
  ): AnimationControls => {
    const { scene, camera, renderer, plasmaField, plasmaParticles, glowParticles } =
      sceneContext;

    let lastTimestamp = 0;
    const frameTimes: number[] = [];
    let qualityDegraded = false;

    const animate = (timestamp?: number) => {
      if (!isAnimationActive.value) return;

      animationFrameId.value = requestAnimationFrame(animate);

      if (!timestamp) timestamp = performance.now();
      const deltaTimeSeconds = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0.016;
      lastTimestamp = timestamp;

      internalState.time += deltaTimeSeconds;
      animationTime.value = internalState.time;

      // Обновление ввода
      if (deviceInfo.isMobileDevice && inputState.isGyroInitialized) {
        smoothGyroUpdate();
        updateCameraForGyro(camera);
      } else {
        smoothMouseUpdate();
        updateCameraForMouse(camera);
      }

      // Обновление цвета
      let cycleProgress = 0;
      if (internalState.time - internalState.lastColorUpdate > 0.08) {
        cycleProgress = updateColorCycle(deltaTimeSeconds, config, plasmaField) || 0;
        internalState.lastColorUpdate = internalState.time;
      }

      // Обновление uniforms для плазменного поля
      if (plasmaField?.material instanceof THREE.ShaderMaterial) {
        const { uniforms } = plasmaField.material;
        const timeUniform = uniforms.uTime;
        if (timeUniform) {
          timeUniform.value = internalState.time;
        }
      }

      // Обновление uniforms для частиц плазмы
      if (plasmaParticles?.material instanceof THREE.ShaderMaterial) {
        const { uniforms } = plasmaParticles.material;
        const timeUniform = uniforms.uTime;
        const progressUniform = uniforms.uCycleProgress;
        const colorsUniform = uniforms.uColors;

        if (timeUniform) {
          timeUniform.value = internalState.time;
        }
        if (progressUniform) {
          progressUniform.value = cycleProgress;
        }
        // Безопасный доступ к currentColors
        if (colorsUniform && config.currentColors && config.currentColors.length >= 4) {
          colorsUniform.value = config.currentColors;
        }
      }

      // Обновление uniforms для светящихся частиц
      if (glowParticles?.material instanceof THREE.ShaderMaterial) {
        const { uniforms } = glowParticles.material;
        const timeUniform = uniforms.uTime;
        const progressUniform = uniforms.uCycleProgress;

        if (timeUniform) {
          timeUniform.value = internalState.time;
        }
        if (progressUniform) {
          progressUniform.value = cycleProgress;
        }
      }

      // FPS monitoring and dynamic quality degradation
      frameTimes.push(deltaTimeSeconds);
      if (frameTimes.length > 120) frameTimes.shift();
      const total = frameTimes.reduce((s, v) => s + v, 0);
      const avgFps = total > 0 ? frameTimes.length / total : 60;

      if (!qualityDegraded && degradeQuality && avgFps < 30) {
        try {
          degradeQuality();
          qualityDegraded = true;
        } catch {
          // ignore
        }
      }

      // Анимация плазменного поля
      if (plasmaField) {
        // Адаптивная скорость для мобильных устройств
        const adaptiveSpeed = deviceInfo.isMobileDevice
          ? config.fieldSpeed * 0.8
          : config.fieldSpeed;

        plasmaField.rotation.y += 0.0002 * adaptiveSpeed;
        plasmaField.rotation.z += 0.0001 * adaptiveSpeed;

        if (config.enablePulse) {
          // Адаптивная амплитуда пульсации для мобильных
          const pulseAmplitude = deviceInfo.isMobileDevice ? 0.01 : 0.02;
          const pulse = Math.sin(internalState.time * 0.8) * pulseAmplitude + 1;
          plasmaField.scale.setScalar(pulse);
        }
      }

      // Автоматическое движение камеры
      if (
        config.enableCameraAutoMovement &&
        !config.enableMouseParallax &&
        !(deviceInfo.isMobileDevice && config.enableGyroParallax)
      ) {
        // Адаптивная амплитуда для мобильных устройств
        const adaptiveAmplitudeX = deviceInfo.isMobileDevice
          ? config.cameraAutoAmplitudeX * 0.6
          : config.cameraAutoAmplitudeX;
        const adaptiveAmplitudeY = deviceInfo.isMobileDevice
          ? config.cameraAutoAmplitudeY * 0.6
          : config.cameraAutoAmplitudeY;
        const adaptiveAmplitudeZ = deviceInfo.isMobileDevice
          ? config.cameraAutoAmplitudeZ * 0.6
          : config.cameraAutoAmplitudeZ;

        cameraState.basePosition.x =
          Math.sin(internalState.time * config.cameraAutoSpeedX) * adaptiveAmplitudeX;
        cameraState.basePosition.y =
          config.cameraAutoOffsetY +
          Math.cos(internalState.time * config.cameraAutoSpeedY) * adaptiveAmplitudeY;
        cameraState.basePosition.z =
          config.cameraAutoOffsetZ +
          Math.sin(internalState.time * config.cameraAutoSpeedZ) * adaptiveAmplitudeZ;
        cameraState.targetPosition.copy(cameraState.basePosition);
      }

      // Направление взгляда камеры
      if (!(deviceInfo.isMobileDevice && config.enableGyroParallax)) {
        // Адаптивная точка фокусировки для мобильных
        const lookAtY = deviceInfo.isMobileDevice ? -3 : -5;
        camera.lookAt(0, lookAtY, 0);
      }

      // Анимация света
      const pointLight = scene.getObjectByName('mainPointLight') as THREE.PointLight;
      if (pointLight && config.enablePulse) {
        // Адаптивная интенсивность для мобильных
        const intensityBase = deviceInfo.isMobileDevice ? 0.3 : 0.4;
        const intensityVariation = deviceInfo.isMobileDevice ? 0.05 : 0.08;

        pointLight.intensity =
          intensityBase + Math.sin(internalState.time * 0.6) * intensityVariation;

        // Адаптивная амплитуда движения света
        const lightAmplitudeX = deviceInfo.isMobileDevice ? 2 : 4;
        const lightAmplitudeY = deviceInfo.isMobileDevice ? 0.8 : 1.5;
        const lightAmplitudeZ = deviceInfo.isMobileDevice ? 2 : 4;

        pointLight.position.x = Math.sin(internalState.time * 0.04) * lightAmplitudeX;
        pointLight.position.y = 4 + Math.cos(internalState.time * 0.03) * lightAmplitudeY;
        pointLight.position.z = Math.cos(internalState.time * 0.035) * lightAmplitudeZ;
      }

      // Адаптивная анимация для частиц на мобильных устройствах
      if (deviceInfo.isMobileDevice) {
        // Медленнее вращение частиц на мобильных для экономии батареи
        if (plasmaParticles) {
          const rotationSpeed = 0.0001; // Уменьшенная скорость вращения
          plasmaParticles.rotation.y += rotationSpeed;
          plasmaParticles.rotation.x += rotationSpeed * 0.5;
        }

        if (glowParticles) {
          const glowRotationSpeed = 0.00005; // Еще более медленное вращение
          glowParticles.rotation.z += glowRotationSpeed;
        }
      }

      // Рендеринг сцены
      try {
        renderer.render(scene, camera);
      } catch (error) {
        console.error('Ошибка рендеринга:', error);
        stopAnimation();
      }
    };

    const startAnimation = () => {
      if (!isAnimationActive.value) {
        isAnimationActive.value = true;
        animate();
      }
    };

    const stopAnimation = () => {
      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value);
        animationFrameId.value = 0;
      }
      isAnimationActive.value = false;
    };

    return {
      startAnimation,
      stopAnimation,
      isActive: isAnimationActive,
    };
  };

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
  };
}
