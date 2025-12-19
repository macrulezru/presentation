// @ts-nocheck
import * as THREE from 'three'
import { onMounted, onUnmounted, type Ref, ref } from 'vue'

/**
 * Vue Composition API хук для создания интерактивного плазменного фона с использованием Three.js
 * Создает анимированную сцену с плазменными волнами, частицами и эффектом параллакса от мыши
 * Поддерживает гироскоп и компас на мобильных устройствах
 *
 * @param containerRef - Vue ref, ссылающийся на HTML-элемент контейнера, в который будет рендериться сцена
 * @returns Объект с методами управления анимацией и настройками
 */
export function usePlasmaBackground(containerRef: Ref<HTMLElement | undefined>) {
  // ============ ОСНОВНЫЕ ПЕРЕМЕННЫЕ THREE.JS ============
  let scene: THREE.Scene // Трехмерная сцена, содержащая все объекты
  let camera: THREE.PerspectiveCamera // Камера с перспективной проекцией для естественного отображения 3D
  let renderer: THREE.WebGLRenderer // Рендерер для отрисовки сцены через WebGL
  let animationFrameId: number // Идентификатор кадра анимации для управления requestAnimationFrame

  // ============ ПЕРЕМЕННЫЕ ВРЕМЕНИ И СОСТОЯНИЯ ============
  let time = 0 // Общее время анимации в секундах (накапливается с каждым кадром)
  const isAnimationActive = ref<boolean>(false) // Флаг, указывающий, активна ли в данный момент анимация
  let colorCycleTime = 0 // Время, используемое для циклической смены цветов

  // ============ ДЕТЕКТИРОВАНИЕ УСТРОЙСТВА ============
  let isMobileDevice = false
  let isGyroAvailable = false
  let isCompassAvailable = false

  // ============ ПЕРЕМЕННЫЕ ДЛЯ ВЗАИМОДЕЙСТВИЯ С МЫШЬЮ (для десктопов) ============
  let mouseX = 0 // Абсолютная X-координата курсора мыши в пикселях относительно контейнера
  let mouseY = 0 // Абсолютная Y-координата курсора мыши в пикселях относительно контейнера
  let normalizedMouseX = 0 // Нормализованная X-координата (-1 до 1) для параллакса
  let normalizedMouseY = 0 // Нормализованная Y-координата (-1 до 1) для параллакса
  let targetMouseX = 0 // Целевая X-координата для плавной интерполяции
  let targetMouseY = 0 // Целевая Y-координата для плавной интерполяции

  // ============ ПЕРЕМЕННЫЕ ДЛЯ ГИРОСКОПА (для мобильных устройств) ============
  let deviceAlpha = 0 // Угол вращения вокруг оси Z (азимут/компас)
  let deviceBeta = 0 // Угол вращения вокруг оси X (наклон вперед/назад)
  let deviceGamma = 0 // Угол вращения вокруг оси Y (наклон влево/вправо)
  let targetDeviceAlpha = 0 // Целевое значение для плавной интерполяции
  let targetDeviceBeta = 0
  let targetDeviceGamma = 0
  let isGyroInitialized = false // Флаг инициализации гироскопа

  // Настройки параллакса для мыши
  const PARALLAX_INTENSITY = 0.5 // Интенсивность эффекта параллакса (смещение камеры)
  const PARALLAX_SMOOTHING = 0.08 // Коэффициент сглаживания движения камеры

  // Настройки гироскопа
  const GYRO_INTENSITY = 0.015 // Интенсивность вращения камеры от гироскопа
  const GYRO_SMOOTHING = 0.05 // Коэффициент сглаживания для гироскопа
  const GYRO_DEAD_ZONE = 0.02 // Мертвая зона для предотвращения дрожания

  // Начальная позиция камеры (будет использоваться как база для параллакса)
  let cameraBasePosition = new THREE.Vector3(0, 5, 15)
  let cameraTargetPosition = new THREE.Vector3(0, 5, 15)

  // Целевое вращение камеры для гироскопа
  let cameraTargetRotation = new THREE.Euler(0, 0, 0, 'YXZ')
  let cameraCurrentRotation = new THREE.Euler(0, 0, 0, 'YXZ')

  // ============ НАБЛЮДАТЕЛЬ ЗА ВИДИМОСТЬЮ ЭЛЕМЕНТА ============
  let intersectionObserver: IntersectionObserver | null = null // Для автоматического старта/остановки анимации при скролле

  // ============ ГРАФИЧЕСКИЕ ОБЪЕКТЫ СЦЕНЫ ============
  let plasmaField: THREE.Mesh | null = null // Основное плазменное поле (плоскость с шейдерными эффектами)
  let plasmaParticles: THREE.Points | null = null // Система мелких частиц, создающих глубину
  let glowParticles: THREE.Points | null = null // Более крупные светящиеся частицы для акцентов

  // ============ КОНСТАНТЫ НАСТРОЕК ============
  const COLOR_CYCLE_DURATION = 30 // Длительность полного цикла смены цветов в секундах
  const MIN_BRIGHTNESS = 0.05 // Минимальное значение яркости (ограничение для пользовательских настроек)
  const MAX_BRIGHTNESS = 0.3 // Максимальное значение яркости (ограничение для пользовательских настроек)

  /**
   * КОНФИГУРАЦИЯ ПЛАЗМЕННОГО ФОНА
   * Все настраиваемые параметры визуальных эффектов собраны в одном объекте
   */
  const PLASMA_CONFIG = {
    // Базовые цвета для циклического градиента (12 цветов радужного спектра)
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

    // Текущие активные цвета (4 цвета для плавного градиента в шейдерах)
    currentColors: [] as THREE.Color[],

    // ============ НАСТРОЙКИ ПЛАЗМЕННОГО ПОЛЯ ============
    fieldSize: 120, // Размер квадратного поля в единицах Three.js
    fieldDetail: 200, // Количество сегментов по каждой оси (детализация геометрии)
    fieldSpeed: 0.6, // Множитель скорости анимации волн
    fieldAmplitude: 5.0, // Амплитуда (высота) волн на поле

    // ============ НАСТРОЙКИ ЧАСТИЦ ПЛАЗМЫ ============
    particleCount: 12000, // Общее количество мелких частиц
    particleSize: 0.1, // Базовый размер частиц
    particleSpeed: 0.8, // Скорость движения частиц
    particleBrightness: 1.3, // Множитель яркости частиц

    // ============ НАСТРОЙКИ СВЕТЯЩИХСЯ ЧАСТИЦ ============
    glowParticleCount: 1000, // Количество крупных светящихся частиц
    glowParticleSize: 0.2, // Базовый размер светящихся частиц
    glowParticleSpeed: 0.5, // Скорость движения светящихся частиц
    glowParticleBrightness: 1.3, // Множитель яркости светящихся частиц

    // ============ ОБЩИЕ НАСТРОЙКИ ============
    brightness: 0.225, // Общая яркость сцены (влияет на плазменное поле)
    pulseIntensity: 0.1, // Интенсивность пульсации (ритмичное изменение масштаба)

    // ============ НАСТРОЙКИ АТМОСФЕРНЫХ ЭФФЕКТОВ ============
    fogDensity: 0.02, // Плотность тумана (создает эффект глубины)

    // ============ ФЛАГИ ВКЛЮЧЕНИЯ/ВЫКЛЮЧЕНИЯ ЭФФЕКТОВ ============
    enableWaves: true, // Включение волновой анимации на плазменном поле
    enablePulse: true, // Включение пульсации (ритмичное изменение масштаба)
    enableFlow: true, // Включение плавного течения цветов
    enableSwirl: true, // Включение вихревых эффектов
    enableColorCycle: true, // Включение автоматической циклической смены цветов
    enableMouseParallax: true, // Включение эффекта параллакса при движении мыши
    enableGyroParallax: true, // Включение эффекта параллакса при движении устройства
    enableCameraAutoMovement: true, // Включение автоматического движения камеры
  }

  /**
   * ДЕТЕКТИРОВАНИЕ УСТРОЙСТВА И ДАТЧИКОВ
   * Определяет тип устройства и доступность гироскопа/компаса
   */
  const detectDeviceAndSensors = () => {
    // Проверяем, является ли устройство мобильным
    isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )

    // Проверяем доступность гироскопа и компаса
    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS 13+ - требуется запрос разрешения
        isGyroAvailable = true
        isCompassAvailable = true
      } else if ('ondeviceorientation' in window) {
        // Android и другие устройства
        isGyroAvailable = true
        isCompassAvailable = true
      }
    }
  }

  /**
   * ИНИЦИАЛИЗАЦИЯ ТЕКУЩИХ ЦВЕТОВ
   * Выбирает 4 равномерно распределенных цвета из базовой палитры для создания градиента
   */
  const initColors = () => {
    PLASMA_CONFIG.currentColors = [
      PLASMA_CONFIG.baseColors[0].clone(), // Первый цвет (темно-синий)
      PLASMA_CONFIG.baseColors[3].clone(), // Четвертый цвет (бирюзовый)
      PLASMA_CONFIG.baseColors[6].clone(), // Седьмой цвет (оранжевый)
      PLASMA_CONFIG.baseColors[9].clone(), // Десятый цвет (фиолетовый)
    ]
  }

  /**
   * ЗАПРОС РАЗРЕШЕНИЯ НА ИСПОЛЬЗОВАНИЕ ДАТЧИКОВ (для iOS)
   */
  const requestGyroPermission = async (): Promise<boolean> => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === 'granted') {
          return true
        } else {
          console.warn('Permission for device orientation was denied')
          return false
        }
      } catch (error) {
        console.error('Error requesting device orientation permission:', error)
        return false
      }
    }
    // Для Android и других устройств разрешение не требуется
    return true
  }

  /**
   * ИНИЦИАЛИЗАЦИЯ ГИРОСКОПА И КОМПАСА
   */
  const initGyroscope = async () => {
    if (!isGyroAvailable || !isCompassAvailable || !PLASMA_CONFIG.enableGyroParallax) {
      return false
    }

    // Для iOS запрашиваем разрешение
    if (isMobileDevice) {
      const hasPermission = await requestGyroPermission()
      if (!hasPermission) {
        PLASMA_CONFIG.enableGyroParallax = false
        return false
      }
    }

    // Начальные значения
    deviceAlpha = 0
    deviceBeta = 0
    deviceGamma = 0
    targetDeviceAlpha = 0
    targetDeviceBeta = 0
    targetDeviceGamma = 0

    // Обработчик события изменения ориентации устройства
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (!PLASMA_CONFIG.enableGyroParallax) return

      // Значения могут быть null, поэтому проверяем
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        targetDeviceAlpha = event.alpha || 0
        targetDeviceBeta = event.beta || 0
        targetDeviceGamma = event.gamma || 0

        // Нормализуем значения для плавной работы
        if (targetDeviceBeta > 90) targetDeviceBeta = 90
        if (targetDeviceBeta < -90) targetDeviceBeta = -90
        if (targetDeviceGamma > 90) targetDeviceGamma = 90
        if (targetDeviceGamma < -90) targetDeviceGamma = -90
      }
    }

    // Добавляем обработчик
    window.addEventListener('deviceorientation', handleDeviceOrientation)

    // Сохраняем ссылку на обработчик для последующей очистки
    ;(window as any).__gyroHandler = handleDeviceOrientation

    isGyroInitialized = true

    return true
  }

  /**
   * ОБНОВЛЕНИЕ ПОЗИЦИИ МЫШИ (для десктопов)
   * Обрабатывает события движения мыши, преобразует абсолютные координаты в нормализованные
   *
   * @param event - Событие MouseEvent, содержащее координаты курсора
   */
  const updateMousePosition = (event: MouseEvent) => {
    // Проверяем, что контейнер существует и параллакс включен
    if (!containerRef.value || !PLASMA_CONFIG.enableMouseParallax || isMobileDevice)
      return

    // Получаем размеры и позицию контейнера относительно viewport
    const rect = containerRef.value.getBoundingClientRect()

    // Вычисляем абсолютные координаты относительно контейнера
    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.top

    // Преобразуем абсолютные координаты в нормализованные (-1 до 1)
    targetMouseX = (mouseX / rect.width) * 2 - 1
    targetMouseY = -(mouseY / rect.height) * 2 + 1
  }

  /**
   * ПЛАВНОЕ ОБНОВЛЕНИЕ ДАННЫХ ДАТЧИКОВ (для мобильных устройств)
   * Интерполирует текущие значения датчиков к целевым
   */
  const smoothGyroUpdate = () => {
    if (!isGyroInitialized || !PLASMA_CONFIG.enableGyroParallax) return

    // Линейная интерполяция значений датчиков
    deviceAlpha += (targetDeviceAlpha - deviceAlpha) * GYRO_SMOOTHING
    deviceBeta += (targetDeviceBeta - deviceBeta) * GYRO_SMOOTHING
    deviceGamma += (targetDeviceGamma - deviceGamma) * GYRO_SMOOTHING

    // Применяем мертвую зону для предотвращения дрожания
    if (Math.abs(deviceBeta) < GYRO_DEAD_ZONE) deviceBeta = 0
    if (Math.abs(deviceGamma) < GYRO_DEAD_ZONE) deviceGamma = 0
    if (Math.abs(deviceAlpha) < GYRO_DEAD_ZONE * 10) deviceAlpha = 0
  }

  /**
   * ПЛАВНОЕ ОБНОВЛЕНИЕ ПОЗИЦИИ МЫШИ И КАМЕРЫ (для десктопов)
   * Интерполирует текущую позицию мыши к целевой и обновляет позицию камеры для параллакса
   */
  const smoothMouseUpdate = () => {
    // Линейная интерполяция мышиных координат
    normalizedMouseX += (targetMouseX - normalizedMouseX) * PARALLAX_SMOOTHING
    normalizedMouseY += (targetMouseY - normalizedMouseY) * PARALLAX_SMOOTHING

    // Если параллакс включен и это не мобильное устройство, обновляем камеру
    if (PLASMA_CONFIG.enableMouseParallax && !isMobileDevice) {
      // Вычисляем смещение камеры на основе позиции мыши
      const parallaxX = normalizedMouseX * PARALLAX_INTENSITY * 8
      const parallaxY = normalizedMouseY * PARALLAX_INTENSITY * 4
      const parallaxZ = normalizedMouseY * PARALLAX_INTENSITY * 2

      // Устанавливаем целевую позицию камеры с учетом параллакса
      cameraTargetPosition.set(
        cameraBasePosition.x + parallaxX,
        cameraBasePosition.y + parallaxY,
        cameraBasePosition.z + parallaxZ,
      )

      // Плавно интерполируем текущую позицию камеры к целевой
      camera.position.lerp(cameraTargetPosition, PARALLAX_SMOOTHING)
    }
  }

  /**
   * ОБНОВЛЕНИЕ КАМЕРЫ ДЛЯ ГИРОСКОПА (для мобильных устройств)
   * Применяет вращение камеры на основе данных гироскопа и компаса
   */
  const updateCameraForGyro = () => {
    if (!isGyroInitialized || !PLASMA_CONFIG.enableGyroParallax || !isMobileDevice) return

    // Вычисляем углы вращения на основе данных датчиков
    // Используем gamma для вращения по оси Y (влево/вправо)
    // Используем beta для вращения по оси X (вверх/вниз)
    // Используем alpha для плавного вращения по оси Z (компас)

    const targetRotationY = -deviceGamma * GYRO_INTENSITY * 2 // Умножаем для более заметного эффекта
    const targetRotationX = -deviceBeta * GYRO_INTENSITY
    const targetRotationZ = -deviceAlpha * GYRO_INTENSITY * 0.1 // Медленное вращение по компасу

    // Устанавливаем целевое вращение
    cameraTargetRotation.set(targetRotationX, targetRotationY, targetRotationZ, 'YXZ')

    // Плавно интерполируем текущее вращение к целевому
    cameraCurrentRotation.x +=
      (cameraTargetRotation.x - cameraCurrentRotation.x) * GYRO_SMOOTHING
    cameraCurrentRotation.y +=
      (cameraTargetRotation.y - cameraCurrentRotation.y) * GYRO_SMOOTHING
    cameraCurrentRotation.z +=
      (cameraTargetRotation.z - cameraCurrentRotation.z) * GYRO_SMOOTHING

    // Применяем вращение к камере
    camera.rotation.copy(cameraCurrentRotation)
  }

  /**
   * ОБНОВЛЕНИЕ ЦИКЛА СМЕНЫ ЦВЕТОВ
   * Анимирует плавный переход между цветами по круговой палитре
   *
   * @param deltaTime - Время в секундах, прошедшее с последнего кадра
   */
  const updateColorCycle = (deltaTime: number) => {
    // Проверяем, включен ли цикл смены цветов
    if (!PLASMA_CONFIG.enableColorCycle) return

    // Увеличиваем общее время цикла
    colorCycleTime += deltaTime

    // Вычисляем прогресс цикла от 0 до 1
    const cycleProgress = (colorCycleTime % COLOR_CYCLE_DURATION) / COLOR_CYCLE_DURATION

    const totalColors = PLASMA_CONFIG.baseColors.length
    const progressPerColor = 1.0 / 4 // Делим цикл на 4 части (по одному цвету)

    // Обновляем каждый из 4 текущих цветов с смещением по фазе
    for (let i = 0; i < 4; i++) {
      // Вычисляем прогресс для текущего цвета со смещением
      const targetProgress = (cycleProgress + i * progressPerColor) % 1.0

      // Определяем индексы текущего и следующего цвета в палитре
      const colorIndex = Math.floor(targetProgress * (totalColors - 1))
      const nextIndex = (colorIndex + 1) % (totalColors - 1)

      // Коэффициент интерполяции между двумя цветами
      const lerpFactor = (targetProgress * (totalColors - 1)) % 1.0

      // Создаем новый цвет путем линейной интерполяции
      PLASMA_CONFIG.currentColors[i] = PLASMA_CONFIG.baseColors[colorIndex]
        .clone()
        .lerp(PLASMA_CONFIG.baseColors[nextIndex], lerpFactor)

      // Немного затемняем цвет для лучшего визуального восприятия
      PLASMA_CONFIG.currentColors[i].multiplyScalar(0.7)
    }

    // Обновляем uniform-переменные в шейдере плазменного поля
    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      plasmaField.material.uniforms.uColor1.value = PLASMA_CONFIG.currentColors[0]
      plasmaField.material.uniforms.uColor2.value = PLASMA_CONFIG.currentColors[1]
      plasmaField.material.uniforms.uColor3.value = PLASMA_CONFIG.currentColors[2]
      plasmaField.material.uniforms.uColor4.value = PLASMA_CONFIG.currentColors[3]
    }
  }

  /**
   * СОЗДАНИЕ ПЛАЗМЕННОГО ПОЛЯ
   * Создает геометрию плоскости и применяет к ней сложный шейдерный материал
   *
   * @returns THREE.Mesh - Объект меша с плазменным полем
   */
  const createPlasmaField = () => {
    // Создаем плоскость с заданными размерами и детализацией
    const geometry = new THREE.PlaneGeometry(
      PLASMA_CONFIG.fieldSize,
      PLASMA_CONFIG.fieldSize,
      PLASMA_CONFIG.fieldDetail,
      PLASMA_CONFIG.fieldDetail,
    )

    // ВЕРТЕКСНЫЙ ШЕЙДЕР (выполняется для каждой вершины)
    // Отвечает за преобразование позиций вершин, создание волн и эффектов
    const vertexShader = `
      varying vec2 vUv;                 // Передает UV-координаты во фрагментный шейдер
      varying vec3 vPosition;           // Передает позицию вершины во фрагментный шейдер
      varying float vWave;              // Значение волны для окрашивания
      uniform float uTime;              // Текущее время для анимации
      uniform float uAmplitude;         // Амплитуда волн
      uniform float uSpeed;             // Скорость анимации
      uniform bool uEnableWaves;        // Флаг включения волн
      uniform bool uEnableSwirl;        // Флаг включения вихревого эффекта

      void main() {
        vUv = uv;
        vPosition = position;

        vec3 newPosition = position;

        // Волновая анимация (несколько слоев с разными параметрами)
        if (uEnableWaves) {
          float wave1 = sin(position.x * 0.2 + uTime * uSpeed) *
                       cos(position.y * 0.15 + uTime * uSpeed * 0.8) * uAmplitude;

          float wave2 = sin(position.x * 0.35 + uTime * uSpeed * 1.3) *
                       cos(position.y * 0.25 + uTime * uSpeed * 1.1) * uAmplitude * 0.7;

          float wave3 = sin(position.x * 0.6 + position.y * 0.6 + uTime * uSpeed * 0.7) *
                       uAmplitude * 0.5;

          // Радиальные волны от центра
          float radius = length(position.xy);
          float wave4 = sin(radius * 0.12 + uTime * uSpeed * 0.4) * uAmplitude * 0.4;

          // Нормализованное значение волны для окрашивания
          vWave = (wave1 + wave2 + wave3 + wave4) / (uAmplitude * 3.0);

          // Применяем волны к Z-координате (высота)
          newPosition.z = wave1 + wave2 + wave3 + wave4;
        }

        // Вихревой эффект (вращение вокруг центра)
        if (uEnableSwirl) {
          float distanceFromCenter = length(position.xy);
          float swirl = sin(distanceFromCenter * 0.12 - uTime * uSpeed * 0.25) * 0.4;
          float angle = atan(position.y, position.x) + swirl;

          // Преобразование в полярные координаты с вращением
          newPosition.x = cos(angle) * distanceFromCenter;
          newPosition.y = sin(angle) * distanceFromCenter;
        }

        // Стандартное преобразование для рендеринга
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `

    // ФРАГМЕНТНЫЙ ШЕЙДЕР (выполняется для каждого пикселя)
    // Отвечает за цвет, текстуру и прозрачность
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

      // Функция псевдослучайного хеширования для шума
      float hash(vec2 p) {
        p = mod(p, 1000.0);
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      // Функция сглаженного шума
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

      // Фрактальный шум (сумма нескольких октав)
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

      // Основная функция плазменного эффекта
      float plasma(vec2 uv, float time) {
        float value = 0.0;

        // Добавляем несколько синусоидальных волн
        value += sin(uv.x * 3.0 + time * 0.8) * 0.5 + 0.5;
        value += sin(uv.y * 2.5 + time * 1.2) * 0.5 + 0.5;
        value += sin((uv.x + uv.y) * 1.5 + time * 0.5) * 0.5 + 0.5;

        // Добавляем фрактальный шум для органичности
        value += fractalNoise(uv * 1.2 + time * 0.2) * 0.3;

        // Радиальные волны
        float radius = length(uv);
        value += sin(radius * 2.5 - time * 1.0) * 0.2 + 0.2;

        // Нормализация и ограничение значения
        return clamp(value / 2.0, 0.0, 1.0);
      }

      void main() {
        // Анимированные UV-координаты
        vec2 animatedUV = vUv * 1.2 - 0.6;
        animatedUV.x += sin(uTime * 0.08) * 0.08;
        animatedUV.y += cos(uTime * 0.06) * 0.08;

        // Вычисляем значение плазмы
        float p = plasma(animatedUV, uTime * 0.3);

        // Эффект пульсации
        float pulse = 1.0;
        if (uEnablePulse) {
          pulse = 0.95 + sin(uTime * 1.0) * 0.05;
          p *= pulse;
        }

        // Интерполяция между 4 цветами на основе значения плазмы
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

        // Эффект свечения по краям
        float edge = 1.0 - smoothstep(0.0, 0.6, length(animatedUV));
        color += vec3(0.4, 0.3, 0.6) * edge * 0.15;

        // Добавление цвета на основе высоты волны
        color += vec3(0.2, 0.15, 0.3) * vWave * 0.15;

        // Применение общей яркости с ограничениями
        color *= clamp(uBrightness, ${MIN_BRIGHTNESS.toFixed(3)}, ${MAX_BRIGHTNESS.toFixed(3)});

        // Вычисление прозрачности (альфа-канал)
        float alpha = smoothstep(0.0, 0.6, p) * 0.5;
        alpha += edge * 0.08;

        gl_FragColor = vec4(color, alpha);
      }
    `

    // Инициализируем цвета перед созданием материала
    initColors()

    // Создаем шейдерный материал с custom шейдерами
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, // Текущее время
        uAmplitude: { value: PLASMA_CONFIG.fieldAmplitude }, // Амплитуда волн
        uSpeed: { value: PLASMA_CONFIG.fieldSpeed }, // Скорость анимации
        uBrightness: { value: PLASMA_CONFIG.brightness }, // Яркость
        uEnableWaves: { value: PLASMA_CONFIG.enableWaves }, // Флаг волн
        uEnablePulse: { value: PLASMA_CONFIG.enablePulse }, // Флаг пульсации
        uEnableSwirl: { value: PLASMA_CONFIG.enableSwirl }, // Флаг вихрей
        uColor1: { value: PLASMA_CONFIG.currentColors[0] }, // Цвет градиента 1
        uColor2: { value: PLASMA_CONFIG.currentColors[1] }, // Цвет градиента 2
        uColor3: { value: PLASMA_CONFIG.currentColors[2] }, // Цвет градиента 3
        uColor4: { value: PLASMA_CONFIG.currentColors[3] }, // Цвет градиента 4
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true, // Включаем прозрачность
      side: THREE.DoubleSide, // Отображаем обе стороны плоскости
      blending: THREE.AdditiveBlending, // Аддитивное смешение цветов
      depthWrite: false, // Отключаем запись глубины для прозрачных объектов
    })

    // Создаем меш из геометрии и материала
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = -8 // Смещаем вниз для лучшей композиции
    return mesh
  }

  /**
   * СОЗДАНИЕ СИСТЕМЫ ЧАСТИЦ ПЛАЗМЫ
   * Создает множество мелких частиц, которые окружают плазменное поле
   *
   * @returns THREE.Points - Система частиц
   */
  const createPlasmaParticles = () => {
    const particleCount = PLASMA_CONFIG.particleCount

    // Буферы для атрибутов частиц
    const positions = new Float32Array(particleCount * 3) // XYZ позиции
    const colors = new Float32Array(particleCount * 3) // RGB цвета
    const sizes = new Float32Array(particleCount) // Размеры
    const phases = new Float32Array(particleCount) // Фазы для анимации
    const colorPhases = new Float32Array(particleCount) // Фазы для цветового цикла

    for (let i = 0; i < particleCount; i++) {
      // Распределение частиц: 65% в передней зоне (ближе к камере), 35% в дальней
      const isFrontZone = Math.random() < 0.65

      let radius, theta, phi

      if (isFrontZone) {
        // Передняя зона: частицы ближе к камере, с bias по оси Z
        radius = 12 + Math.random() * 28
        phi = Math.acos(1 - Math.random() * 1.6) // Предпочтительно передняя полусфера
        theta = Math.random() * Math.PI * 2
        const zBias = 0.6 + Math.random() * 0.4

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta) * 0.9
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.9
        positions[i * 3 + 2] = radius * Math.cos(phi) * (1.3 + Math.random() * 0.4)
      } else {
        // Задняя зона: равномерное распределение по всей сфере
        radius = 22 + Math.random() * 40
        theta = Math.random() * Math.PI * 2
        phi = Math.acos(Math.random() * 2 - 1)

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)
      }

      // Назначение цвета на основе позиции в градиенте
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

      color.multiplyScalar(0.78) // Слегка затемняем

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      // Размер частицы зависит от расстояния до центра (уменьшается с расстоянием)
      const distanceFromCenter = Math.sqrt(
        positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2 + positions[i * 3 + 2] ** 2,
      )
      const sizeMultiplier = Math.max(0.6, 1.1 - distanceFromCenter / 80)
      sizes[i] = PLASMA_CONFIG.particleSize * (0.7 + Math.random() * 1.0) * sizeMultiplier

      // Случайные фазы для разнообразия анимации
      phases[i] = Math.random() * Math.PI * 2
      colorPhases[i] = Math.random()
    }

    // Создаем геометрию и добавляем атрибуты
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
    geometry.setAttribute('colorPhase', new THREE.BufferAttribute(colorPhases, 1))

    // Шейдерный материал для частиц
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
        uFrontBias: { value: 1.5 }, // Смещение для частиц в передней зоне
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

        // Функция получения цвета частицы на основе прогресса цикла
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
          // Получаем цвет с учетом фазового смещения
          float colorOffset = colorPhase * 0.3;
          vColor = getParticleColor(uCycleProgress, colorOffset);
          vColor *= uParticleBrightness;

          vec3 pos = position;
          float t = uTime * uSpeed + phase;

          // Определяем, насколько частица близка к камере
          float distanceFromCenter = length(position);
          float frontBiasFactor = smoothstep(30.0, 10.0, distanceFromCenter) * uFrontBias;

          // Орбитальное движение с учетом зоны
          float orbitSpeed = 0.08 + phase * 0.03;
          pos.x += sin(t * orbitSpeed * (1.0 + frontBiasFactor * 0.3)) * 0.3 * (1.0 + frontBiasFactor * 0.2);
          pos.y += cos(t * orbitSpeed * 0.8 * (1.0 + frontBiasFactor * 0.3)) * 0.25 * (1.0 + frontBiasFactor * 0.2);
          pos.z += sin(t * orbitSpeed * 0.6 * (1.0 + frontBiasFactor * 0.3)) * 0.2 * (1.0 + frontBiasFactor * 0.2);

          // Медленное вращение вокруг оси Y
          float angle = t * 0.15;
          float cosA = cos(angle);
          float sinA = sin(angle);
          float newX = pos.x * cosA - pos.z * sinA;
          float newZ = pos.x * sinA + pos.z * cosA;
          pos.x = newX;
          pos.z = newZ;

          // Стандартные преобразования с расчетом размера точки
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (220.0 / -mvPosition.z); // Перспективное масштабирование
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Создаем круглую форму частицы
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          // Отбрасываем пиксели за пределами круга
          if (dist > 0.5) {
            discard;
          }

          // Прозрачность уменьшается от центра к краям
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= 0.65;

          // Эффект свечения
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
   * Создает крупные частицы с сильным свечением для акцентных эффектов
   *
   * @returns THREE.Points - Система светящихся частиц
   */
  const createGlowParticles = () => {
    const particleCount = PLASMA_CONFIG.glowParticleCount

    // Буферы для атрибутов
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const colorPhases = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // 70% частиц в передней зоне, 30% в дальней
      const isFrontZone = Math.random() < 0.7

      let radius, theta, phi

      if (isFrontZone) {
        // Передняя зона: более плотное скопление
        radius = 6 + Math.random() * 18
        phi = Math.acos(1 - Math.random() * 1.4)
        theta = Math.random() * Math.PI * 2
        const zMultiplier = 1.3 + Math.random() * 0.3

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta) * 0.7
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.7
        positions[i * 3 + 2] = radius * Math.cos(phi) * zMultiplier
      } else {
        // Задняя зона: равномерное распределение
        radius = 12 + Math.random() * 25
        theta = Math.random() * Math.PI * 2
        phi = Math.acos(Math.random() * 2 - 1)

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)
      }

      // Случайный выбор одного из 4 цветов
      const colorIndex = Math.floor(Math.random() * 4)
      const color = PLASMA_CONFIG.currentColors[colorIndex].clone()
      color.multiplyScalar(1.04) // Слегка осветляем

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      // Размер зависит от позиции по Z (ближе = больше)
      const zPos = Math.abs(positions[i * 3 + 2])
      const sizeMultiplier = zPos < 15 ? 1.4 : 0.9

      sizes[i] =
        PLASMA_CONFIG.glowParticleSize * (0.8 + Math.random() * 1.0) * sizeMultiplier
      colorPhases[i] = Math.random()
    }

    // Создаем геометрию
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('colorPhase', new THREE.BufferAttribute(colorPhases, 1))

    // Шейдерный материал для светящихся частиц
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

          // Простое волнообразное движение
          vec3 pos = position;
          float t = uTime * uSpeed;

          pos.x += sin(t * 0.2 + position.y * 0.03) * 0.15;
          pos.y += cos(t * 0.18 + position.z * 0.03) * 0.15;
          pos.z += sin(t * 0.15 + position.x * 0.03) * 0.15;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (260.0 / -mvPosition.z); // Больший размер для свечения
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

          // Более сильное свечение с мягкими краями
          float alpha = pow(1.0 - dist * 2.0, 3.0);
          alpha *= 0.39;

          // Эффект сильного свечения
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
   * Устанавливает новое значение яркости с проверкой границ
   *
   * @param brightness - Новое значение яркости (0-1)
   */
  const updateBrightness = (brightness: number) => {
    // Ограничиваем значение между MIN и MAX
    PLASMA_CONFIG.brightness = Math.max(
      MIN_BRIGHTNESS,
      Math.min(MAX_BRIGHTNESS, brightness),
    )

    // Обновляем uniform в шейдере плазменного поля
    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      plasmaField.material.uniforms.uBrightness.value = PLASMA_CONFIG.brightness
    }
  }

  /**
   * ОБНОВЛЕНИЕ ЯРКОСТИ ЧАСТИЦ
   * Устанавливает новую яркость для всех частиц
   *
   * @param brightness - Новое значение яркости частиц
   */
  const updateParticleBrightness = (brightness: number) => {
    PLASMA_CONFIG.particleBrightness = brightness
    PLASMA_CONFIG.glowParticleBrightness = brightness

    // Обновляем uniforms в шейдерах частиц
    if (plasmaParticles?.material instanceof THREE.ShaderMaterial) {
      plasmaParticles.material.uniforms.uParticleBrightness.value = brightness
    }
    if (glowParticles?.material instanceof THREE.ShaderMaterial) {
      glowParticles.material.uniforms.uGlowBrightness.value = brightness
    }
  }

  /**
   * ПЕРЕКЛЮЧЕНИЕ ЭФФЕКТА ПАРАЛЛАКСА ОТ МЫШИ
   * Включает или выключает эффект параллакса от мыши
   *
   * @param enabled - true для включения, false для выключения
   */
  const toggleMouseParallax = (enabled: boolean) => {
    PLASMA_CONFIG.enableMouseParallax = enabled

    // Если параллакс выключен, возвращаем камеру в базовую позицию
    if (!enabled) {
      cameraTargetPosition.copy(cameraBasePosition)
    }
  }

  /**
   * ПЕРЕКЛЮЧЕНИЕ ЭФФЕКТА ПАРАЛЛАКСА ОТ ГИРОСКОПА
   * Включает или выключает эффект параллакса от гироскопа
   *
   * @param enabled - true для включения, false для выключения
   */
  const toggleGyroParallax = async (enabled: boolean) => {
    PLASMA_CONFIG.enableGyroParallax = enabled

    if (enabled && isMobileDevice && !isGyroInitialized) {
      await initGyroscope()
    }

    // Если гироскоп выключен, возвращаем камеру в исходное положение
    if (!enabled && isMobileDevice) {
      cameraTargetRotation.set(0, 0, 0, 'YXZ')
    }
  }

  /**
   * ОСНОВНОЙ ЦИКЛ АНИМАЦИИ
   * Вызывается на каждом кадре через requestAnimationFrame
   * Обновляет все анимированные параметры и рендерит сцену
   */
  const animate = () => {
    // Проверяем, активна ли анимация
    if (!isAnimationActive.value) {
      return
    }

    // Запрашиваем следующий кадр анимации
    animationFrameId = requestAnimationFrame(animate)

    // Фиксированный deltaTime для стабильной анимации
    const deltaTime = 16
    const deltaTimeSeconds = deltaTime * 0.001
    time += deltaTimeSeconds

    // Обновление данных в зависимости от типа устройства
    if (isMobileDevice && isGyroInitialized) {
      // Для мобильных устройств с гироскопом
      smoothGyroUpdate()
      updateCameraForGyro()
    } else {
      // Для десктопов или устройств без гироскопа
      smoothMouseUpdate()
    }

    // Обновление цикла цветов
    updateColorCycle(deltaTimeSeconds)

    // Прогресс цветового цикла для частиц
    const cycleProgress = (colorCycleTime % COLOR_CYCLE_DURATION) / COLOR_CYCLE_DURATION

    // Обновление uniform-переменных плазменного поля
    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      plasmaField.material.uniforms.uTime.value = time
    }

    // Обновление uniform-переменных частиц плазмы
    if (plasmaParticles?.material instanceof THREE.ShaderMaterial) {
      plasmaParticles.material.uniforms.uTime.value = time
      plasmaParticles.material.uniforms.uCycleProgress.value = cycleProgress

      // Передача текущих цветов в шейдер
      plasmaParticles.material.uniforms.uColors.value = [
        PLASMA_CONFIG.currentColors[0],
        PLASMA_CONFIG.currentColors[1],
        PLASMA_CONFIG.currentColors[2],
        PLASMA_CONFIG.currentColors[3],
      ]
    }

    // Обновление uniform-переменных светящихся частиц
    if (glowParticles?.material instanceof THREE.ShaderMaterial) {
      glowParticles.material.uniforms.uTime.value = time
      glowParticles.material.uniforms.uCycleProgress.value = cycleProgress
    }

    // Анимация плазменного поля
    if (plasmaField) {
      // Медленное вращение
      plasmaField.rotation.y += 0.0002 * PLASMA_CONFIG.fieldSpeed
      plasmaField.rotation.z += 0.0001 * PLASMA_CONFIG.fieldSpeed

      // Пульсация масштаба
      if (PLASMA_CONFIG.enablePulse) {
        const pulse = Math.sin(time * 0.8) * 0.02 + 1
        plasmaField.scale.setScalar(pulse)
      }
    }

    // Автоматическое движение камеры (если включено и не используется гироскоп)
    if (
      PLASMA_CONFIG.enableCameraAutoMovement &&
      !PLASMA_CONFIG.enableMouseParallax &&
      !(isMobileDevice && PLASMA_CONFIG.enableGyroParallax)
    ) {
      cameraBasePosition.x = Math.sin(time * 0.008) * 1.5
      cameraBasePosition.y = 5 + Math.cos(time * 0.006) * 0.5
      cameraBasePosition.z = 15 + Math.sin(time * 0.005) * 1
      cameraTargetPosition.copy(cameraBasePosition)
    }

    // Направление взгляда камеры (если не используется гироскоп)
    if (!(isMobileDevice && PLASMA_CONFIG.enableGyroParallax)) {
      camera.lookAt(0, -5, 0)
    }

    // Анимация точечного источника света
    const pointLight = scene.getObjectByName('mainPointLight') as THREE.PointLight
    if (pointLight && PLASMA_CONFIG.enablePulse) {
      pointLight.intensity = 0.4 + Math.sin(time * 0.6) * 0.08

      // Движение света по своей орбите
      pointLight.position.x = Math.sin(time * 0.04) * 4
      pointLight.position.y = 4 + Math.cos(time * 0.03) * 1.5
      pointLight.position.z = Math.cos(time * 0.035) * 4
    }

    // Рендеринг сцены
    renderer.render(scene, camera)
  }

  /**
   * ОСТАНОВКА АНИМАЦИИ
   * Отменяет requestAnimationFrame и деактивирует анимацию
   */
  const stopAnimation = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
    isAnimationActive.value = false
  }

  /**
   * ЗАПУСК АНИМАЦИИ
   * Активирует анимацию, если она еще не запущена
   */
  const startAnimation = () => {
    if (!isAnimationActive.value) {
      isAnimationActive.value = true
      animate()
    }
  }

  /**
   * ПРОВЕРКА ВИДИМОСТИ ЭЛЕМЕНТА ВО VIEWPORT
   * Определяет, находится ли контейнер в видимой области окна
   *
   * @returns boolean - true если элемент видим
   */
  const isElementInViewport = () => {
    if (!containerRef.value) return false

    const rect = containerRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const windowWidth = window.innerWidth || document.documentElement.clientWidth

    // Проверка вертикальной и горизонтальной видимости
    const vertInView = rect.top <= windowHeight && rect.bottom >= 0
    const horInView = rect.left <= windowWidth && rect.right >= 0

    return vertInView && horInView
  }

  /**
   * ОЧИСТКА РЕСУРСОВ
   * Освобождает память, удаляет слушатели событий и останавливает анимацию
   */
  const cleanup = () => {
    stopAnimation()

    // Удаление слушателя событий мыши
    if (containerRef.value) {
      containerRef.value.removeEventListener('mousemove', updateMousePosition)
    }

    // Удаление слушателя гироскопа
    if ((window as any).__gyroHandler) {
      window.removeEventListener('deviceorientation', (window as any).__gyroHandler)
      delete (window as any).__gyroHandler
    }

    // Отключение Intersection Observer
    if (intersectionObserver && containerRef.value) {
      intersectionObserver.unobserve(containerRef.value)
      intersectionObserver.disconnect()
      intersectionObserver = null
    }

    // Освобождение ресурсов плазменного поля
    if (plasmaField) {
      plasmaField.geometry.dispose()
      const material = plasmaField.material as THREE.ShaderMaterial
      material.dispose()
      scene.remove(plasmaField)
    }

    // Освобождение ресурсов частиц плазмы
    if (plasmaParticles) {
      plasmaParticles.geometry.dispose()
      const material = plasmaParticles.material as THREE.ShaderMaterial
      material.dispose()
      scene.remove(plasmaParticles)
    }

    // Освобождение ресурсов светящихся частиц
    if (glowParticles) {
      glowParticles.geometry.dispose()
      const material = glowParticles.material as THREE.ShaderMaterial
      material.dispose()
      scene.remove(glowParticles)
    }

    // Освобождение ресурсов рендерера и сцены
    if (renderer) {
      renderer.dispose()
    }
    if (scene) {
      scene.clear()
    }
  }

  /**
   * ИНИЦИАЛИЗАЦИЯ INTERSECTION OBSERVER
   * Настраивает наблюдение за видимостью элемента для автоматического управления анимацией
   */
  const initIntersectionObserver = () => {
    if (!containerRef.value) return

    intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAnimation() // Запуск анимации при появлении в viewport
          } else {
            stopAnimation() // Остановка анимации при скрытии
          }
        })
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // Срабатывает при 10% видимости
      },
    )

    intersectionObserver.observe(containerRef.value)
  }

  /**
   * ИНИЦИАЛИЗАЦИЯ THREE.JS
   * Создает сцену, камеру, рендерер и все графические объекты
   *
   * @returns Объект с методами управления анимацией
   */
  const initThreeJS = async () => {
    if (!containerRef.value) return

    // Детектируем устройство и датчики
    detectDeviceAndSensors()

    initColors()

    // Создание сцены с туманом
    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000011, 10, 60) // Темно-синий туман

    // Настройка камеры
    camera = new THREE.PerspectiveCamera(
      110, // Широкий угол обзора
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    cameraBasePosition.set(0, 5, 15)
    cameraTargetPosition.copy(cameraBasePosition)
    camera.position.copy(cameraBasePosition)

    // Инициализируем вращение камеры
    cameraTargetRotation.set(0, 0, 0, 'YXZ')
    cameraCurrentRotation.set(0, 0, 0, 'YXZ')

    // Для мобильных устройств с гироскопом не смотрим в центр
    if (!(isMobileDevice && PLASMA_CONFIG.enableGyroParallax)) {
      camera.lookAt(0, -5, 0)
    }

    // Создание WebGL рендерера
    renderer = new THREE.WebGLRenderer({
      antialias: true, // Сглаживание
      alpha: true, // Прозрачный фон
      powerPreference: 'high-performance', // Приоритет производительности
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Ограничение pixel ratio
    renderer.setClearColor(0x000011, 1) // Темно-синий фон

    // Настройка стилей canvas
    const canvas = renderer.domElement
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100dvh' // Динамическая высота viewport
    canvas.style.zIndex = '0'
    canvas.style.pointerEvents = 'auto' // Разрешаем события мыши
    containerRef.value.prepend(canvas) // Вставляем canvas в начало контейнера

    // Добавление слушателей событий в зависимости от типа устройства
    if (isMobileDevice) {
      // Для мобильных устройств инициализируем гироскоп
      if (PLASMA_CONFIG.enableGyroParallax && isGyroAvailable) {
        await initGyroscope()
      }
    } else {
      // Для десктопов добавляем слушатель мыши
      containerRef.value.addEventListener('mousemove', updateMousePosition)
    }

    // Создание освещения сцены
    const ambientLight = new THREE.AmbientLight(0x220099, 0.1) // Рассеянный свет
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x440099, 0.2) // Направленный свет
    directionalLight.position.set(3, 10, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x660099, 0.4, 80) // Точечный источник
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

    // Обработчик изменения размера окна
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Инициализация наблюдения за видимостью
    initIntersectionObserver()

    // Задержка перед проверкой видимости и запуском анимации
    setTimeout(() => {
      if (isElementInViewport()) {
        startAnimation()
      }
    }, 150)

    // Возвращаем объект с методами управления
    return {
      cleanup: () => {
        window.removeEventListener('resize', handleResize)
        if (containerRef.value && !isMobileDevice) {
          containerRef.value.removeEventListener('mousemove', updateMousePosition)
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
        // Масштабирование скорости для разных элементов
        PLASMA_CONFIG.fieldSpeed = value * 0.6
        PLASMA_CONFIG.particleSpeed = value * 0.8
        PLASMA_CONFIG.glowParticleSpeed = value * 0.5
      },
      updateColors: (colors: number[]) => {
        // Обновление базовой палитры цветов
        PLASMA_CONFIG.baseColors = colors.map(hex => new THREE.Color(hex))
        initColors()
      },
      toggleColorCycle: (enabled: boolean) => {
        PLASMA_CONFIG.enableColorCycle = enabled
      },
      toggleMouseParallax: (enabled: boolean) => {
        toggleMouseParallax(enabled)
      },
      toggleGyroParallax: async (enabled: boolean) => {
        await toggleGyroParallax(enabled)
      },
      toggleCameraAutoMovement: (enabled: boolean) => {
        PLASMA_CONFIG.enableCameraAutoMovement = enabled
      },
      updateCameraPosition: (x: number, y: number, z: number) => {
        cameraBasePosition.set(x, y, z)
        cameraTargetPosition.copy(cameraBasePosition)
        camera.position.copy(cameraBasePosition)

        // Только если не используется гироскоп
        if (!(isMobileDevice && PLASMA_CONFIG.enableGyroParallax)) {
          camera.lookAt(0, -5, 0)
        }
      },
      updateCameraFOV: (fov: number) => {
        camera.fov = fov
        camera.updateProjectionMatrix()
      },
      startAnimation: () => {
        startAnimation()
      },
      stopAnimation: () => {
        stopAnimation()
      },
      getDeviceInfo: () => ({
        isMobile: isMobileDevice,
        hasGyro: isGyroAvailable,
        hasCompass: isCompassAvailable,
        isGyroEnabled: PLASMA_CONFIG.enableGyroParallax && isGyroInitialized,
      }),
      getConfig: () => ({
        ...PLASMA_CONFIG,
        colorCycleDuration: COLOR_CYCLE_DURATION,
        minBrightness: MIN_BRIGHTNESS,
        maxBrightness: MAX_BRIGHTNESS,
        parallaxIntensity: PARALLAX_INTENSITY,
        gyroIntensity: GYRO_INTENSITY,
      }),
      setConfig: (config: Partial<typeof PLASMA_CONFIG>) => {
        // Частичное обновление конфигурации
        Object.assign(PLASMA_CONFIG, config)
        updateBrightness(PLASMA_CONFIG.brightness)
        updateParticleBrightness(PLASMA_CONFIG.particleBrightness)
      },
    }
  }

  // ============ HOOKS ЖИЗНЕННОГО ЦИКЛА VUE ============

  /**
   * МОНТИРОВАНИЕ КОМПОНЕНТА
   * Инициализирует Three.js сцену при монтировании компонента
   */
  let controls
  onMounted(async () => {
    controls = await initThreeJS()

    return controls
  })

  // Очистка при размонтировании компонента
  onUnmounted(() => {
    if (controls) {
      controls.cleanup()
    }
  })

  // ============ PUBLIC API ============
  // Методы, доступные компоненту, использующему этот хук

  return {
    /**
     * Обновление общей яркости сцены
     */
    updateBrightness,

    /**
     * Обновление яркости частиц
     */
    updateParticleBrightness,

    /**
     * Обновление скорости анимации
     */
    updateSpeed: (value: number) => {
      PLASMA_CONFIG.fieldSpeed = value * 0.6
      PLASMA_CONFIG.particleSpeed = value * 0.8
      PLASMA_CONFIG.glowParticleSpeed = value * 0.5
    },

    /**
     * Включение/выключение эффекта параллакса от мыши
     */
    toggleMouseParallax,

    /**
     * Включение/выключение эффекта параллакса от гироскопа
     */
    toggleGyroParallax: async (enabled: boolean) => {
      await toggleGyroParallax(enabled)
    },

    /**
     * Ручной запуск анимации
     */
    startAnimation,

    /**
     * Ручная остановка анимации
     */
    stopAnimation,

    /**
     * Получение информации об устройстве
     */
    getDeviceInfo: () => ({
      isMobile: isMobileDevice,
      hasGyro: isGyroAvailable,
      hasCompass: isCompassAvailable,
      isGyroEnabled: PLASMA_CONFIG.enableGyroParallax && isGyroInitialized,
    }),

    isAnimationActive,
  }
}
