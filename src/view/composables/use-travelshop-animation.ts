import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import type { Ref } from 'vue'
import { useTravelshopIntroStore } from '@/stores/use-travelshop-intro-store'

// Импортируем изображения
import airportImageSrc from '@/view/assets/images/airport.png'
import aircraftImageSrc from '@/view/assets/images/aircraft.png'
import cloudImageSrc from '@/view/assets/images/cloud.png'

interface Cloud {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  layer: 'back' | 'middle' | 'front'
  seed: number
  actualWidth: number
  actualHeight: number
}

export function useTravelshopCanvas(containerRef: Ref<HTMLElement | undefined>) {
  const canvasRef = ref<HTMLCanvasElement>()
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const animationId = ref<number>()
  const intervalIds = ref<number[]>([])

  // Используем Pinia стор
  const travelshopStore = useTravelshopIntroStore()
  const config = computed(() => travelshopStore.config)

  // Изображения
  const images = {
    airport: new Image(),
    aircraft: new Image(),
    cloud: new Image(),
  }

  // Реальные размеры после загрузки
  const actualImageSizes = ref({
    airport: { width: 0, height: 0, aspectRatio: 0 },
    aircraft: { width: 0, height: 0, aspectRatio: 0 },
    cloud: { width: 0, height: 0, aspectRatio: 0 },
  })

  // Размеры контейнера (реактивные, обновляются при ресайзе)
  const containerSize = ref({ width: 0, height: 0 })

  // Центрированные координаты для сцены
  const sceneCenter = ref({ x: 0, y: 0 })

  // Элементы сцены
  const clouds = ref<Cloud[]>([])

  // Позиция курсора мыши
  const mousePosition = ref<{ x: number; y: number } | null>(null)
  const isMouseOverCanvas = ref(false)

  // Текущий центр эллипса (плавно стремится к целевому)
  const currentEllipseCenter = ref({ x: 0, y: 0 })

  // Исходный центр аэропорта (для возврата при уходе курсора)
  const airportEllipseCenter = ref({ x: 0, y: 0 })

  // Текущие параметры эллипса (плавно изменяются)
  const currentEllipse = ref({
    semiMajorAxis: 0,
    semiMinorAxis: 0,
  })

  // Целевые параметры эллипса (зависят от того, есть ли курсор)
  const targetEllipse = ref({
    semiMajorAxis: 0,
    semiMinorAxis: 0,
  })

  // Текущий угол самолета на эллипсе (в радианах, от 0 до 2π)
  const aircraftAngle = ref(0)

  // Направление вращения (1 = по часовой, -1 = против часовой)
  const rotationDirection = ref(1)

  // Текущая скорость самолета
  const aircraftVelocity = ref({ x: 0, y: 0 })

  // История позиций для вычисления скорости
  const aircraftPositionHistory = ref<{ x: number; y: number; time: number }[]>([])
  const MAX_HISTORY_LENGTH = 10

  // Для гистерезиса и стабилизации
  const directionChangeState = ref({
    lastDirectionChangeTime: 0,
    currentCrossValue: 0,
    smoothedCrossValue: 0,
    lastStableCrossValue: 0,
    isChanging: false,
    changeStartTime: 0,
    lastStableDirection: 1,
    angleHistory: [] as number[],
    angleBufferSize: 5,
  })

  // Время последнего обновления анимации (для дельта-времени)
  const lastAnimationUpdateTime = ref(Date.now())

  // Самолет
  const aircraft = ref({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    startTime: 0,
    animationStartTime: 0,
    isAnimating: false,
    tiltAngle: 0,
    targetTiltAngle: 0,
    flipHorizontal: 1,
  })

  // Состояние загрузки
  const loading = ref({
    airport: false,
    aircraft: false,
    cloud: false,
  })

  const allImagesLoaded = ref(false)

  // Адаптивная высота канваса
  const adaptiveCanvasHeight = computed(() => {
    if (!containerSize.value.width) return config.value.canvasInitHeight

    if (config.value.airport.maxWidth > containerSize.value.width - 60) {
      return containerSize.value.width / 1.12
    } else {
      return config.value.canvasInitHeight
    }
  })

  // Адаптивный отступ аэропорта
  const adaptiveAirportMarginTop = computed(() => {
    if (!containerSize.value.width) return config.value.airport.initialMarginTop

    if (config.value.airport.maxWidth > containerSize.value.width - 60) {
      return containerSize.value.width / 3.2
    } else {
      return config.value.airport.initialMarginTop
    }
  })

  // Адаптивные параметры эллипса аэропорта
  const adaptiveAirportEllipse = computed(() => {
    if (!containerSize.value.width) return config.value.aircraft.airportEllipse

    const baseEllipse = config.value.aircraft.airportEllipse

    // Пример логики адаптации - можно настроить под свои нужды
    if (containerSize.value.width < 768) {
      // Для мобильных устройств уменьшаем радиусы
      return {
        ...baseEllipse,
        horizontalRadius: containerSize.value.width * 0.5,
        verticalRadius: 60,
        centerYOffset: 10,
      }
    } else if (containerSize.value.width < 1024) {
      // Для планшетов
      return {
        ...baseEllipse,
        horizontalRadius: containerSize.value.width * 0.4,
        verticalRadius: 70,
        centerYOffset: 15,
      }
    } else {
      // Для десктопов возвращаем значения по умолчанию
      return baseEllipse
    }
  })

  // Адаптивные параметры эллипса курсора
  const adaptiveMouseEllipse = computed(() => {
    if (!containerSize.value.width) return config.value.aircraft.mouseEllipse

    const baseEllipse = config.value.aircraft.mouseEllipse

    // Аналогичная логика адаптации
    if (containerSize.value.width < 768) {
      return {
        ...baseEllipse,
        horizontalRadius: 150,
        verticalRadius: 75,
        roundness: 0.7,
      }
    } else if (containerSize.value.width < 1024) {
      return {
        ...baseEllipse,
        horizontalRadius: 180,
        verticalRadius: 90,
        roundness: 0.8,
      }
    } else {
      return baseEllipse
    }
  })

  // Комбинированный вариант - проверка как в adaptiveCanvasHeight
  const responsiveAirportEllipse = computed(() => {
    if (!containerSize.value.width) return config.value.aircraft.airportEllipse

    const baseEllipse = config.value.aircraft.airportEllipse

    // Используем ту же логику, что и для высоты канваса
    if (config.value.airport.maxWidth > containerSize.value.width - 60) {
      // Для узких экранов уменьшаем траекторию
      return {
        ...baseEllipse,
        horizontalRadius: containerSize.value.width * 0.35,
        verticalRadius: 60,
        centerYOffset: 15,
      }
    } else {
      return baseEllipse
    }
  })

  // Адаптивное количество облаков для каждого слоя
  const adaptiveCloudsCount = computed(() => {
    if (!containerSize.value.width) {
      return {
        back: config.value.clouds.back.minCount,
        middle: config.value.clouds.middle.minCount,
        front: config.value.clouds.front.minCount,
      }
    }

    const calculateCount = (
      containerWidth: number,
      ratio: number,
      minCount: number,
      maxCount: number,
    ) => {
      const rawCount = Math.floor(containerWidth / ratio)
      return Math.max(minCount, Math.min(maxCount, rawCount))
    }

    return {
      back: calculateCount(
        containerSize.value.width,
        config.value.clouds.back.adaptiveCountRatio,
        config.value.clouds.back.minCount,
        config.value.clouds.back.maxCount,
      ),
      middle: calculateCount(
        containerSize.value.width,
        config.value.clouds.middle.adaptiveCountRatio,
        config.value.clouds.middle.minCount,
        config.value.clouds.middle.maxCount,
      ),
      front: calculateCount(
        containerSize.value.width,
        config.value.clouds.front.adaptiveCountRatio,
        config.value.clouds.front.minCount,
        config.value.clouds.front.maxCount,
      ),
    }
  })

  // Вычисление безопасной зоны для центра эллипса
  const safeZoneBounds = computed(() => {
    const margins = config.value.safeZoneMargins

    // Если канвас еще не инициализирован, возвращаем границы по умолчанию
    if (containerSize.value.width === 0 || containerSize.value.height === 0) {
      return {
        minX: margins.horizontal,
        maxX: margins.horizontal,
        minY: margins.vertical,
        maxY: margins.vertical,
      }
    }

    const bounds = {
      minX: margins.horizontal,
      maxX: containerSize.value.width - margins.horizontal,
      minY: margins.vertical,
      maxY: containerSize.value.height - margins.vertical,
    }

    // Проверяем, чтобы min не было больше max (если отступы больше половины размера)
    if (bounds.minX > bounds.maxX) {
      const centerX = (bounds.minX + bounds.maxX) / 2
      bounds.minX = centerX
      bounds.maxX = centerX
    }

    if (bounds.minY > bounds.maxY) {
      const centerY = (bounds.minY + bounds.maxY) / 2
      bounds.minY = centerY
      bounds.maxY = centerY
    }

    return bounds
  })

  // Ограничение позиции центра эллипса в пределах безопасной зоны
  const clampToSafeZone = (x: number, y: number) => {
    const bounds = safeZoneBounds.value
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
    }
  }

  // Вычисление скорости самолета
  const updateAircraftVelocity = () => {
    const now = Date.now()

    // Добавляем текущую позицию в историю
    aircraftPositionHistory.value.push({
      x: aircraft.value.x,
      y: aircraft.value.y,
      time: now,
    })

    // Ограничиваем длину истории
    if (aircraftPositionHistory.value.length > MAX_HISTORY_LENGTH) {
      aircraftPositionHistory.value.shift()
    }

    // Вычисляем скорость только если есть достаточно точек истории
    if (aircraftPositionHistory.value.length >= 2) {
      const oldest = aircraftPositionHistory.value[0]
      const newest =
        aircraftPositionHistory.value[aircraftPositionHistory.value.length - 1]

      if (!oldest || !newest) return

      const dt = (newest.time - oldest.time) / 1000 // в секундах

      if (dt > 0) {
        aircraftVelocity.value = {
          x: (newest.x - oldest.x) / dt,
          y: (newest.y - oldest.y) / dt,
        }
      }
    }
  }

  // Определение направления движения самолета (вправо/влево)
  const getAircraftMoveDirection = (): number => {
    const velocityThreshold = config.value.aircraft.directionChange.minVelocityThreshold

    if (Math.abs(aircraftVelocity.value.x) > velocityThreshold) {
      return aircraftVelocity.value.x > 0 ? 1 : -1
    }

    // Если скорость слишком мала, используем текущее направление вращения
    return rotationDirection.value
  }

  // Проверка, находится ли самолет в критической точке
  const isInCriticalPoint = (angle: number): boolean => {
    const criticalAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI * 2]
    const buffer = config.value.aircraft.directionChange.hysteresis.angleBuffer

    for (const criticalAngle of criticalAngles) {
      const diff = Math.abs(angle - criticalAngle)
      const normalizedDiff = Math.min(diff, Math.PI * 2 - diff)

      if (normalizedDiff < buffer) {
        return true
      }
    }

    return false
  }

  // Улучшенное определение направления вращения с гистерезисом
  const determineRotationDirection = (): number => {
    if (!config.value.aircraft.directionChange.enabled) {
      return rotationDirection.value
    }

    // Определяем текущее направление движения самолета
    const moveDirection = getAircraftMoveDirection()

    // Если курсор не на канвасе, используем текущее направление
    if (!isMouseOverCanvas.value || !mousePosition.value) {
      directionChangeState.value.lastStableDirection = rotationDirection.value
      return rotationDirection.value
    }

    // Определяем, с какой стороны от вектора движения находится курсор
    const aircraftPos = { x: aircraft.value.x, y: aircraft.value.y }
    const mousePos = { x: mousePosition.value.x, y: mousePosition.value.y }

    // Вычисляем вектор скорости
    const velocity = aircraftVelocity.value

    // Если скорость слишком мала, не меняем направление
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
    if (speed < config.value.aircraft.directionChange.minVelocityThreshold) {
      return rotationDirection.value
    }

    // Вектор от самолета к курсору
    const toMouse = {
      x: mousePos.x - aircraftPos.x,
      y: mousePos.y - aircraftPos.y,
    }

    // Вычисляем расстояние от самолета до курсора
    const distanceToMouse = Math.sqrt(toMouse.x * toMouse.x + toMouse.y * toMouse.y)

    // Если курсор слишком близко, не меняем направление
    const minDistance =
      currentEllipse.value.semiMajorAxis *
      config.value.aircraft.directionChange.minDistanceFactor
    if (distanceToMouse < minDistance) {
      return rotationDirection.value
    }

    // Вычисляем векторное произведение
    const rawCross = velocity.x * toMouse.y - velocity.y * toMouse.x
    const normalizationFactor = speed * distanceToMouse
    const normalizedCross = normalizationFactor > 0 ? rawCross / normalizationFactor : 0

    // Обновляем историю угла
    directionChangeState.value.angleHistory.push(aircraftAngle.value)
    if (
      directionChangeState.value.angleHistory.length >
      directionChangeState.value.angleBufferSize
    ) {
      directionChangeState.value.angleHistory.shift()
    }

    // Проверяем, не находимся ли мы в критической точке
    const avgAngle =
      directionChangeState.value.angleHistory.reduce((a, b) => a + b, 0) /
      directionChangeState.value.angleHistory.length
    const inCriticalPoint = isInCriticalPoint(avgAngle)

    // Применяем сглаживание к cross значению
    directionChangeState.value.currentCrossValue = normalizedCross
    const smoothingFactor = config.value.aircraft.directionChange.smoothing.factor
    directionChangeState.value.smoothedCrossValue +=
      (normalizedCross - directionChangeState.value.smoothedCrossValue) * smoothingFactor

    // Ограничиваем максимальное изменение за кадр
    const maxChange = config.value.aircraft.directionChange.smoothing.maxChangePerFrame
    const diff =
      directionChangeState.value.smoothedCrossValue -
      directionChangeState.value.lastStableCrossValue
    if (Math.abs(diff) > maxChange) {
      directionChangeState.value.smoothedCrossValue =
        directionChangeState.value.lastStableCrossValue + Math.sign(diff) * maxChange
    }

    // Применяем мертвую зону
    const deadZone = config.value.aircraft.directionChange.hysteresis.deadZone
    if (Math.abs(directionChangeState.value.smoothedCrossValue) < deadZone) {
      return rotationDirection.value
    }

    // Определяем желаемое направление вращения
    let desiredDirection = rotationDirection.value

    if (moveDirection === 1) {
      // Самолет движется вправо
      if (directionChangeState.value.smoothedCrossValue > 0) {
        desiredDirection = 1
      } else {
        desiredDirection = -1
      }
    } else {
      // Самолет движется влево
      if (directionChangeState.value.smoothedCrossValue < 0) {
        desiredDirection = -1
      } else {
        desiredDirection = 1
      }
    }

    // Применяем гистерезис
    const now = Date.now()
    const timeSinceLastChange = now - directionChangeState.value.lastDirectionChangeTime
    const minTimeBetweenChanges =
      config.value.aircraft.directionChange.hysteresis.timeDelay

    // Если находимся в критической точке, увеличиваем порог смены
    const hysteresisThreshold = inCriticalPoint
      ? config.value.aircraft.directionChange.hysteresis.threshold * 2
      : config.value.aircraft.directionChange.hysteresis.threshold

    // Проверяем, достаточно ли велико отклонение для смены направления
    const crossDeviation = Math.abs(directionChangeState.value.smoothedCrossValue)

    if (desiredDirection !== rotationDirection.value) {
      // Хотим сменить направление
      if (
        crossDeviation > hysteresisThreshold &&
        timeSinceLastChange > minTimeBetweenChanges
      ) {
        // Достаточное отклонение и прошло достаточно времени
        directionChangeState.value.lastDirectionChangeTime = now
        directionChangeState.value.lastStableCrossValue =
          directionChangeState.value.smoothedCrossValue
        directionChangeState.value.lastStableDirection = desiredDirection

        // Просто меняем направление вращения без изменения угла
        rotationDirection.value = desiredDirection

        return desiredDirection
      }
    } else {
      // Хотим сохранить текущее направление
      directionChangeState.value.lastStableCrossValue =
        directionChangeState.value.smoothedCrossValue
    }

    // Если находимся в критической точке, используем последнее стабильное направление
    if (inCriticalPoint) {
      return directionChangeState.value.lastStableDirection
    }

    return rotationDirection.value
  }

  // Обработчики событий мыши
  const handleMouseMove = (event: MouseEvent) => {
    if (!canvasRef.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    // Преобразуем координаты мыши в координаты канваса
    const x = (event.clientX - rect.left) * (canvasRef.value.width / rect.width / dpr)
    const y = (event.clientY - rect.top) * (canvasRef.value.height / rect.height / dpr)

    mousePosition.value = { x, y }
  }

  const handleMouseEnter = () => {
    isMouseOverCanvas.value = true
    // Сбрасываем некоторые состояния при входе курсора
    directionChangeState.value.angleHistory = []

    // Устанавливаем целевые параметры эллипса для курсора
    updateTargetEllipseForMouse()
  }

  const handleMouseLeave = () => {
    isMouseOverCanvas.value = false
    mousePosition.value = null

    // Возвращаем целевые параметры эллипса к аэропорту
    updateTargetEllipseForAirport()
  }

  // Обновление целевых параметров эллипса для курсора
  const updateTargetEllipseForMouse = () => {
    if (!config.value.aircraft.followMouse.enabled) return

    // Получаем адаптивные параметры эллипса для курсора
    const mouseEllipse = adaptiveMouseEllipse.value

    const mouseHorizontal = mouseEllipse.horizontalRadius
    const mouseVertical = mouseEllipse.verticalRadius

    // Применяем круглость для более круглой траектории
    const roundness = mouseEllipse.roundness
    const baseRadius = Math.min(mouseHorizontal, mouseVertical)

    targetEllipse.value.semiMajorAxis =
      baseRadius + (mouseHorizontal - baseRadius) * roundness
    targetEllipse.value.semiMinorAxis =
      baseRadius + (mouseVertical - baseRadius) * roundness
  }

  // Обновление целевых параметров эллипса для аэропорта
  const updateTargetEllipseForAirport = () => {
    // Используем адаптивные значения эллипса аэропорта
    const ellipse = adaptiveAirportEllipse.value

    targetEllipse.value.semiMajorAxis = ellipse.horizontalRadius
    targetEllipse.value.semiMinorAxis = ellipse.verticalRadius
  }

  // Загрузка изображений
  const loadImages = async (): Promise<void> => {
    return new Promise(resolve => {
      let loadedCount = 0
      const totalImages = Object.keys(images).length

      const onImageLoad = () => {
        loadedCount++
        if (loadedCount === totalImages) {
          allImagesLoaded.value = true
          resolve()
        }
      }

      images.airport.onload = () => {
        const width = images.airport.naturalWidth || config.value.airport.originalWidth
        const height = images.airport.naturalHeight || config.value.airport.originalHeight
        actualImageSizes.value.airport = {
          width,
          height,
          aspectRatio: height / width,
        }
        loading.value.airport = true
        onImageLoad()
      }
      images.airport.onerror = () => {
        console.error('Failed to load airport image')
        onImageLoad()
      }
      images.airport.src = airportImageSrc

      images.aircraft.onload = () => {
        const width = images.aircraft.naturalWidth || config.value.aircraft.originalWidth
        const height =
          images.aircraft.naturalHeight || config.value.aircraft.originalHeight
        const aspectRatio = height / width
        actualImageSizes.value.aircraft = {
          width,
          height,
          aspectRatio,
        }
        aircraft.value.height = aircraft.value.width * aspectRatio
        loading.value.aircraft = true
        onImageLoad()
      }
      images.aircraft.onerror = () => {
        console.error('Failed to load aircraft image')
        onImageLoad()
      }
      images.aircraft.src = aircraftImageSrc

      images.cloud.onload = () => {
        const width = images.cloud.naturalWidth || config.value.cloud.originalWidth
        const height = images.cloud.naturalHeight || config.value.cloud.originalHeight
        actualImageSizes.value.cloud = {
          width,
          height,
          aspectRatio: height / width,
        }
        loading.value.cloud = true
        onImageLoad()
      }
      images.cloud.onerror = () => {
        console.error('Failed to load cloud image')
        onImageLoad()
      }
      images.cloud.src = cloudImageSrc
    })
  }

  // Инициализация Canvas
  const initCanvas = (): boolean => {
    if (!canvasRef.value || !containerRef.value) return false

    const canvas = canvasRef.value
    const container = containerRef.value

    const rect = container.getBoundingClientRect()
    if (rect.width === 0) return false

    // Обновляем размеры контейнера
    containerSize.value = {
      width: rect.width,
      height: adaptiveCanvasHeight.value,
    }

    sceneCenter.value = {
      x: rect.width / 2,
      y: adaptiveCanvasHeight.value / 2,
    }

    // Рассчитываем размеры и позицию аэропорта
    const airportWidth = Math.min(config.value.airport.maxWidth, rect.width - 100)
    const airportX = sceneCenter.value.x - airportWidth / 2
    const airportY = adaptiveAirportMarginTop.value

    // Используем адаптивные значения эллипса аэропорта
    const ellipse = adaptiveAirportEllipse.value

    // Центр эллипса совпадает с центром аэропорта по X, с возможным смещением
    airportEllipseCenter.value.x = airportX + airportWidth / 2 + ellipse.centerXOffset

    // Центр эллипса по Y - ниже аэропорта на заданное смещение
    airportEllipseCenter.value.y = airportY + ellipse.centerYOffset

    // Проверяем, находится ли центр аэропорта в пределах безопасной зоны
    // Если нет - корректируем его, но сохраняем смещение относительно аэропорта
    const safeAirportCenter = clampToSafeZone(
      airportEllipseCenter.value.x,
      airportEllipseCenter.value.y,
    )
    airportEllipseCenter.value.x = safeAirportCenter.x
    airportEllipseCenter.value.y = safeAirportCenter.y

    // Инициализируем текущий центр как центр аэропорта
    currentEllipseCenter.value = { ...airportEllipseCenter.value }

    // Инициализируем параметры эллипса
    currentEllipse.value.semiMajorAxis = ellipse.horizontalRadius
    currentEllipse.value.semiMinorAxis = ellipse.verticalRadius

    targetEllipse.value.semiMajorAxis = ellipse.horizontalRadius
    targetEllipse.value.semiMinorAxis = ellipse.verticalRadius

    // Инициализируем направление вращения из конфига
    rotationDirection.value = config.value.aircraft.rotationDirection

    // Обновляем размер самолета из конфига
    aircraft.value.width = config.value.aircraft.targetWidth
    aircraft.value.height =
      aircraft.value.width * actualImageSizes.value.aircraft.aspectRatio

    // Начинаем анимацию самолета
    aircraft.value.animationStartTime = Date.now()
    aircraft.value.isAnimating = true

    // Инициализируем угол самолета
    aircraftAngle.value = 0
    lastAnimationUpdateTime.value = Date.now()

    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = adaptiveCanvasHeight.value * dpr

    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${adaptiveCanvasHeight.value}px`

    ctx.value = canvas.getContext('2d', { alpha: true })

    if (ctx.value) {
      ctx.value.scale(dpr, dpr)
      ctx.value.imageSmoothingEnabled = true
      ctx.value.imageSmoothingQuality = 'high'
    }

    return true
  }

  // Создание начальных облаков
  const createInitialClouds = () => {
    // Используем вычисляемые значения количества облаков
    const { back, middle, front } = adaptiveCloudsCount.value

    for (let i = 0; i < back; i++) {
      createCloud('back', true)
    }

    for (let i = 0; i < middle; i++) {
      createCloud('middle', true)
    }

    for (let i = 0; i < front; i++) {
      createCloud('front', true)
    }
  }

  // Создание облака
  const createCloud = (layer: 'back' | 'middle' | 'front', isPreWarm = false) => {
    const { width: containerWidth, height: containerHeight } = containerSize.value
    const cloudAspectRatio = actualImageSizes.value.cloud.aspectRatio
    const configCloud = config.value.clouds[layer]
    const yRange = config.value.clouds.yRanges[layer]
    const opacityRange = config.value.clouds.opacity[layer]

    // Проверяем, не превышено ли максимальное количество облаков в этом слое
    const currentLayerCloudsCount = clouds.value.filter(c => c.layer === layer).length
    const maxCloudsInLayer = adaptiveCloudsCount.value[layer]

    if (currentLayerCloudsCount >= maxCloudsInLayer) {
      return // Не создаем новое облако, если достигнут лимит
    }

    // Ширина облака
    const cloudWidth =
      Math.random() * (configCloud.maxWidth - configCloud.minWidth) + configCloud.minWidth
    const cloudHeight = cloudWidth * cloudAspectRatio

    // Позиция Y (в процентах от высоты контейнера)
    const yPercent = Math.random() * (yRange.max - yRange.min) + yRange.min
    const y = containerHeight * yPercent

    const cloud: Cloud = {
      x: isPreWarm ? Math.random() * containerWidth : containerWidth + Math.random() * 50,
      y,
      size: cloudWidth,
      speed:
        Math.random() * (configCloud.maxSpeed - configCloud.minSpeed) +
        configCloud.minSpeed,
      opacity: Math.random() * (opacityRange.max - opacityRange.min) + opacityRange.min,
      layer,
      seed: Math.random(),
      actualWidth: cloudWidth,
      actualHeight: cloudHeight,
    }

    clouds.value.push(cloud)
  }

  // Обновление позиций облаков
  const updateClouds = () => {
    // Удаляем облака, которые ушли за левую границу
    const cloudsToRemove: Cloud[] = []

    clouds.value.forEach(cloud => {
      cloud.x -= cloud.speed / 60

      if (cloud.x < -cloud.actualWidth * 2) {
        cloudsToRemove.push(cloud)
      }
    })

    // Удаляем облака, которые ушли за границу
    clouds.value = clouds.value.filter(cloud => !cloudsToRemove.includes(cloud))
  }

  // Обновление центра эллипса
  const updateEllipseCenter = () => {
    if (!config.value.aircraft.followMouse.enabled) {
      // Просто держим центр на аэропорте (с учётом безопасной зоны)
      const safeAirportCenter = clampToSafeZone(
        airportEllipseCenter.value.x,
        airportEllipseCenter.value.y,
      )
      currentEllipseCenter.value = { ...safeAirportCenter }
      return
    }

    if (isMouseOverCanvas.value && mousePosition.value) {
      // Курсор на канвасе - плавно смещаем центр к курсору
      // Сначала ограничиваем позицию курсора безопасной зоной
      const safeMousePos = clampToSafeZone(mousePosition.value.x, mousePosition.value.y)

      // Плавная интерполяция к безопасной позиции курсора
      const smoothing = config.value.aircraft.followMouse.centerSmoothing
      currentEllipseCenter.value.x +=
        (safeMousePos.x - currentEllipseCenter.value.x) * smoothing
      currentEllipseCenter.value.y +=
        (safeMousePos.y - currentEllipseCenter.value.y) * smoothing

      // Дополнительно ограничиваем (на всякий случай)
      const safeCurrent = clampToSafeZone(
        currentEllipseCenter.value.x,
        currentEllipseCenter.value.y,
      )
      currentEllipseCenter.value.x = safeCurrent.x
      currentEllipseCenter.value.y = safeCurrent.y
    } else {
      // Курсор ушел - плавно возвращаемся к центру аэропорта
      const returnSpeed = config.value.aircraft.followMouse.returnSpeed

      // Получаем безопасную позицию аэропорта
      const safeAirportCenter = clampToSafeZone(
        airportEllipseCenter.value.x,
        airportEllipseCenter.value.y,
      )

      currentEllipseCenter.value.x +=
        (safeAirportCenter.x - currentEllipseCenter.value.x) * returnSpeed
      currentEllipseCenter.value.y +=
        (safeAirportCenter.y - currentEllipseCenter.value.y) * returnSpeed

      // Ограничиваем текущую позицию безопасной зоной
      const safeCurrent = clampToSafeZone(
        currentEllipseCenter.value.x,
        currentEllipseCenter.value.y,
      )
      currentEllipseCenter.value.x = safeCurrent.x
      currentEllipseCenter.value.y = safeCurrent.y
    }
  }

  // Обновление параметров эллипса
  const updateEllipseParameters = () => {
    if (!config.value.aircraft.followMouse.enabled) {
      // Если следование за мышью отключено, используем адаптивные параметры аэропорта
      const ellipse = adaptiveAirportEllipse.value
      currentEllipse.value.semiMajorAxis = ellipse.horizontalRadius
      currentEllipse.value.semiMinorAxis = ellipse.verticalRadius
      return
    }

    // Плавная интерполяция текущих параметров к целевым
    const smoothing = config.value.aircraft.followMouse.ellipseSmoothing
    currentEllipse.value.semiMajorAxis +=
      (targetEllipse.value.semiMajorAxis - currentEllipse.value.semiMajorAxis) * smoothing
    currentEllipse.value.semiMinorAxis +=
      (targetEllipse.value.semiMinorAxis - currentEllipse.value.semiMinorAxis) * smoothing
  }

  // Обновление позиции самолета с учетом направления вращения
  const updateAircraft = () => {
    if (!aircraft.value.isAnimating) return

    // Сохраняем предыдущую позицию для вычисления скорости
    const prevX = aircraft.value.x
    const prevY = aircraft.value.y

    // Обновляем центр и параметры эллипса
    updateEllipseCenter()
    updateEllipseParameters()

    // Обновляем угол самолета на основе времени и направления
    const now = Date.now()
    const deltaTime = now - lastAnimationUpdateTime.value
    lastAnimationUpdateTime.value = now

    // Угловая скорость (радиан в миллисекунду)
    const angularSpeed = (2 * Math.PI) / config.value.aircraft.animationDuration

    // Обновляем угол с учетом направления
    aircraftAngle.value += rotationDirection.value * angularSpeed * deltaTime

    // Нормализуем угол в диапазон [0, 2π)
    aircraftAngle.value =
      ((aircraftAngle.value % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

    // Обновляем скорость самолета
    updateAircraftVelocity()

    // Определяем направление вращения на основе положения курсора
    if (config.value.aircraft.directionChange.enabled) {
      rotationDirection.value = determineRotationDirection()
    }

    // Вычисляем позицию самолета на эллипсе
    aircraft.value.x =
      currentEllipseCenter.value.x +
      currentEllipse.value.semiMajorAxis * Math.cos(aircraftAngle.value)
    aircraft.value.y =
      currentEllipseCenter.value.y +
      currentEllipse.value.semiMinorAxis * Math.sin(aircraftAngle.value)

    // Вычисляем скорость для наклона
    const velocityX = aircraft.value.x - prevX
    const velocityY = aircraft.value.y - prevY

    // Вычисляем угол направления движения
    const moveAngle = Math.atan2(velocityY, velocityX)

    // Определяем направление (отражаем если летит влево)
    aircraft.value.flipHorizontal = velocityX > 0 ? 1 : -1

    // Вычисляем угол наклона для самолета
    let targetAngle = 0
    if (config.value.aircraft.tilt.enabled) {
      // Для отраженного самолета корректируем угол
      if (aircraft.value.flipHorizontal === -1) {
        // Когда самолет летит влево, нужно инвертировать угол
        targetAngle = -moveAngle
      } else {
        // Когда самолет летит вправо
        targetAngle = moveAngle
      }

      // Корректируем угол чтобы он был в правильном диапазоне
      // Нормализуем угол к диапазону [-π/2, π/2]
      if (targetAngle > Math.PI / 2) {
        targetAngle -= Math.PI
      } else if (targetAngle < -Math.PI / 2) {
        targetAngle += Math.PI
      }

      // Ограничиваем максимальный угол наклона
      if (targetAngle > config.value.aircraft.tilt.maxAngle) {
        targetAngle = config.value.aircraft.tilt.maxAngle
      } else if (targetAngle < -config.value.aircraft.tilt.maxAngle) {
        targetAngle = -config.value.aircraft.tilt.maxAngle
      }
    }

    // Плавный переход к целевому углу
    aircraft.value.targetTiltAngle = targetAngle
    aircraft.value.tiltAngle +=
      (aircraft.value.targetTiltAngle - aircraft.value.tiltAngle) *
      config.value.aircraft.tilt.smoothFactor
  }

  // Вспомогательная функция для рисования стрелок
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    options: {
      color?: string
      lineWidth?: number
      arrowLength?: number
      arrowAngle?: number
      dash?: number[]
    } = {},
  ) => {
    const {
      color = 'white',
      lineWidth = 1,
      arrowLength = 10,
      arrowAngle = Math.PI / 6,
      dash = [],
    } = options

    ctx.save()
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = lineWidth

    if (dash.length > 0) {
      ctx.setLineDash(dash)
    }

    // Линия
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()

    // Стрелка
    const angle = Math.atan2(toY - fromY, toX - fromX)

    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle - arrowAngle),
      toY - arrowLength * Math.sin(angle - arrowAngle),
    )
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle + arrowAngle),
      toY - arrowLength * Math.sin(angle + arrowAngle),
    )
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  // Отрисовка сцены
  const drawScene = () => {
    if (!ctx.value || !allImagesLoaded.value) return

    const canvas = canvasRef.value
    if (!canvas) return

    ctx.value.clearRect(
      0,
      0,
      canvas.width / window.devicePixelRatio,
      canvas.height / window.devicePixelRatio,
    )

    // 1. Задний слой облаков
    drawCloudLayer('back')

    // 2. Средний слой облаков
    drawCloudLayer('middle')

    // 3. Аэропорт
    drawAirport()

    // 4. Самолет
    drawAircraft()

    // 5. Передний слой облаков
    drawCloudLayer('front')

    // Отладка: отрисовка текущего центра эллипса и траектории (опционально)
    if (travelshopStore.showDebugControls) {
      drawDebugInfo()
    }
  }

  // Отрисовка отладочной информации
  const drawDebugInfo = () => {
    if (!ctx.value) return

    ctx.value.save()

    // 1. Отрисовываем текущий центр эллипса
    ctx.value.fillStyle = 'rgba(255, 0, 0, 0.8)'
    ctx.value.beginPath()
    ctx.value.arc(
      currentEllipseCenter.value.x,
      currentEllipseCenter.value.y,
      5,
      0,
      Math.PI * 2,
    )
    ctx.value.fill()

    // 2. Отрисовываем центр аэропорта
    ctx.value.fillStyle = 'rgba(0, 255, 0, 0.8)'
    ctx.value.beginPath()
    ctx.value.arc(
      airportEllipseCenter.value.x,
      airportEllipseCenter.value.y,
      3,
      0,
      Math.PI * 2,
    )
    ctx.value.fill()

    // 3. Отрисовываем безопасную зону
    ctx.value.strokeStyle = 'rgba(255, 0, 255, 0.5)'
    ctx.value.lineWidth = 1
    ctx.value.setLineDash([5, 5])
    const bounds = safeZoneBounds.value
    ctx.value.strokeRect(
      bounds.minX,
      bounds.minY,
      bounds.maxX - bounds.minX,
      bounds.maxY - bounds.minY,
    )
    ctx.value.setLineDash([])

    // 4. Отрисовываем эллиптическую траекторию
    ctx.value.strokeStyle = 'rgba(255, 255, 0, 0.8)'
    ctx.value.lineWidth = 1
    ctx.value.beginPath()

    const steps = 100
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI
      const x =
        currentEllipseCenter.value.x +
        currentEllipse.value.semiMajorAxis * Math.cos(angle)
      const y =
        currentEllipseCenter.value.y +
        currentEllipse.value.semiMinorAxis * Math.sin(angle)

      if (i === 0) {
        ctx.value.moveTo(x, y)
      } else {
        ctx.value.lineTo(x, y)
      }
    }
    ctx.value.closePath()
    ctx.value.stroke()

    // 5. Вектор движения самолета (скорость)
    const velocityLength = Math.sqrt(
      aircraftVelocity.value.x * aircraftVelocity.value.x +
        aircraftVelocity.value.y * aircraftVelocity.value.y,
    )

    if (velocityLength > 0.1) {
      // Нормализованный вектор скорости
      const normVX = aircraftVelocity.value.x / velocityLength
      const normVY = aircraftVelocity.value.y / velocityLength

      // Длина стрелки (пропорциональна скорости, но не меньше минимума)
      const arrowLength = Math.max(40, Math.min(100, velocityLength * 2))

      // Цвет в зависимости от скорости
      const speedColor =
        velocityLength > 10 ? '#ff4444' : velocityLength > 5 ? '#ffaa00' : '#44ff44'

      drawArrow(
        ctx.value,
        aircraft.value.x,
        aircraft.value.y,
        aircraft.value.x + normVX * arrowLength,
        aircraft.value.y + normVY * arrowLength,
        {
          color: speedColor,
          lineWidth: 2,
          arrowLength: 10,
          arrowAngle: Math.PI / 6,
        },
      )

      // Подпись скорости у стрелки
      ctx.value.fillStyle = speedColor
      ctx.value.font = '12px Arial'
      ctx.value.fillText(
        `${velocityLength.toFixed(1)} px/s`,
        aircraft.value.x + normVX * arrowLength + 5,
        aircraft.value.y + normVY * arrowLength - 5,
      )
    }

    // 6. Вектор от самолета к курсору (если курсор в пределах канваса)
    if (isMouseOverCanvas.value && mousePosition.value) {
      const dx = mousePosition.value.x - aircraft.value.x
      const dy = mousePosition.value.y - aircraft.value.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 10) {
        drawArrow(
          ctx.value,
          aircraft.value.x,
          aircraft.value.y,
          mousePosition.value.x,
          mousePosition.value.y,
          {
            color: 'rgba(0, 150, 255, 0.7)',
            lineWidth: 1.5,
            arrowLength: 8,
            arrowAngle: Math.PI / 6,
            dash: [5, 3],
          },
        )

        // Подпись расстояния
        ctx.value.fillStyle = 'rgba(0, 150, 255, 0.9)'
        ctx.value.font = '11px Arial'
        ctx.value.fillText(
          `${Math.round(distance)} px`,
          (aircraft.value.x + mousePosition.value.x) / 2 + 10,
          (aircraft.value.y + mousePosition.value.y) / 2 - 10,
        )
      }
    }

    // 7. Вектор нормали (перпендикуляр к скорости) для визуализации cross product
    if (velocityLength > 0.1) {
      // Нормализованный вектор скорости
      const normVX = aircraftVelocity.value.x / velocityLength
      const normVY = aircraftVelocity.value.y / velocityLength

      // Перпендикулярный вектор (поворот на 90 градусов по часовой стрелке)
      const perpX = normVY
      const perpY = -normVX

      // Длина нормали (пропорциональна cross значению)
      const crossValue = directionChangeState.value.smoothedCrossValue
      const normalLength = 30 * Math.abs(crossValue)

      if (normalLength > 2) {
        const normalColor =
          crossValue > 0 ? 'rgba(0, 200, 0, 0.7)' : 'rgba(255, 50, 50, 0.7)'

        drawArrow(
          ctx.value,
          aircraft.value.x,
          aircraft.value.y,
          aircraft.value.x + perpX * normalLength,
          aircraft.value.y + perpY * normalLength,
          {
            color: normalColor,
            lineWidth: 1.5,
            arrowLength: 6,
            arrowAngle: Math.PI / 6,
          },
        )

        // Подпись cross значения
        ctx.value.fillStyle = normalColor
        ctx.value.font = '10px Arial'
        ctx.value.fillText(
          `cross: ${crossValue.toFixed(3)}`,
          aircraft.value.x + perpX * normalLength + 5,
          aircraft.value.y + perpY * normalLength,
        )
      }
    }

    // 8. Отрисовываем направление вращения
    ctx.value.fillStyle =
      rotationDirection.value === 1 ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)'
    ctx.value.font = '14px Arial'
    ctx.value.fillText(
      rotationDirection.value === 1 ? '↻' : '↺',
      currentEllipseCenter.value.x + 10,
      currentEllipseCenter.value.y - 10,
    )

    // 9. Отладочный текст в углу
    const speed = velocityLength
    const angleDeg = ((aircraftAngle.value * 180) / Math.PI).toFixed(1)
    const isCritical = isInCriticalPoint(aircraftAngle.value)
    const moveDirection = getAircraftMoveDirection()

    ctx.value.fillStyle = 'white'
    ctx.value.font = '12px Arial'
    ctx.value.textAlign = 'left'
    ctx.value.fillText(
      `Направление: ${rotationDirection.value === 1 ? 'По часовой' : 'Против часовой'}`,
      10,
      20,
    )
    ctx.value.fillText(`Скорость: ${speed.toFixed(2)} px/s`, 10, 40)
    ctx.value.fillText(`Угол: ${angleDeg}°`, 10, 60)
    ctx.value.fillText(
      `Cross: ${directionChangeState.value.smoothedCrossValue.toFixed(3)}`,
      10,
      80,
    )
    ctx.value.fillText(`Движение: ${moveDirection > 0 ? 'Вправо' : 'Влево'}`, 10, 100)
    ctx.value.fillText(`Крит.точка: ${isCritical ? 'ДА' : 'нет'}`, 10, 120)
    ctx.value.fillText(
      `Наклон: ${((aircraft.value.tiltAngle * 180) / Math.PI).toFixed(1)}°`,
      10,
      140,
    )
    ctx.value.fillText(
      `Отражение: ${aircraft.value.flipHorizontal === 1 ? 'Нет' : 'Да'}`,
      10,
      160,
    )

    // 10. Позиция самолета
    ctx.value.fillText(
      `Позиция: (${Math.round(aircraft.value.x)}, ${Math.round(aircraft.value.y)})`,
      10,
      180,
    )

    // 11. Позиция курсора (если есть)
    if (mousePosition.value) {
      ctx.value.fillStyle = 'rgba(0, 150, 255, 0.9)'
      ctx.value.fillText(
        `Курсор: (${Math.round(mousePosition.value.x)}, ${Math.round(mousePosition.value.y)})`,
        10,
        200,
      )
    }

    ctx.value.restore()
  }

  // Отрисовка слоя облаков
  const drawCloudLayer = (layer: 'back' | 'middle' | 'front') => {
    if (!ctx.value || !images.cloud.complete) return

    const layerClouds = clouds.value.filter(cloud => cloud.layer === layer)

    layerClouds.forEach(cloud => {
      ctx.value!.save()
      ctx.value!.globalAlpha = cloud.opacity

      const rotation = Math.sin(cloud.seed * 10 + Date.now() * 0.001) * 0.1

      ctx.value!.translate(
        cloud.x + cloud.actualWidth / 2,
        cloud.y + cloud.actualHeight / 2,
      )
      ctx.value!.rotate(rotation)

      ctx.value!.drawImage(
        images.cloud,
        -cloud.actualWidth / 2,
        -cloud.actualHeight / 2,
        cloud.actualWidth,
        cloud.actualHeight,
      )

      ctx.value!.restore()
    })
  }

  // Отрисовка аэропорта
  const drawAirport = () => {
    if (!ctx.value || !images.airport.complete) return

    const airportImg = images.airport
    const { width: containerWidth } = containerSize.value
    const { x: centerX } = sceneCenter.value

    const airportAspectRatio = actualImageSizes.value.airport.aspectRatio
    const maxWidth = Math.min(config.value.airport.maxWidth, containerWidth - 40)
    const width = maxWidth
    const height = width * airportAspectRatio

    const x = centerX - width / 2
    const y = adaptiveAirportMarginTop.value

    ctx.value.save()
    ctx.value.shadowColor = 'rgba(131, 76, 5, 0.3)'
    ctx.value.shadowBlur = 15
    ctx.value.shadowOffsetY = 10

    ctx.value.drawImage(airportImg, x, y, width, height)

    ctx.value.restore()
  }

  // Отрисовка самолета с наклоном и отражением
  const drawAircraft = () => {
    if (!ctx.value || !images.aircraft.complete) return

    ctx.value.save()

    // Перемещаем контекст к позиции самолета
    ctx.value.translate(aircraft.value.x, aircraft.value.y)

    // Применяем отражение по горизонтали если нужно
    if (aircraft.value.flipHorizontal === -1) {
      ctx.value.scale(-1, 1)
    }

    // Применяем наклон (вращение)
    ctx.value.rotate(aircraft.value.tiltAngle)

    // Рисуем самолет (центрируем)
    ctx.value.drawImage(
      images.aircraft,
      -aircraft.value.width / 2,
      -aircraft.value.height / 2,
      aircraft.value.width,
      aircraft.value.height,
    )

    ctx.value.restore()
  }

  // Запуск генерации облаков
  const startCloudGeneration = () => {
    stopCloudGeneration()

    Object.entries(config.value.clouds.generationIntervals).forEach(
      ([layer, interval]) => {
        const id = window.setInterval(() => {
          // Считаем сколько облаков сейчас в этом слое
          const currentCount = clouds.value.filter(c => c.layer === layer).length
          const maxCount = adaptiveCloudsCount.value[layer as 'back' | 'middle' | 'front']

          // Добавляем только если не достигнут максимум
          if (currentCount < maxCount) {
            createCloud(layer as 'back' | 'middle' | 'front')
          }
        }, interval)
        intervalIds.value.push(id)
      },
    )
  }

  // Остановка генерации облаков
  const stopCloudGeneration = () => {
    intervalIds.value.forEach(id => clearInterval(id))
    intervalIds.value = []
  }

  // Основной цикл анимации
  const animate = () => {
    if (!allImagesLoaded.value) {
      animationId.value = requestAnimationFrame(animate)
      return
    }

    updateClouds()
    updateAircraft()
    drawScene()

    animationId.value = requestAnimationFrame(animate)
  }

  // Пересоздание сцены при изменении размеров или конфигурации
  const recreateScene = () => {
    if (!allImagesLoaded.value) return

    stopAnimation()

    if (initCanvas()) {
      clouds.value = []
      createInitialClouds()
      startCloudGeneration()
      animate()
    }
  }

  // Троттлинг для обработки изменения размеров
  let resizeThrottleTimeout: number | undefined
  let lastResizeCall = 0
  const RESIZE_THROTTLE_DELAY = 100

  const throttleResize = () => {
    const now = Date.now()

    // Если прошло меньше времени, чем задержка, откладываем вызов
    if (now - lastResizeCall < RESIZE_THROTTLE_DELAY) {
      if (resizeThrottleTimeout) {
        clearTimeout(resizeThrottleTimeout)
      }
      resizeThrottleTimeout = window.setTimeout(() => {
        lastResizeCall = Date.now()
        recreateScene()
      }, RESIZE_THROTTLE_DELAY)
      return
    }

    // Иначе выполняем сразу
    lastResizeCall = now
    recreateScene()
  }

  // Запуск анимации
  const startAnimation = () => {
    if (!allImagesLoaded.value) return

    if (initCanvas()) {
      createInitialClouds()
      startCloudGeneration()
      animate()
    }
  }

  // Остановка анимации
  const stopAnimation = () => {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
    stopCloudGeneration()
    clouds.value = []
    aircraft.value.isAnimating = false
    aircraft.value.tiltAngle = 0
    aircraft.value.flipHorizontal = 1
    aircraftAngle.value = 0
  }

  // Инициализация
  onMounted(async () => {
    await loadImages()

    if (allImagesLoaded.value) {
      nextTick(() => {
        startAnimation()
      })
    }

    // Добавляем обработчики событий мыши
    const canvas = canvasRef.value
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mouseenter', handleMouseEnter)
      canvas.addEventListener('mouseleave', handleMouseLeave)
    }

    window.addEventListener('resize', throttleResize)
  })

  onUnmounted(() => {
    // Удаляем обработчики событий мыши
    const canvas = canvasRef.value
    if (canvas) {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseenter', handleMouseEnter)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }

    stopAnimation()
    window.removeEventListener('resize', throttleResize)
    if (resizeThrottleTimeout) {
      clearTimeout(resizeThrottleTimeout)
    }
  })

  // Watch для контейнера
  watch(containerRef, newContainer => {
    if (newContainer && allImagesLoaded.value) {
      recreateScene()
    }
  })

  // Watch для конфигурации (если изменяется на лету)
  watch(
    () => config.value,
    () => {
      if (allImagesLoaded.value) {
        // Обновляем направление вращения из конфига
        rotationDirection.value = config.value.aircraft.rotationDirection

        // Обновляем целевые параметры эллипса в зависимости от состояния курсора
        if (isMouseOverCanvas.value) {
          updateTargetEllipseForMouse()
        } else {
          updateTargetEllipseForAirport()
        }
        recreateScene()
      }
    },
    { deep: true },
  )

  // Watch для адаптивных эллипсов
  watch(
    [adaptiveAirportEllipse, adaptiveMouseEllipse],
    () => {
      if (allImagesLoaded.value) {
        if (isMouseOverCanvas.value) {
          updateTargetEllipseForMouse()
        } else {
          updateTargetEllipseForAirport()
        }
      }
    },
    { deep: true },
  )

  return {
    canvasRef,
    allImagesLoaded,
    loading,
    recreateScene,
    isMouseOverCanvas,
    mousePosition,
    currentEllipseCenter,
    airportEllipseCenter,
    safeZoneBounds,
    rotationDirection,
    aircraftAngle,
    aircraftVelocity,
    adaptiveAirportEllipse,
    adaptiveMouseEllipse,
    responsiveAirportEllipse,
    adaptiveCanvasHeight,
    adaptiveAirportMarginTop,
    adaptiveCloudsCount,

    // Дебаг-контролы из стора
    showDebugControls: computed(() => travelshopStore.showDebugControls),
    debugParams: computed(() => travelshopStore.debugParams),
    debugCategories: computed(() => travelshopStore.debugCategories),
    toggleDebugControls: travelshopStore.toggleDebugControls,
    updateDebugParam: travelshopStore.updateDebugParam,
    getParamsByCategory: travelshopStore.getParamsByCategory,
    resetToDefaults: travelshopStore.resetToDefaults,

    // Методы управления из стора
    setFollowMouseEnabled: travelshopStore.setFollowMouseEnabled,
    setAutoRotationDirection: travelshopStore.setAutoRotationDirection,
    setRotationDirection: travelshopStore.setRotationDirection,
    toggleRotationDirection: travelshopStore.toggleRotationDirection,
    setSafeZoneMargins: travelshopStore.setSafeZoneMargins,
  }
}
