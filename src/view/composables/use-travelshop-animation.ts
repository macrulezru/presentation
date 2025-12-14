import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import type { Ref } from 'vue'

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

// Реактивные константы для настройки анимации
export const useTravelshopConfig = () => {
  const config = ref({
    // Базовая высота канваса
    canvasInitHeight: 560,

    // Параметры безопасной зоны для центра эллипса (отступы от краёв канваса)
    safeZoneMargins: {
      horizontal: 100, // Отступ слева и справа
      vertical: 50, // Отступ сверху и снизу
    },

    // Самолет
    aircraft: {
      originalWidth: 433,
      originalHeight: 163,
      aspectRatio: 163 / 433, // ≈ 0.3765
      targetWidth: 190,
      animationDuration: 16000, // 16 секунд в миллисекундах
      // Эллиптическая траектория вокруг аэропорта
      airportEllipse: {
        horizontalRadius: 450, // Большая полуось (по X)
        verticalRadius: 80, // Малая полуось (по Y)
        centerYOffset: 20, // Смещение центра эллипса по Y относительно аэропорта
        centerXOffset: 0, // Смещение центра эллипса по X относительно аэропорта
      },
      // Эллиптическая траектория вокруг курсора
      mouseEllipse: {
        horizontalRadius: 200, // Большая полуось (по X) вокруг курсора
        verticalRadius: 100, // Малая полуось (по Y) вокруг курсора
        roundness: 0.8, // Круглость (1 = идеальный круг, <1 = эллипс)
      },
      // Наклон самолета
      tilt: {
        enabled: true,
        maxAngle: 0.4, // Максимальный угол наклона в радианах (~17 градусов)
        smoothFactor: 0.8, // Коэффициент сглаживания наклона (0-1)
      },
      // Плавный переход к курсору
      followMouse: {
        enabled: true, // Включить следование за курсором
        centerSmoothing: 0.05, // Коэффициент плавности перехода центра (0-1)
        ellipseSmoothing: 0.1, // Коэффициент плавности изменения размера эллипса (0-1)
        returnSpeed: 0.02, // Скорость возврата к исходной траектории при уходе курсора
      },
    },
    // Облако
    cloud: {
      originalWidth: 394,
      originalHeight: 237,
      aspectRatio: 237 / 394, // ≈ 0.6015
    },
    // Аэропорт
    airport: {
      originalWidth: 800,
      originalHeight: 472,
      aspectRatio: 472 / 800, // ≈ 0.59
      maxWidth: 600,
      initialMarginTop: 170,
    },
    // Настройки облаков
    clouds: {
      // Статические параметры облаков по слоям
      back: {
        minWidth: 30,
        maxWidth: 60,
        minSpeed: 10,
        maxSpeed: 20,
        adaptiveCountRatio: 60,
        minCount: 3,
        maxCount: 15,
      },
      middle: {
        minWidth: 60,
        maxWidth: 80,
        minSpeed: 15,
        maxSpeed: 25,
        adaptiveCountRatio: 120,
        minCount: 2,
        maxCount: 10,
      },
      front: {
        minWidth: 100,
        maxWidth: 130,
        minSpeed: 20,
        maxSpeed: 30,
        adaptiveCountRatio: 200,
        minCount: 1,
        maxCount: 5,
      },
      // Интервалы генерации новых облаков
      generationIntervals: {
        back: 10000, // 10 секунд
        middle: 6000, // 6 секунд
        front: 3000, // 3 секунды
      },
      // Диапазоны по Y для разных слоев (в процентах от высоты контейнера)
      yRanges: {
        back: { min: 0.05, max: 0.25 },
        middle: { min: 0.1, max: 0.35 },
        front: { min: 0.15, max: 0.45 },
      },
      // Прозрачность
      opacity: {
        back: { min: 0.2, max: 1 },
        middle: { min: 0.6, max: 1 },
        front: { min: 0.8, max: 1 },
      },
    },
  })

  // Функции для обновления конфигурации на лету
  const updateConfig = (newConfig: Partial<typeof config.value>) => {
    config.value = { ...config.value, ...newConfig }
  }

  return {
    config,
    updateConfig,
  }
}

