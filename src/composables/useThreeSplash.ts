// @ts-nocheck
import * as THREE from 'three'
import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Vue Composition API хук для создания интерактивного плазменного фона с использованием Three.js
 * Создает анимированную сцену с плазменными волнами, частицами и эффектом параллакса
 * Автоматически определяет тип устройства: на компьютерах - параллакс от мыши, на мобильных с гироскопом - от гироскопа
 *
 * @param containerRef - Vue ref, ссылающийся на HTML-элемент контейнера, в который будет рендериться сцена
 * @returns Объект с методами управления анимацией и настройками
 */
export function usePlasmaBackground(containerRef: Ref<HTMLElement | undefined>) {
  // ============ ОСНОВНЫЕ ПЕРЕМЕННЫЕ THREE.JS ============
  let scene: THREE.Scene // Трехмерная сцена, содержащая все объекты
  let camera: THREE.PerspectiveCamera // Камера с перспективной проекцией
  let renderer: THREE.WebGLRenderer // Рендерер для отрисовки сцены через WebGL
  let animationFrameId: number // Идентификатор кадра анимации

  // ============ ПЕРЕМЕННЫЕ ВРЕМЕНИ И СОСТОЯНИЯ ============
  let time = 0 // Общее время анимации в секундах
  let isAnimationActive = false // Флаг активности анимации
  let colorCycleTime = 0 // Время для циклической смены цветов

  // ============ ПЕРЕМЕННЫЕ ДЛЯ ОПРЕДЕЛЕНИЯ УСТРОЙСТВА ============
  let isMobileDevice = false // Флаг мобильного устройства
  let hasGyroscope = false // Флаг наличия гироскопа
  let isGyroActive = false // Флаг активности гироскопа
  let gyroPermissionRequested = false // Флаг запроса разрешения (iOS)

  // ============ ПЕРЕМЕННЫЕ ДЛЯ ВЗАИМОДЕЙСТВИЯ С МЫШЬЮ ============
  let mouseX = 0 // Абсолютная X-координата курсора
  let mouseY = 0 // Абсолютная Y-координата курсора
  let normalizedMouseX = 0 // Нормализованная X-координата (-1 до 1)
  let normalizedMouseY = 0 // Нормализованная Y-координата (-1 до 1)
  let targetMouseX = 0 // Целевая X-координата для интерполяции
  let targetMouseY = 0 // Целевая Y-координата для интерполяции
  let hasMouseMoved = false // Флаг движения мыши (для активации параллакса)

  // ============ ПЕРЕМЕННЫЕ ДЛЯ ГИРОСКОПА ============
  let deviceAlpha = 0 // Поворот вокруг Z
  let deviceBeta = 0 // Наклон вперед/назад
  let deviceGamma = 0 // Наклон влево/вправо
  let targetAlpha = 0 // Целевое значение alpha
  let targetBeta = 0 // Целевое значение beta
  let targetGamma = 0 // Целевое значение gamma

  // ============ НАСТРОЙКИ ПАРАЛЛАКСА ============
  const PARALLAX_INTENSITY = 0.8 // Общая интенсивность эффекта
  const PARALLAX_INTENSITY_MOBILE = 2 // Общая интенсивность эффекта
  const PARALLAX_SMOOTHING = 0.08 // Коэффициент сглаживания

  // Коэффициенты для разных осей (мышь)
  const MOUSE_X_MULTIPLIER = 8
  const MOUSE_Y_MULTIPLIER = 4
  const MOUSE_Z_MULTIPLIER = 2

  // Коэффициенты для гироскопа
  const GYRO_X_MULTIPLIER = 6
  const GYRO_Y_MULTIPLIER = 3
  const GYRO_Z_MULTIPLIER = 2
  const GYRO_ROTATION_MULTIPLIER = 0.5 // Множитель для вращения камеры

  // ============ ПОЗИЦИИ И ВРАЩЕНИЯ КАМЕРЫ ============
  let cameraBasePosition = new THREE.Vector3(0, 5, 15) // Базовая позиция камеры
  let cameraTargetPosition = new THREE.Vector3(0, 5, 15) // Целевая позиция камеры
  let cameraTargetRotation = new THREE.Euler(0, 0, 0) // Целевое вращение камеры

  // ============ НАБЛЮДАТЕЛЬ ЗА ВИДИМОСТЬЮ ЭЛЕМЕНТА ============
  let intersectionObserver: IntersectionObserver | null = null

  // ============ ГРАФИЧЕСКИЕ ОБЪЕКТЫ СЦЕНЫ ============
  let plasmaField: THREE.Mesh | null = null // Основное плазменное поле
  let plasmaParticles: THREE.Points | null = null // Система мелких частиц
  let glowParticles: THREE.Points | null = null // Светящиеся частицы

  // ============ КОНСТАНТЫ НАСТРОЕК ============
  const COLOR_CYCLE_DURATION = 30 // Длительность цикла смены цветов
  const MIN_BRIGHTNESS = 0.05 // Минимальная яркость
  const MAX_BRIGHTNESS = 0.3 // Максимальная яркость

  /**
   * КОНФИГУРАЦИЯ ПЛАЗМЕННОГО ФОНА
   */
  const PLASMA_CONFIG = {
    // Базовые цвета для циклического градиента
    baseColors: [
      new THREE.Color(0x000a99), // Темно-синий
      new THREE.Color(0x0044aa), // Синий
      new THREE.Color(0x0088bb), // Голубой
      new THREE.Color(0x00aa88), // Бирюзовый
      new THREE.Color(0x00bb44), // Зеленый
      new THREE.Color(0x88bb00), // Желто-зеленый
      new THREE.Color(0xbb8800), // Оранжевый
      new THREE.Color(0xbb4400), // Красно-оранжевый
      new THREE.Color(0xbb0044), // Розовый
      new THREE.Color(0x8800bb), // Фиолетовый
      new THREE.Color(0x4400aa), // Пурпурный
      new THREE.Color(0x000a99), // Темно-синий (замыкает цикл)
    ],

    // Текущие активные цвета
    currentColors: [] as THREE.Color[],

    // Настройки плазменного поля
    fieldSize: 120,
    fieldDetail: 200,
    fieldSpeed: 0.6,
    fieldAmplitude: 5.0,

    // Настройки частиц плазмы
    particleCount: 12000,
    particleSize: 0.1,
    particleSpeed: 0.8,
    particleBrightness: 1.3,

    // Настройки светящихся частиц
    glowParticleCount: 1000,
    glowParticleSize: 0.2,
    glowParticleSpeed: 0.5,
    glowParticleBrightness: 1.3,

    // Общие настройки
    brightness: 0.225,
    pulseIntensity: 0.1,

    // Настройки атмосферных эффектов
    fogDensity: 0.02,

    // Флаги включения/выключения эффектов
    enableWaves: true,
    enablePulse: true,
    enableFlow: true,
    enableSwirl: true,
    enableColorCycle: true,
    enableCameraAutoMovement: true, // Автоматическое движение камеры

    // ============ АВТОМАТИЧЕСКИ ОПРЕДЕЛЯЕМЫЕ НАСТРОЙКИ ============
    useMouseParallax: false, // Будет true на десктопах
    useGyroParallax: false, // Будет true на мобильных с гироскопом
  }

  /**
   * ОПРЕДЕЛЕНИЕ ТИПА УСТРОЙСТВА И НАЛИЧИЯ ГИРОСКОПА
   * Эта функция должна быть вызвана ПЕРВОЙ при инициализации
   */
  const detectDeviceType = () => {
    // 1. Определяем, мобильное ли устройство
    const userAgent = navigator.userAgent.toLowerCase()
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/
    isMobileDevice = mobileRegex.test(userAgent)

    // 2. Определяем тач-устройство
    const isTouchDevice =
      'ontouchstart' in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)

    console.log(`Тип устройства: ${isMobileDevice ? 'Мобильное' : 'Десктоп'}`)
    console.log(`Тач-устройство: ${isTouchDevice ? 'Да' : 'Нет'}`)

    // 3. Проверяем наличие гироскопа (только на мобильных)
    if (isMobileDevice && isTouchDevice) {
      // Проверяем поддержку DeviceOrientationEvent
      if (typeof DeviceOrientationEvent !== 'undefined') {
        // Дополнительная проверка для iOS 13+
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          // iOS 13+ - гироскоп доступен, но требуется разрешение
          hasGyroscope = true
          PLASMA_CONFIG.useGyroParallax = true
          PLASMA_CONFIG.useMouseParallax = false
          console.log('iOS 13+: гироскоп доступен (требуется разрешение)')
        } else if ('DeviceOrientationEvent' in window) {
          // Android и другие устройства - гироскоп доступен
          hasGyroscope = true
          PLASMA_CONFIG.useGyroParallax = true
          PLASMA_CONFIG.useMouseParallax = false
          console.log('Android/другие: гироскоп доступен')
        } else {
          // Мобильное устройство без гироскопа
          hasGyroscope = false
          PLASMA_CONFIG.useGyroParallax = false
          PLASMA_CONFIG.useMouseParallax = true
          console.log(
            'Мобильное устройство: гироскоп не поддерживается, используем тач-параллакс',
          )
        }
      } else {
        // DeviceOrientationEvent не поддерживается
        hasGyroscope = false
        PLASMA_CONFIG.useGyroParallax = false
        PLASMA_CONFIG.useMouseParallax = true
        console.log('Мобильное устройство: гироскоп не поддерживается')
      }
    } else {
      // Десктопное устройство - используем мышь
      hasGyroscope = false
      PLASMA_CONFIG.useGyroParallax = false
      PLASMA_CONFIG.useMouseParallax = true
      console.log('Десктоп: используем параллакс от мыши')
    }

    return {
      isMobile: isMobileDevice,
      hasGyroscope,
      useGyro: PLASMA_CONFIG.useGyroParallax,
      useMouse: PLASMA_CONFIG.useMouseParallax,
    }
  }

  /**
   * ЗАПРОС РАЗРЕШЕНИЯ НА ИСПОЛЬЗОВАНИЕ ГИРОСКОПА (только для iOS 13+)
   */
  const requestGyroPermission = async (): Promise<boolean> => {
    if (!hasGyroscope || !isMobileDevice || gyroPermissionRequested) return false

    try {
      gyroPermissionRequested = true

      // @ts-ignore - iOS-specific API
      const permission = await (DeviceOrientationEvent as any).requestPermission()

      if (permission === 'granted') {
        console.log('Разрешение на использование гироскопа получено')
        startGyroTracking()
        return true
      } else {
        console.log('Разрешение на использование гироскопа отклонено')
        // Если отказались, переключаемся на тач-параллакс
        PLASMA_CONFIG.useGyroParallax = false
        PLASMA_CONFIG.useMouseParallax = true
        return false
      }
    } catch (error) {
      console.error('Ошибка при запросе разрешения на гироскоп:', error)
      PLASMA_CONFIG.useGyroParallax = false
      PLASMA_CONFIG.useMouseParallax = true
      return false
    }
  }

  /**
   * НАЧАЛО ОТСЛЕЖИВАНИЯ ГИРОСКОПА
   */
  const startGyroTracking = () => {
    if (!hasGyroscope || !PLASMA_CONFIG.useGyroParallax) return

    window.addEventListener('deviceorientation', handleDeviceOrientation)
    isGyroActive = true
    console.log('Отслеживание гироскопа активировано')
  }

  /**
   * ОБРАБОТКА СОБЫТИЙ ГИРОСКОПА
   */
  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (!PLASMA_CONFIG.useGyroParallax || !isGyroActive) return

    // Значения могут быть null на некоторых устройствах
    if (event.alpha !== null) targetAlpha = event.alpha
    if (event.beta !== null) targetBeta = event.beta
    if (event.gamma !== null) targetGamma = event.gamma
  }

  /**
   * ОСТАНОВКА ОТСЛЕЖИВАНИЯ ГИРОСКОПА
   */
  const stopGyroTracking = () => {
    window.removeEventListener('deviceorientation', handleDeviceOrientation)
    isGyroActive = false

    // Сбрасываем значения гироскопа
    deviceAlpha = 0
    deviceBeta = 0
    deviceGamma = 0
    targetAlpha = 0
    targetBeta = 0
    targetGamma = 0

    console.log('Отслеживание гироскопа остановлено')
  }

  /**
   * ПЛАВНОЕ ОБНОВЛЕНИЕ ДАННЫХ ГИРОСКОПА
   */
  const smoothGyroUpdate = () => {
    if (!PLASMA_CONFIG.useGyroParallax || !isGyroActive) return

    // Плавная интерполяция значений гироскопа
    deviceAlpha += (targetAlpha - deviceAlpha) * PARALLAX_SMOOTHING
    deviceBeta += (targetBeta - deviceBeta) * PARALLAX_SMOOTHING
    deviceGamma += (targetGamma - deviceGamma) * PARALLAX_SMOOTHING
  }

  /**
   * ПРИМЕНЕНИЕ ЭФФЕКТА ОТ ГИРОСКОПА К КАМЕРЕ
   */
  const applyGyroEffect = () => {
    if (!PLASMA_CONFIG.useGyroParallax || !isGyroActive) return

    // Проверяем, есть ли реальные данные от гироскопа
    const hasGyroData = Math.abs(targetBeta) > 1 || Math.abs(targetGamma) > 1

    if (!hasGyroData) return

    // Нормализация углов гироскопа
    const normalizedBeta = THREE.MathUtils.clamp(
      (deviceBeta - 90) / 180, // Приводим к диапазону -1..1
      -1,
      1,
    )
    const normalizedGamma = THREE.MathUtils.clamp(
      deviceGamma / 90, // Приводим к диапазону -1..1
      -1,
      1,
    )
    const normalizedAlpha = deviceAlpha / 360 // 0..1

    // Вычисляем смещение позиции камеры
    const positionX = normalizedGamma * PARALLAX_INTENSITY * GYRO_X_MULTIPLIER
    const positionY = -normalizedBeta * PARALLAX_INTENSITY * GYRO_Y_MULTIPLIER
    const positionZ = normalizedBeta * PARALLAX_INTENSITY * GYRO_Z_MULTIPLIER

    // Вычисляем вращение камеры (только для гироскопа)
    const rotationX =
      normalizedBeta * PARALLAX_INTENSITY_MOBILE * GYRO_ROTATION_MULTIPLIER
    const rotationY =
      normalizedGamma * PARALLAX_INTENSITY_MOBILE * GYRO_ROTATION_MULTIPLIER
    const rotationZ =
      normalizedAlpha * PARALLAX_INTENSITY_MOBILE * GYRO_ROTATION_MULTIPLIER * 0.3

    cameraTargetPosition.set(
      cameraBasePosition.x + positionX,
      cameraBasePosition.y + positionY,
      cameraBasePosition.z + positionZ,
    )

    cameraTargetRotation.set(
      THREE.MathUtils.degToRad(rotationX),
      THREE.MathUtils.degToRad(rotationY),
      THREE.MathUtils.degToRad(rotationZ),
    )
  }

  /**
   * ИНИЦИАЛИЗАЦИЯ ТЕКУЩИХ ЦВЕТОВ
   */
  const initColors = () => {
    PLASMA_CONFIG.currentColors = [
      PLASMA_CONFIG.baseColors[0].clone(),
      PLASMA_CONFIG.baseColors[3].clone(),
      PLASMA_CONFIG.baseColors[6].clone(),
      PLASMA_CONFIG.baseColors[9].clone(),
    ]
  }

  /**
   * ОБНОВЛЕНИЕ ПОЗИЦИИ МЫШИ
   */
  const updateMousePosition = (event: MouseEvent) => {
    if (!containerRef.value || !PLASMA_CONFIG.useMouseParallax) return

    const rect = containerRef.value.getBoundingClientRect()
    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.top

    targetMouseX = (mouseX / rect.width) * 2 - 1
    targetMouseY = -(mouseY / rect.height) * 2 + 1

    // Отмечаем, что мышь двигалась (для активации параллакса)
    if (!hasMouseMoved) {
      hasMouseMoved = true
    }
  }

  /**
   * ОБРАБОТКА ТАЧ-СОБЫТИЙ (для мобильных без гироскопа)
   */
  const handleTouchMove = (event: TouchEvent) => {
    if (!containerRef.value || !PLASMA_CONFIG.useMouseParallax) return

    event.preventDefault()

    if (event.touches.length > 0) {
      const touch = event.touches[0]
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
      updateMousePosition(mouseEvent)
    }
  }

  /**
   * ПЛАВНОЕ ОБНОВЛЕНИЕ ПОЗИЦИИ МЫШИ
   */
  const smoothMouseUpdate = () => {
    if (!PLASMA_CONFIG.useMouseParallax) return

    normalizedMouseX += (targetMouseX - normalizedMouseX) * PARALLAX_SMOOTHING
    normalizedMouseY += (targetMouseY - normalizedMouseY) * PARALLAX_SMOOTHING
  }

  /**
   * ПРИМЕНЕНИЕ ЭФФЕКТА ОТ МЫШИ К КАМЕРЕ
   */
  const applyMouseEffect = () => {
    if (!PLASMA_CONFIG.useMouseParallax) return

    // Если мышь еще не двигалась, не применяем эффект (чтобы камера не смещалась при старте)
    if (!hasMouseMoved) {
      cameraTargetPosition.copy(cameraBasePosition)
      cameraTargetRotation.set(0, 0, 0)
      return
    }

    const parallaxX = normalizedMouseX * PARALLAX_INTENSITY * MOUSE_X_MULTIPLIER
    const parallaxY = normalizedMouseY * PARALLAX_INTENSITY * MOUSE_Y_MULTIPLIER
    const parallaxZ = normalizedMouseY * PARALLAX_INTENSITY * MOUSE_Z_MULTIPLIER

    cameraTargetPosition.set(
      cameraBasePosition.x + parallaxX,
      cameraBasePosition.y + parallaxY,
      cameraBasePosition.z + parallaxZ,
    )

    // Для мыши вращение камеры не применяется (только для гироскопа)
    cameraTargetRotation.set(0, 0, 0)
  }

  /**
   * ПРИМЕНЕНИЕ АВТОМАТИЧЕСКОГО ДВИЖЕНИЯ КАМЕРЫ
   */
  const applyAutoCameraMovement = () => {
    if (!PLASMA_CONFIG.enableCameraAutoMovement) return

    // Автоматическое движение камеры по орбите
    cameraBasePosition.x = Math.sin(time * 0.008) * 1.5
    cameraBasePosition.y = 5 + Math.cos(time * 0.006) * 0.5
    cameraBasePosition.z = 15 + Math.sin(time * 0.005) * 1

    cameraTargetPosition.copy(cameraBasePosition)
    cameraTargetRotation.set(0, 0, 0)
  }

  /**
   * ПЛАВНОЕ ОБНОВЛЕНИЕ КАМЕРЫ
   */
  const smoothCameraUpdate = () => {
    // Плавное перемещение позиции камеры
    camera.position.lerp(cameraTargetPosition, 0.1)

    // Плавное вращение камеры (только если используем гироскоп)
    if (PLASMA_CONFIG.useGyroParallax) {
      const currentRotation = new THREE.Euler().setFromQuaternion(camera.quaternion)

      currentRotation.x += (cameraTargetRotation.x - currentRotation.x) * 0.05
      currentRotation.y += (cameraTargetRotation.y - currentRotation.y) * 0.05
      currentRotation.z += (cameraTargetRotation.z - currentRotation.z) * 0.05

      camera.quaternion.setFromEuler(currentRotation)
    }
  }

  /**
   * ОБНОВЛЕНИЕ ЦИКЛА СМЕНЫ ЦВЕТОВ
   */
  const updateColorCycle = (deltaTime: number) => {
    if (!PLASMA_CONFIG.enableColorCycle) return

    colorCycleTime += deltaTime
    const cycleProgress = (colorCycleTime % COLOR_CYCLE_DURATION) / COLOR_CYCLE_DURATION
    const totalColors = PLASMA_CONFIG.baseColors.length
    const progressPerColor = 1.0 / 4

    for (let i = 0; i < 4; i++) {
      const targetProgress = (cycleProgress + i * progressPerColor) % 1.0
      const colorIndex = Math.floor(targetProgress * (totalColors - 1))
      const nextIndex = (colorIndex + 1) % (totalColors - 1)
      const lerpFactor = (targetProgress * (totalColors - 1)) % 1.0

      PLASMA_CONFIG.currentColors[i] = PLASMA_CONFIG.baseColors[colorIndex]
        .clone()
        .lerp(PLASMA_CONFIG.baseColors[nextIndex], lerpFactor)
        .multiplyScalar(0.7)
    }

    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      plasmaField.material.uniforms.uColor1.value = PLASMA_CONFIG.currentColors[0]
      plasmaField.material.uniforms.uColor2.value = PLASMA_CONFIG.currentColors[1]
      plasmaField.material.uniforms.uColor3.value = PLASMA_CONFIG.currentColors[2]
      plasmaField.material.uniforms.uColor4.value = PLASMA_CONFIG.currentColors[3]
    }
  }

  /**
   * СОЗДАНИЕ ПЛАЗМЕННОГО ПОЛЯ
   */
  const createPlasmaField = () => {
    const geometry = new THREE.PlaneGeometry(
      PLASMA_CONFIG.fieldSize,
      PLASMA_CONFIG.fieldSize,
      PLASMA_CONFIG.fieldDetail,
      PLASMA_CONFIG.fieldDetail,
    )

    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vWave;
      uniform float uTime;
      uniform float uAmplitude;
      uniform float uSpeed;
      uniform bool uEnableWaves;
      uniform bool uEnableSwirl;

      void main() {
        vUv = uv;
        vPosition = position;

        vec3 newPosition = position;

        if (uEnableWaves) {
          float wave1 = sin(position.x * 0.2 + uTime * uSpeed) *
                       cos(position.y * 0.15 + uTime * uSpeed * 0.8) * uAmplitude;

          float wave2 = sin(position.x * 0.35 + uTime * uSpeed * 1.3) *
                       cos(position.y * 0.25 + uTime * uSpeed * 1.1) * uAmplitude * 0.7;

          float wave3 = sin(position.x * 0.6 + position.y * 0.6 + uTime * uSpeed * 0.7) *
                       uAmplitude * 0.5;

          float radius = length(position.xy);
          float wave4 = sin(radius * 0.12 + uTime * uSpeed * 0.4) * uAmplitude * 0.4;

          vWave = (wave1 + wave2 + wave3 + wave4) / (uAmplitude * 3.0);
          newPosition.z = wave1 + wave2 + wave3 + wave4;
        }

        if (uEnableSwirl) {
          float distanceFromCenter = length(position.xy);
          float swirl = sin(distanceFromCenter * 0.12 - uTime * uSpeed * 0.25) * 0.4;
          float angle = atan(position.y, position.x) + swirl;

          newPosition.x = cos(angle) * distanceFromCenter;
          newPosition.y = sin(angle) * distanceFromCenter;
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `

    const fragmentShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying float vWave;
      uniform float uTime;
      uniform float uBrightness;
      uniform bool uEnablePulse;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform vec3 uColor4;

      float hash(vec2 p) {
        p = mod(p, 1000.0);
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);

        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fractalNoise(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 0.7;

        for (int i = 0; i < 5; i++) {
          value += smoothNoise(p * frequency) * amplitude;
          amplitude *= 0.6;
          frequency *= 1.8;
        }
        return value;
      }

      float plasma(vec2 uv, float time) {
        float value = 0.0;
        value += sin(uv.x * 3.0 + time * 0.8) * 0.5 + 0.5;
        value += sin(uv.y * 2.5 + time * 1.2) * 0.5 + 0.5;
        value += sin((uv.x + uv.y) * 1.5 + time * 0.5) * 0.5 + 0.5;
        value += fractalNoise(uv * 1.2 + time * 0.2) * 0.3;

        float radius = length(uv);
        value += sin(radius * 2.5 - time * 1.0) * 0.2 + 0.2;

        return clamp(value / 2.0, 0.0, 1.0);
      }

      void main() {
        vec2 animatedUV = vUv * 1.2 - 0.6;
        animatedUV.x += sin(uTime * 0.08) * 0.08;
        animatedUV.y += cos(uTime * 0.06) * 0.08;

        float p = plasma(animatedUV, uTime * 0.3);

        float pulse = 1.0;
        if (uEnablePulse) {
          pulse = 0.95 + sin(uTime * 1.0) * 0.05;
          p *= pulse;
        }

        vec3 color;
        if (p < 0.25) {
          color = mix(uColor1, uColor2, p * 4.0);
        } else if (p < 0.5) {
          color = mix(uColor2, uColor3, (p - 0.25) * 4.0);
        } else if (p < 0.75) {
          color = mix(uColor3, uColor4, (p - 0.5) * 4.0);
        } else {
          color = mix(uColor4, uColor1, (p - 0.75) * 4.0);
        }

        float edge = 1.0 - smoothstep(0.0, 0.6, length(animatedUV));
        color += vec3(0.4, 0.3, 0.6) * edge * 0.15;
        color += vec3(0.2, 0.15, 0.3) * vWave * 0.15;
        color *= clamp(uBrightness, ${MIN_BRIGHTNESS.toFixed(3)}, ${MAX_BRIGHTNESS.toFixed(3)});

        float alpha = smoothstep(0.0, 0.6, p) * 0.5;
        alpha += edge * 0.08;

        gl_FragColor = vec4(color, alpha);
      }
    `

    initColors()

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: PLASMA_CONFIG.fieldAmplitude },
        uSpeed: { value: PLASMA_CONFIG.fieldSpeed },
        uBrightness: { value: PLASMA_CONFIG.brightness },
        uEnableWaves: { value: PLASMA_CONFIG.enableWaves },
        uEnablePulse: { value: PLASMA_CONFIG.enablePulse },
        uEnableSwirl: { value: PLASMA_CONFIG.enableSwirl },
        uColor1: { value: PLASMA_CONFIG.currentColors[0] },
        uColor2: { value: PLASMA_CONFIG.currentColors[1] },
        uColor3: { value: PLASMA_CONFIG.currentColors[2] },
        uColor4: { value: PLASMA_CONFIG.currentColors[3] },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = -8
    return mesh
  }

  /**
   * СОЗДАНИЕ СИСТЕМЫ ЧАСТИЦ ПЛАЗМЫ
   */
  const createPlasmaParticles = () => {
    const particleCount = PLASMA_CONFIG.particleCount
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const phases = new Float32Array(particleCount)
    const colorPhases = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const isFrontZone = Math.random() < 0.65
      let radius, theta, phi

      if (isFrontZone) {
        radius = 12 + Math.random() * 28
        phi = Math.acos(1 - Math.random() * 1.6)
        theta = Math.random() * Math.PI * 2
        const zBias = 0.6 + Math.random() * 0.4

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta) * 0.9
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.9
        positions[i * 3 + 2] = radius * Math.cos(phi) * (1.3 + Math.random() * 0.4)
      } else {
        radius = 22 + Math.random() * 40
        theta = Math.random() * Math.PI * 2
        phi = Math.acos(Math.random() * 2 - 1)

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)
      }

      const colorProgress = Math.random()
      const color = new THREE.Color()

      if (colorProgress < 0.25) {
        color
          .copy(PLASMA_CONFIG.currentColors[0])
          .lerp(PLASMA_CONFIG.currentColors[1], colorProgress * 4)
      } else if (colorProgress < 0.5) {
        color
          .copy(PLASMA_CONFIG.currentColors[1])
          .lerp(PLASMA_CONFIG.currentColors[2], (colorProgress - 0.25) * 4)
      } else if (colorProgress < 0.75) {
        color
          .copy(PLASMA_CONFIG.currentColors[2])
          .lerp(PLASMA_CONFIG.currentColors[3], (colorProgress - 0.5) * 4)
      } else {
        color
          .copy(PLASMA_CONFIG.currentColors[3])
          .lerp(PLASMA_CONFIG.currentColors[0], (colorProgress - 0.75) * 4)
      }

      color.multiplyScalar(0.78)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      const distanceFromCenter = Math.sqrt(
        positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2 + positions[i * 3 + 2] ** 2,
      )
      const sizeMultiplier = Math.max(0.6, 1.1 - distanceFromCenter / 80)
      sizes[i] = PLASMA_CONFIG.particleSize * (0.7 + Math.random() * 1.0) * sizeMultiplier

      phases[i] = Math.random() * Math.PI * 2
      colorPhases[i] = Math.random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
    geometry.setAttribute('colorPhase', new THREE.BufferAttribute(colorPhases, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: PLASMA_CONFIG.particleSpeed },
        uCycleProgress: { value: 0 },
        uParticleBrightness: { value: PLASMA_CONFIG.particleBrightness },
        uColors: {
          value: [
            PLASMA_CONFIG.currentColors[0],
            PLASMA_CONFIG.currentColors[1],
            PLASMA_CONFIG.currentColors[2],
            PLASMA_CONFIG.currentColors[3],
          ],
        },
        uFrontBias: { value: 1.5 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        attribute float phase;
        attribute float colorPhase;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uCycleProgress;
        uniform float uParticleBrightness;
        uniform vec3 uColors[4];
        uniform float uFrontBias;

        vec3 getParticleColor(float progress, float offset) {
          float totalProgress = mod(progress + offset, 1.0);
          float segment = totalProgress * 3.0;

          if (segment < 1.0) {
            return mix(uColors[0], uColors[1], segment);
          } else if (segment < 2.0) {
            return mix(uColors[1], uColors[2], segment - 1.0);
          } else {
            return mix(uColors[2], uColors[3], segment - 2.0);
          }
        }

        void main() {
          float colorOffset = colorPhase * 0.3;
          vColor = getParticleColor(uCycleProgress, colorOffset);
          vColor *= uParticleBrightness;

          vec3 pos = position;
          float t = uTime * uSpeed + phase;

          float distanceFromCenter = length(position);
          float frontBiasFactor = smoothstep(30.0, 10.0, distanceFromCenter) * uFrontBias;

          float orbitSpeed = 0.08 + phase * 0.03;
          pos.x += sin(t * orbitSpeed * (1.0 + frontBiasFactor * 0.3)) * 0.3 * (1.0 + frontBiasFactor * 0.2);
          pos.y += cos(t * orbitSpeed * 0.8 * (1.0 + frontBiasFactor * 0.3)) * 0.25 * (1.0 + frontBiasFactor * 0.2);
          pos.z += sin(t * orbitSpeed * 0.6 * (1.0 + frontBiasFactor * 0.3)) * 0.2 * (1.0 + frontBiasFactor * 0.2);

          float angle = t * 0.15;
          float cosA = cos(angle);
          float sinA = sin(angle);
          float newX = pos.x * cosA - pos.z * sinA;
          float newZ = pos.x * sinA + pos.z * cosA;
          pos.x = newX;
          pos.z = newZ;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (220.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          if (dist > 0.5) {
            discard;
          }

          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= 0.65;

          float glow = pow(1.0 - dist * 2.0, 2.0) * 0.2;

          gl_FragColor = vec4(vColor + vec3(glow * 0.4), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    return new THREE.Points(geometry, material)
  }

  /**
   * СОЗДАНИЕ СВЕТЯЩИХСЯ ЧАСТИЦ
   */
  const createGlowParticles = () => {
    const particleCount = PLASMA_CONFIG.glowParticleCount
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const colorPhases = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const isFrontZone = Math.random() < 0.7
      let radius, theta, phi

      if (isFrontZone) {
        radius = 6 + Math.random() * 18
        phi = Math.acos(1 - Math.random() * 1.4)
        theta = Math.random() * Math.PI * 2
        const zMultiplier = 1.3 + Math.random() * 0.3

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta) * 0.7
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.7
        positions[i * 3 + 2] = radius * Math.cos(phi) * zMultiplier
      } else {
        radius = 12 + Math.random() * 25
        theta = Math.random() * Math.PI * 2
        phi = Math.acos(Math.random() * 2 - 1)

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)
      }

      const colorIndex = Math.floor(Math.random() * 4)
      const color = PLASMA_CONFIG.currentColors[colorIndex].clone()
      color.multiplyScalar(1.04)

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      const zPos = Math.abs(positions[i * 3 + 2])
      const sizeMultiplier = zPos < 15 ? 1.4 : 0.9

      sizes[i] =
        PLASMA_CONFIG.glowParticleSize * (0.8 + Math.random() * 1.0) * sizeMultiplier
      colorPhases[i] = Math.random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('colorPhase', new THREE.BufferAttribute(colorPhases, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: PLASMA_CONFIG.glowParticleSpeed },
        uCycleProgress: { value: 0 },
        uGlowBrightness: { value: PLASMA_CONFIG.glowParticleBrightness },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        attribute float colorPhase;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uCycleProgress;
        uniform float uGlowBrightness;

        void main() {
          vColor = color * uGlowBrightness;

          vec3 pos = position;
          float t = uTime * uSpeed;

          pos.x += sin(t * 0.2 + position.y * 0.03) * 0.15;
          pos.y += cos(t * 0.18 + position.z * 0.03) * 0.15;
          pos.z += sin(t * 0.15 + position.x * 0.03) * 0.15;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (260.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          if (dist > 0.5) {
            discard;
          }

          float alpha = pow(1.0 - dist * 2.0, 3.0);
          alpha *= 0.39;

          float glow = pow(1.0 - dist * 2.0, 4.0);

          gl_FragColor = vec4(vColor * (1.0 + glow * 0.26), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    return new THREE.Points(geometry, material)
  }

  /**
   * ОБНОВЛЕНИЕ ОБЩЕЙ ЯРКОСТИ СЦЕНЫ
   */
  const updateBrightness = (brightness: number) => {
    PLASMA_CONFIG.brightness = Math.max(
      MIN_BRIGHTNESS,
      Math.min(MAX_BRIGHTNESS, brightness),
    )

    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      plasmaField.material.uniforms.uBrightness.value = PLASMA_CONFIG.brightness
    }
  }

  /**
   * ОБНОВЛЕНИЕ ЯРКОСТИ ЧАСТИЦ
   */
  const updateParticleBrightness = (brightness: number) => {
    PLASMA_CONFIG.particleBrightness = brightness
    PLASMA_CONFIG.glowParticleBrightness = brightness

    if (plasmaParticles?.material instanceof THREE.ShaderMaterial) {
      plasmaParticles.material.uniforms.uParticleBrightness.value = brightness
    }
    if (glowParticles?.material instanceof THREE.ShaderMaterial) {
      glowParticles.material.uniforms.uGlowBrightness.value = brightness
    }
  }

  /**
   * ОСНОВНОЙ ЦИКЛ АНИМАЦИИ
   */
  const animate = () => {
    if (!isAnimationActive) {
      return
    }

    animationFrameId = requestAnimationFrame(animate)

    const deltaTime = 16
    const deltaTimeSeconds = deltaTime * 0.001
    time += deltaTimeSeconds

    // Плавное обновление позиции мыши (если используем мышь)
    if (PLASMA_CONFIG.useMouseParallax) {
      smoothMouseUpdate()
    }

    // Плавное обновление данных гироскопа (если используем гироскоп)
    if (PLASMA_CONFIG.useGyroParallax) {
      smoothGyroUpdate()
    }

    // ============ АВТОМАТИЧЕСКИЙ ВЫБОР ЭФФЕКТА ДЛЯ КАМЕРЫ ============
    if (PLASMA_CONFIG.useGyroParallax && isGyroActive) {
      // 1. Приоритет: гироскоп на мобильных устройствах
      applyGyroEffect()
    } else if (PLASMA_CONFIG.useMouseParallax) {
      // 2. Мышь на десктопах (или мобильных без гироскопа)
      applyMouseEffect()
    } else if (PLASMA_CONFIG.enableCameraAutoMovement) {
      // 3. Автоматическое движение камеры
      applyAutoCameraMovement()
    } else {
      // 4. Камера остается на месте
      cameraTargetPosition.copy(cameraBasePosition)
      cameraTargetRotation.set(0, 0, 0)
    }

    // Плавное обновление позиции и вращения камеры
    smoothCameraUpdate()

    // Обновление цикла цветов
    updateColorCycle(deltaTimeSeconds)

    const cycleProgress = (colorCycleTime % COLOR_CYCLE_DURATION) / COLOR_CYCLE_DURATION

    // Обновление uniform-переменных
    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      plasmaField.material.uniforms.uTime.value = time
    }

    if (plasmaParticles?.material instanceof THREE.ShaderMaterial) {
      plasmaParticles.material.uniforms.uTime.value = time
      plasmaParticles.material.uniforms.uCycleProgress.value = cycleProgress
      plasmaParticles.material.uniforms.uColors.value = [
        PLASMA_CONFIG.currentColors[0],
        PLASMA_CONFIG.currentColors[1],
        PLASMA_CONFIG.currentColors[2],
        PLASMA_CONFIG.currentColors[3],
      ]
    }

    if (glowParticles?.material instanceof THREE.ShaderMaterial) {
      glowParticles.material.uniforms.uTime.value = time
      glowParticles.material.uniforms.uCycleProgress.value = cycleProgress
    }

    // Анимация плазменного поля
    if (plasmaField) {
      plasmaField.rotation.y += 0.0002 * PLASMA_CONFIG.fieldSpeed
      plasmaField.rotation.z += 0.0001 * PLASMA_CONFIG.fieldSpeed

      if (PLASMA_CONFIG.enablePulse) {
        const pulse = Math.sin(time * 0.8) * 0.02 + 1
        plasmaField.scale.setScalar(pulse)
      }
    }

    // Анимация света
    const pointLight = scene.getObjectByName('mainPointLight') as THREE.PointLight
    if (pointLight && PLASMA_CONFIG.enablePulse) {
      pointLight.intensity = 0.4 + Math.sin(time * 0.6) * 0.08
      pointLight.position.x = Math.sin(time * 0.04) * 4
      pointLight.position.y = 4 + Math.cos(time * 0.03) * 1.5
      pointLight.position.z = Math.cos(time * 0.035) * 4
    }

    // Рендеринг сцены
    renderer.render(scene, camera)
  }

  /**
   * ОСТАНОВКА АНИМАЦИИ
   */
  const stopAnimation = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
    isAnimationActive = false

    // Останавливаем отслеживание гироскопа
    stopGyroTracking()
  }

  /**
   * ЗАПУСК АНИМАЦИИ
   */
  const startAnimation = () => {
    if (!isAnimationActive) {
      isAnimationActive = true
      animate()
    }
  }

  /**
   * ПРОВЕРКА ВИДИМОСТИ ЭЛЕМЕНТА
   */
  const isElementInViewport = () => {
    if (!containerRef.value) return false

    const rect = containerRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const windowWidth = window.innerWidth || document.documentElement.clientWidth

    const vertInView = rect.top <= windowHeight && rect.bottom >= 0
    const horInView = rect.left <= windowWidth && rect.right >= 0

    return vertInView && horInView
  }

  /**
   * ОЧИСТКА РЕСУРСОВ
   */
  const cleanup = () => {
    stopAnimation()

    if (containerRef.value) {
      containerRef.value.removeEventListener('mousemove', updateMousePosition)
      containerRef.value.removeEventListener('touchmove', handleTouchMove)
    }

    if (intersectionObserver && containerRef.value) {
      intersectionObserver.unobserve(containerRef.value)
      intersectionObserver.disconnect()
      intersectionObserver = null
    }

    stopGyroTracking()

    if (plasmaField) {
      plasmaField.geometry.dispose()
      const material = plasmaField.material as THREE.ShaderMaterial
      material.dispose()
      scene.remove(plasmaField)
    }

    if (plasmaParticles) {
      plasmaParticles.geometry.dispose()
      const material = plasmaParticles.material as THREE.ShaderMaterial
      material.dispose()
      scene.remove(plasmaParticles)
    }

    if (glowParticles) {
      glowParticles.geometry.dispose()
      const material = glowParticles.material as THREE.ShaderMaterial
      material.dispose()
      scene.remove(glowParticles)
    }

    if (renderer) {
      renderer.dispose()
    }
    if (scene) {
      scene.clear()
    }
  }

  /**
   * ИНИЦИАЛИЗАЦИЯ INTERSECTION OBSERVER
   */
  const initIntersectionObserver = () => {
    if (!containerRef.value) return

    intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAnimation()
          } else {
            stopAnimation()
          }
        })
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      },
    )

    intersectionObserver.observe(containerRef.value)
  }

  /**
   * ИНИЦИАЛИЗАЦИЯ THREE.JS
   */
  const initThreeJS = () => {
    if (!containerRef.value) return

    // ============ ШАГ 1: ОПРЕДЕЛЯЕМ ТИП УСТРОЙСТВА ============
    const deviceInfo = detectDeviceType()
    console.log('Настройки параллакса:', {
      useMouseParallax: PLASMA_CONFIG.useMouseParallax,
      useGyroParallax: PLASMA_CONFIG.useGyroParallax,
      hasGyroscope,
      isMobileDevice,
    })

    // ============ ШАГ 2: ИНИЦИАЛИЗИРУЕМ THREE.JS ============
    initColors()

    // Создание сцены с туманом
    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000011, 10, 60)

    // Настройка камеры
    if (isMobileDevice) {
      // Для мобильных устройств
      camera = new THREE.PerspectiveCamera(
        75, // Меньший FOV для мобильных (было 110)
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      )
      cameraBasePosition.set(0, 3, 20) // Камера дальше (было 15)
    } else {
      // Для десктопов
      camera = new THREE.PerspectiveCamera(
        110, // Большой FOV для десктопов
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      )
      cameraBasePosition.set(0, 5, 15) // Стандартная позиция
    }
    cameraBasePosition.set(0, 5, 15)
    cameraTargetPosition.copy(cameraBasePosition)
    camera.position.copy(cameraBasePosition)
    camera.lookAt(0, -5, 0)

    // Создание WebGL рендерера
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000011, 1)

    // Настройка стилей canvas
    const canvas = renderer.domElement
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100dvh'
    canvas.style.zIndex = '0'
    canvas.style.pointerEvents = 'auto'
    containerRef.value.prepend(canvas)

    // ============ ШАГ 3: НАСТРАИВАЕМ ВЗАИМОДЕЙСТВИЕ В ЗАВИСИМОСТИ ОТ УСТРОЙСТВА ============
    if (PLASMA_CONFIG.useMouseParallax) {
      // Для десктопов и мобильных без гироскопа - добавляем обработчики мыши/тача
      containerRef.value.addEventListener('mousemove', updateMousePosition)

      // Для мобильных устройств добавляем обработку тач-событий
      if (isMobileDevice) {
        containerRef.value.addEventListener('touchmove', handleTouchMove, {
          passive: false,
        })
      }
    }

    // Если на мобильном с гироскопом и это не iOS 13+, сразу запускаем отслеживание
    if (
      PLASMA_CONFIG.useGyroParallax &&
      hasGyroscope &&
      typeof (DeviceOrientationEvent as any).requestPermission !== 'function'
    ) {
      // Для Android и других устройств запускаем гироскоп сразу
      startGyroTracking()
    }

    // ============ ШАГ 4: СОЗДАЕМ СЦЕНУ ============
    // Создание освещения
    const ambientLight = new THREE.AmbientLight(0x220099, 0.1)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x440099, 0.2)
    directionalLight.position.set(3, 10, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x660099, 0.4, 80)
    pointLight.name = 'mainPointLight'
    pointLight.position.set(0, 4, 0)
    scene.add(pointLight)

    // Создание графических объектов
    plasmaField = createPlasmaField()
    scene.add(plasmaField)

    plasmaParticles = createPlasmaParticles()
    scene.add(plasmaParticles)

    glowParticles = createGlowParticles()
    scene.add(glowParticles)

    // ============ ШАГ 5: НАСТРАИВАЕМ ОБРАБОТЧИКИ ============
    // Обработчик изменения размера окна
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Инициализация наблюдения за видимостью
    initIntersectionObserver()

    // ============ ШАГ 6: ЗАПРАШИВАЕМ РАЗРЕШЕНИЕ НА ГИРОСКОП (для iOS 13+) ============
    if (
      PLASMA_CONFIG.useGyroParallax &&
      hasGyroscope &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      // Ждем немного, чтобы пользователь увидел интерфейс, затем запрашиваем разрешение
      setTimeout(async () => {
        console.log('Запрашиваем разрешение на использование гироскопа (iOS 13+)...')
        await requestGyroPermission()
      }, 1500)
    }

    // Запускаем анимацию через небольшую задержку
    setTimeout(() => {
      if (isElementInViewport()) {
        startAnimation()
      }
    }, 200)

    // Возвращаем объект с методами управления
    return {
      cleanup: () => {
        window.removeEventListener('resize', handleResize)
        if (containerRef.value) {
          containerRef.value.removeEventListener('mousemove', updateMousePosition)
          containerRef.value.removeEventListener('touchmove', handleTouchMove)
        }
        cleanup()
      },
      updateBrightness: (value: number) => {
        updateBrightness(value)
      },
      updateParticleBrightness: (value: number) => {
        updateParticleBrightness(value)
      },
      updateSpeed: (value: number) => {
        PLASMA_CONFIG.fieldSpeed = value * 0.6
        PLASMA_CONFIG.particleSpeed = value * 0.8
        PLASMA_CONFIG.glowParticleSpeed = value * 0.5
      },
      updateColors: (colors: number[]) => {
        PLASMA_CONFIG.baseColors = colors.map(hex => new THREE.Color(hex))
        initColors()
      },
      toggleColorCycle: (enabled: boolean) => {
        PLASMA_CONFIG.enableColorCycle = enabled
      },
      toggleCameraAutoMovement: (enabled: boolean) => {
        PLASMA_CONFIG.enableCameraAutoMovement = enabled

        if (!enabled) {
          cameraTargetPosition.copy(cameraBasePosition)
          cameraTargetRotation.set(0, 0, 0)
        }
      },
      updateCameraPosition: (x: number, y: number, z: number) => {
        cameraBasePosition.set(x, y, z)
        cameraTargetPosition.copy(cameraBasePosition)
        camera.position.copy(cameraBasePosition)
        camera.lookAt(0, -5, 0)
      },
      updateCameraFOV: (fov: number) => {
        camera.fov = fov
        camera.updateProjectionMatrix()
      },
      updateParallaxIntensity: (intensity: number) => {
        PARALLAX_INTENSITY = intensity
      },
      enableGyroManually: async () => {
        // Ручное включение гироскопа (например, по кнопке)
        if (hasGyroscope && !isGyroActive) {
          if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            return await requestGyroPermission()
          } else {
            startGyroTracking()
            return true
          }
        }
        return false
      },
      disableGyroManually: () => {
        // Ручное выключение гироскопа
        if (isGyroActive) {
          stopGyroTracking()
          // Переключаемся на мышь/тач
          PLASMA_CONFIG.useGyroParallax = false
          PLASMA_CONFIG.useMouseParallax = true
          return true
        }
        return false
      },
      startAnimation: () => {
        startAnimation()
      },
      stopAnimation: () => {
        stopAnimation()
      },
      getConfig: () => ({
        ...PLASMA_CONFIG,
        colorCycleDuration: COLOR_CYCLE_DURATION,
        minBrightness: MIN_BRIGHTNESS,
        maxBrightness: MAX_BRIGHTNESS,
        parallaxIntensity: PARALLAX_INTENSITY,
        isMobileDevice,
        hasGyroscope,
        isGyroActive,
        useMouseParallax: PLASMA_CONFIG.useMouseParallax,
        useGyroParallax: PLASMA_CONFIG.useGyroParallax,
      }),
      setConfig: (config: Partial<typeof PLASMA_CONFIG>) => {
        Object.assign(PLASMA_CONFIG, config)
        updateBrightness(PLASMA_CONFIG.brightness)
        updateParticleBrightness(PLASMA_CONFIG.particleBrightness)
      },
    }
  }

  // ============ HOOKS ЖИЗНЕННОГО ЦИКЛА VUE ============

  onMounted(async () => {
    const controls = initThreeJS()

    onUnmounted(() => {
      if (controls) {
        controls.cleanup()
      }
    })

    return controls
  })

  // ============ PUBLIC API ============

  return {
    updateBrightness: (value: number) => {
      updateBrightness(value)
    },
    updateParticleBrightness: (value: number) => {
      updateParticleBrightness(value)
    },
    updateSpeed: (value: number) => {
      PLASMA_CONFIG.fieldSpeed = value * 0.6
      PLASMA_CONFIG.particleSpeed = value * 0.8
      PLASMA_CONFIG.glowParticleSpeed = value * 0.5
    },
    startAnimation: () => {
      startAnimation()
    },
    stopAnimation: () => {
      stopAnimation()
    },
  }
}
