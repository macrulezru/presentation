// composables/useTravelshopCanvas.ts
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
    // Высота канваса
    canvasInitHeight: 560,
    canvasHeight: 560,

    // Самолет
    aircraft: {
      originalWidth: 433,
      originalHeight: 163,
      aspectRatio: 163 / 433, // ≈ 0.3765
      targetWidth: 190,
      animationDuration: 16000, // 16 секунд в миллисекундах
      // Эллиптическая траектория
      ellipse: {
        horizontalOffset: 120, // Отступ по горизонтали от краев аэропорта
        verticalAmplitude: 60, // Амплитуда по вертикали
        centerYOffset: 0, // Смещение центра эллипса по Y относительно аэропорта
        centerXOffset: 0, // Смещение центра эллипса по X относительно аэропорта
      },
      // Наклон самолета
      tilt: {
        enabled: true,
        maxAngle: 0.3, // Максимальный угол наклона в радианах (~17 градусов)
        smoothFactor: 0.8, // Коэффициент сглаживания наклона (0-1)
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
      marginTop: 170,
    },
    // Настройки облаков
    clouds: {
      // Количество облаков по слоям
      back: { count: 10, minWidth: 30, maxWidth: 60, minSpeed: 10, maxSpeed: 20 },
      middle: { count: 5, minWidth: 60, maxWidth: 80, minSpeed: 15, maxSpeed: 25 },
      front: { count: 3, minWidth: 100, maxWidth: 130, minSpeed: 20, maxSpeed: 30 },
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

  // Размеры контейнера
  const containerSize = ref({ width: 0, height: 0 })

  // Центрированные координаты для сцены
  const sceneCenter = ref({ x: 0, y: 0 })

  // Элементы сцены
  const clouds = ref<Cloud[]>([])

  // Самолет
  const aircraft = ref({
    x: 0,
    y: 0,
    width: config.value.aircraft.targetWidth,
    height: config.value.aircraft.targetWidth * config.value.aircraft.aspectRatio,
    // Параметры эллиптической траектории
    ellipseCenterX: 0,
    ellipseCenterY: 0,
    semiMajorAxis: 0,
    semiMinorAxis: config.value.aircraft.ellipse.verticalAmplitude,
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

    // Используем ширину контейнера и высоту из конфига
    const canvasWidth = rect.width
    const canvasHeight = config.value.canvasHeight

    containerSize.value = {
      width: canvasWidth,
      height: canvasHeight,
    }

    sceneCenter.value = {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
    }

    // Рассчитываем размеры и позицию аэропорта
    const airportWidth = Math.min(config.value.airport.maxWidth, canvasWidth - 100)
    const airportX = sceneCenter.value.x - airportWidth / 2
    const airportY = config.value.airport.marginTop

    // Настраиваем эллиптическую траекторию самолета вокруг аэропорта
    // Большая полуось (по X) - половина ширины аэропорта плюс отступ
    aircraft.value.semiMajorAxis =
      airportWidth / 2 + config.value.aircraft.ellipse.horizontalOffset

    // Центр эллипса совпадает с центром аэропорта по X, с возможным смещением
    aircraft.value.ellipseCenterX =
      airportX + airportWidth / 2 + config.value.aircraft.ellipse.centerXOffset

    // Центр эллипса по Y - ниже аэропорта на заданное смещение
    aircraft.value.ellipseCenterY = airportY + config.value.aircraft.ellipse.centerYOffset

    // Обновляем размер самолета из конфига (на случай изменения на лету)
    aircraft.value.width = config.value.aircraft.targetWidth
    aircraft.value.height =
      aircraft.value.width * actualImageSizes.value.aircraft.aspectRatio

    // Начинаем анимацию самолета
    aircraft.value.animationStartTime = Date.now()
    aircraft.value.isAnimating = true

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasWidth * dpr
    canvas.height = canvasHeight * dpr

    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`

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
    const { back, middle, front } = config.value.clouds

    for (let i = 0; i < back.count; i++) {
      createCloud('back', true)
    }

    for (let i = 0; i < middle.count; i++) {
      createCloud('middle', true)
    }

    for (let i = 0; i < front.count; i++) {
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
    const maxCloudsInLayer = configCloud.count

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

  // Обновление позиции самолета (эллиптическая траектория с наклоном и отражением)
  const updateAircraft = () => {
    if (!aircraft.value.isAnimating) return

    const elapsed = Date.now() - aircraft.value.animationStartTime
    const progress =
      (elapsed % config.value.aircraft.animationDuration) /
      config.value.aircraft.animationDuration

    // Угол на эллипсе (от 0 до 2π)
    const angle = progress * 2 * Math.PI

    // Параметрическое уравнение эллипса
    aircraft.value.x =
      aircraft.value.ellipseCenterX + aircraft.value.semiMajorAxis * Math.cos(angle)
    aircraft.value.y =
      aircraft.value.ellipseCenterY + aircraft.value.semiMinorAxis * Math.sin(angle)

    // Вычисляем угол касательной к эллипсу
    // Производная: dx = -a*sin(θ), dy = b*cos(θ)
    const dx = -aircraft.value.semiMajorAxis * Math.sin(angle)
    const dy = aircraft.value.semiMinorAxis * Math.cos(angle)

    // Угол касательной (направление движения)
    const tangentAngle = Math.atan2(dy, dx)

    // Определяем направление (отражаем если летит влево)
    aircraft.value.flipHorizontal = dx < 0 ? -1 : 1

    // Вычисляем угол наклона для самолета
    let targetAngle = 0
    if (config.value.aircraft.tilt.enabled) {
      // Для отраженного самолета корректируем угол
      if (aircraft.value.flipHorizontal === -1) {
        // Когда самолет летит влево, нужно инвертировать угол
        targetAngle = -tangentAngle
      } else {
        // Когда самолет летит вправо
        targetAngle = tangentAngle
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

    // 1. Задний слой облаков - ДОЛЖЕН БЫТЬ САМЫМ ПЕРВЫМ
    drawCloudLayer('back')

    // 2. Средний слой облаков - ВТОРЫМИ
    drawCloudLayer('middle')

    // 3. Аэропорт - ТРЕТЬИМ
    drawAirport()

    // 4. Самолет - ЧЕТВЕРТЫМ
    drawAircraft()

    // 5. Передний слой облаков - ПОСЛЕДНИМ
    drawCloudLayer('front')
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
    const y = config.value.airport.marginTop

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
          const maxCount = config.value.clouds[layer as 'back' | 'middle' | 'front'].count

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

  const setAdaptiveCanvasHeight = () => {
    if (!containerRef.value) return

    const containerWidth = containerRef.value.getBoundingClientRect().width

    if (config.value.airport.maxWidth > containerWidth - 60) {
      config.value.canvasHeight = containerWidth / 1.12
      config.value.airport.marginTop = containerWidth / 3
    } else {
      config.value.canvasHeight = config.value.canvasInitHeight
      config.value.airport.marginTop = config.value.airport.initialMarginTop
    }
  }

  // Пересоздание сцены при изменении размеров или конфигурации
  const recreateScene = () => {
    if (!allImagesLoaded.value) return

    stopAnimation()

    setAdaptiveCanvasHeight()

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

    setAdaptiveCanvasHeight()

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

    window.addEventListener('resize', throttleResize)
  })

  onUnmounted(() => {
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
        recreateScene()
      }
    },
    { deep: true },
  )

  // Функция для обновления конфигурации на лету
  const updateConfig = (newConfig: Partial<typeof config.value>) => {
    Object.assign(config.value, newConfig)
  }

  return {
    canvasRef,
    allImagesLoaded,
    loading,
    config,
    updateConfig,
    recreateScene,
  }
}