export function useTravelshopCanvas(
  containerRef: Ref<HTMLElement | undefined>,
  externalConfig?: ReturnType<typeof useTravelshopConfig>['config'],
) {
  const canvasRef = ref<HTMLCanvasElement>()
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const animationId = ref<number>()
  const intervalIds = ref<number[]>([])

  // Используем внешнюю или создаем локальную конфигурацию
  const config = externalConfig || useTravelshopConfig().config

  // Изображения
  const images = {
    airport: new Image(),
    aircraft: new Image(),
    cloud: new Image(),
  }

  // Реальные размеры после загрузки
  const actualImageSizes = ref({
    airport: { width: 0, height: 0, aspectRatio: config.value.airport.aspectRatio },
    aircraft: { width: 0, height: 0, aspectRatio: config.value.aircraft.aspectRatio },
    cloud: { width: 0, height: 0, aspectRatio: config.value.cloud.aspectRatio },
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
    semiMajorAxis: config.value.aircraft.airportEllipse.horizontalRadius,
    semiMinorAxis: config.value.aircraft.airportEllipse.verticalRadius,
  })

  // Целевые параметры эллипса (зависят от того, есть ли курсор)
  const targetEllipse = ref({
    semiMajorAxis: config.value.aircraft.airportEllipse.horizontalRadius,
    semiMinorAxis: config.value.aircraft.airportEllipse.verticalRadius,
  })

  // Прогресс анимации самолета (0-1)
  const aircraftProgress = ref(0)

  // Самолет
  const aircraft = ref({
    x: 0,
    y: 0,
    width: config.value.aircraft.targetWidth,
    height: config.value.aircraft.targetWidth * config.value.aircraft.aspectRatio,
    // Анимация
    startTime: 0,
    animationStartTime: 0,
    isAnimating: false,
    // Наклон и отражение
    tiltAngle: 0, // Текущий угол наклона в радианах
    targetTiltAngle: 0, // Целевой угол наклона
    flipHorizontal: 1, // 1 = нормально, -1 = отражено по горизонтали
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
        horizontalRadius: containerSize.value.width * 0.5, // 50% ширины экрана
        verticalRadius: 60, // Уменьшаем вертикальный радиус
        centerYOffset: 10, // Меньше смещение для мобильных
      }
    } else if (containerSize.value.width < 1024) {
      // Для планшетов
      return {
        ...baseEllipse,
        horizontalRadius: containerSize.value.width * 0.4, // 40% ширины экрана
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
        horizontalRadius: 150, // Уменьшаем для мобильных
        verticalRadius: 75,
        roundness: 0.7, // Делаем более круглым для маленьких экранов
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
        horizontalRadius: containerSize.value.width * 0.35, // 35% ширины
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

  // Вычисление безопасной зоны для центра эллипса (ТОЛЬКО отступы из конфига)
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

  // Функция для установки отступов безопасной зоны
  const setSafeZoneMargins = (horizontal: number, vertical: number) => {
    config.value.safeZoneMargins.horizontal = horizontal
    config.value.safeZoneMargins.vertical = vertical
  }

  // Функция для сброса безопасной зоны к значениям по умолчанию
  const resetSafeZoneMargins = () => {
    config.value.safeZoneMargins.horizontal = 0
    config.value.safeZoneMargins.vertical = 0
  }

  // Ограничение позиции центра эллипса в пределах безопасной зоны
  const clampToSafeZone = (x: number, y: number) => {
    const bounds = safeZoneBounds.value
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
    }
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

    // Обновляем размер самолета из конфига (на случай изменения на лету)
    aircraft.value.width = config.value.aircraft.targetWidth
    aircraft.value.height =
      aircraft.value.width * actualImageSizes.value.aircraft.aspectRatio

    // Начинаем анимацию самолета
    aircraft.value.animationStartTime = Date.now()
    aircraft.value.isAnimating = true

    // Инициализация прогресса анимации
    aircraftProgress.value = 0

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

  // Обновление позиции самолета
  const updateAircraft = () => {
    if (!aircraft.value.isAnimating) return

    // Сохраняем предыдущую позицию для вычисления скорости
    const prevX = aircraft.value.x
    const prevY = aircraft.value.y

    // Обновляем центр и параметры эллипса
    updateEllipseCenter()
    updateEllipseParameters()

    // Обновляем прогресс анимации (всегда увеличивается)
    const elapsed = Date.now() - aircraft.value.animationStartTime
    aircraftProgress.value =
      (elapsed % config.value.aircraft.animationDuration) /
      config.value.aircraft.animationDuration

    // Угол на эллипсе (от 0 до 2π)
    const angle = aircraftProgress.value * 2 * Math.PI

    // Параметрическое уравнение эллипса относительно текущего центра
    aircraft.value.x =
      currentEllipseCenter.value.x + currentEllipse.value.semiMajorAxis * Math.cos(angle)
    aircraft.value.y =
      currentEllipseCenter.value.y + currentEllipse.value.semiMinorAxis * Math.sin(angle)

    // Вычисляем скорость для определения направления
    const velocityX = aircraft.value.x - prevX
    const velocityY = aircraft.value.y - prevY

    // Вычисляем угол направления движения
    const moveAngle = Math.atan2(velocityY, velocityX)

    // Определяем направление (отражаем если летит влево)
    aircraft.value.flipHorizontal = velocityX < 0 ? -1 : 1

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
    //drawDebugInfo()
  }

  // Отрисовка отладочной информации
  // @ts-ignore
  const drawDebugInfo = () => {
    if (!ctx.value) return

    ctx.value.save()

    // Отрисовываем текущий центр эллипса
    ctx.value.fillStyle = 'rgba(255, 0, 0, 0.5)'
    ctx.value.beginPath()
    ctx.value.arc(
      currentEllipseCenter.value.x,
      currentEllipseCenter.value.y,
      5,
      0,
      Math.PI * 2,
    )
    ctx.value.fill()

    // Отрисовываем центр аэропорта
    ctx.value.fillStyle = 'rgba(0, 255, 0, 0.5)'
    ctx.value.beginPath()
    ctx.value.arc(
      airportEllipseCenter.value.x,
      airportEllipseCenter.value.y,
      3,
      0,
      Math.PI * 2,
    )
    ctx.value.fill()

    // Отрисовываем безопасную зону (только отступы)
    ctx.value.strokeStyle = 'rgba(255, 0, 255, 0.3)'
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

    // Отрисовываем эллиптическую траекторию
    ctx.value.strokeStyle = 'rgba(255, 255, 0, 0.3)'
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
  const RESIZE_THROTTLE_DELAY = 100 // 100ms

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

  // Функция для обновления конфигурации на лету
  const updateConfig = (newConfig: Partial<typeof config.value>) => {
    Object.assign(config.value, newConfig)
  }

  // Функция для включения/выключения следования за мышью
  const setFollowMouseEnabled = (enabled: boolean) => {
    config.value.aircraft.followMouse.enabled = enabled
    if (!enabled) {
      // Возвращаем параметры к аэропорту
      updateTargetEllipseForAirport()
    }
  }

  return {
    canvasRef,
    allImagesLoaded,
    loading,
    config,
    updateConfig,
    recreateScene,
    setFollowMouseEnabled,
    setSafeZoneMargins,
    resetSafeZoneMargins,
    isMouseOverCanvas,
    mousePosition,
    currentEllipseCenter,
    airportEllipseCenter,
    safeZoneBounds,
    adaptiveAirportEllipse,
    adaptiveMouseEllipse,
    responsiveAirportEllipse,
    adaptiveCanvasHeight,
    adaptiveAirportMarginTop,
    adaptiveCloudsCount,
  }
}
