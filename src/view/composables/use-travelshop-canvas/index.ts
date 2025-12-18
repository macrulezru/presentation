import { type Ref, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTravelshopIntroStore } from '@/stores/use-travelshop-intro-store'

// Импортируем декомпозированные модули
import { useImageManager } from './use-image-manager'
import { useCanvasManager } from './use-canvas-manager'
import { useEllipseManager } from './use-ellipse-manager'
import { useAircraftManager } from './use-aircraft-manager'
import { useCloudManager } from './use-cloud-manager'
import { useInputManager } from './use-input-manager'
import { drawArrow, isInCriticalPoint, getAircraftMoveDirection } from './utils'

// Импортируем изображения
import airportImageSrc from '@/view/assets/images/airport.png'
import aircraftImageSrc from '@/view/assets/images/aircraft.png'
import cloudImageSrc from '@/view/assets/images/cloud.png'

export function useTravelshopCanvas(containerRef: Ref<HTMLElement | undefined>) {
  const { t } = useI18n()

  // Импортируем все необходимые данные и методы из стора
  const travelshopIntroStore = useTravelshopIntroStore()

  // 1. Загрузка изображений
  const imageSources = {
    airport: airportImageSrc,
    aircraft: aircraftImageSrc,
    cloud: cloudImageSrc,
  }

  const { images, actualImageSizes, loading, allImagesLoaded, loadImages } =
    useImageManager()

  // 2. Управление канвасом
  const {
    canvasRef,
    ctx,
    containerSize,
    sceneCenter,
    adaptiveCanvasHeight,
    adaptiveAirportMarginTop,
    initCanvas: setupCanvas,
    resizeThrottle,
    getSafeZoneBounds,
    clampToSafeZone,
  } = useCanvasManager(containerRef)

  // 3. Управление эллипсом
  const {
    currentEllipseCenter,
    airportEllipseCenter,
    currentEllipse,
    targetEllipse,
    adaptiveAirportEllipse,
    adaptiveMouseEllipse,
    responsiveAirportEllipse,
    updateEllipseCenter,
    updateEllipseParameters,
    updateTargetEllipseForMouse,
    updateTargetEllipseForAirport,
  } = useEllipseManager(containerSize)

  // 4. Управление самолетом
  const {
    aircraft,
    aircraftAngle,
    rotationDirection,
    aircraftVelocity,
    directionChangeState,
    lastAnimationUpdateTime,
    initAircraft,
    updateAircraft,
    drawAircraft,
  } = useAircraftManager()

  // 5. Управление облаками
  const {
    clouds,
    adaptiveCloudsCount,
    createInitialClouds,
    updateClouds,
    drawCloudLayer,
    startCloudGeneration,
    stopCloudGeneration,
  } = useCloudManager(containerSize, actualImageSizes)

  // 6. Управление вводом
  const {
    mousePosition,
    isMouseOverCanvas,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = useInputManager()

  // Анимация и основные методы
  const animationId = ref<number>()

  // Инициализация сцены
  const initScene = (): boolean => {
    if (!setupCanvas()) return false

    // Рассчитываем размеры и позицию аэропорта
    const airportWidth = Math.min(
      travelshopIntroStore.config.airport.maxWidth,
      containerSize.value.width - 100,
    )
    const airportX = sceneCenter.value.x - airportWidth / 2
    const airportY = adaptiveAirportMarginTop.value

    // Используем адаптивные значения эллипса аэропорта
    const ellipse = adaptiveAirportEllipse.value

    // Центр эллипса совпадает с центром аэропорта по X, с возможным смещением
    airportEllipseCenter.value.x = airportX + airportWidth / 2 + ellipse.centerXOffset
    airportEllipseCenter.value.y = airportY + ellipse.centerYOffset

    // Проверяем, находится ли центр аэропорта в пределах безопасной зоны
    const safeZoneBounds = getSafeZoneBounds(travelshopIntroStore.config.safeZoneMargins)
    const safeAirportCenter = clampToSafeZone(
      airportEllipseCenter.value.x,
      airportEllipseCenter.value.y,
      safeZoneBounds,
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
    rotationDirection.value = travelshopIntroStore.config.aircraft.rotationDirection

    // Инициализируем самолет
    initAircraft(travelshopIntroStore.config, actualImageSizes)

    if (isMouseOverCanvas.value) {
      updateTargetEllipseForMouse()
    } else {
      updateTargetEllipseForAirport()
    }

    return true
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

    drawCloudLayer(ctx.value, images, 'back')
    drawCloudLayer(ctx.value, images, 'middle')
    drawAirport(ctx.value, images)
    drawAircraft(ctx.value, images)
    drawCloudLayer(ctx.value, images, 'front')
    if (travelshopIntroStore.showDebugControls) {
      drawDebugInfo(ctx.value)
    }
  }

  // Отрисовка аэропорта
  const drawAirport = (ctx: CanvasRenderingContext2D, images: any) => {
    if (!ctx || !images.airport.complete) return

    const airportImg = images.airport
    const { width: containerWidth } = containerSize.value
    const { x: centerX } = sceneCenter.value

    const airportAspectRatio = actualImageSizes.value.airport.aspectRatio
    const maxWidth = Math.min(
      travelshopIntroStore.config.airport.maxWidth,
      containerWidth - 40,
    )
    const width = maxWidth
    const height = width * airportAspectRatio

    const x = centerX - width / 2
    const y = adaptiveAirportMarginTop.value

    ctx.save()
    ctx.shadowColor = 'rgba(131, 76, 5, 0.3)'
    ctx.shadowBlur = 15
    ctx.shadowOffsetY = 10

    ctx.drawImage(airportImg, x, y, width, height)

    ctx.restore()
  }

  // Отрисовка дебаг информации
  const drawDebugInfo = (ctx: CanvasRenderingContext2D) => {
    if (!ctx) return

    ctx.save()

    // 1. Отрисовываем текущий центр эллипса
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
    ctx.beginPath()
    ctx.arc(currentEllipseCenter.value.x, currentEllipseCenter.value.y, 5, 0, Math.PI * 2)
    ctx.fill()

    // 2. Отрисовываем центр аэропорта
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'
    ctx.beginPath()
    ctx.arc(airportEllipseCenter.value.x, airportEllipseCenter.value.y, 3, 0, Math.PI * 2)
    ctx.fill()

    // 3. Отрисовываем безопасную зону
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    const safeZoneBounds = getSafeZoneBounds(travelshopIntroStore.config.safeZoneMargins)
    ctx.strokeRect(
      safeZoneBounds.minX,
      safeZoneBounds.minY,
      safeZoneBounds.maxX - safeZoneBounds.minX,
      safeZoneBounds.maxY - safeZoneBounds.minY,
    )
    ctx.setLineDash([])

    // 4. Отрисовываем все три эллиптические траектории
    const steps = 100
    const commonCenter = currentEllipseCenter.value

    // 4.1 Траектория аэропорта
    const airportEllipse = adaptiveAirportEllipse.value
    ctx.strokeStyle = 'rgba(250,136,6,0.94)'
    ctx.lineWidth = 1
    ctx.beginPath()

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI
      const x = commonCenter.x + airportEllipse.horizontalRadius * Math.cos(angle)
      const y = commonCenter.y + airportEllipse.verticalRadius * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()

    // 4.2 Траектория мышки
    const mouseEllipse = adaptiveMouseEllipse.value
    // Вычисляем полуоси с учетом круглости (как в updateTargetEllipseForMouse)
    const baseRadius = Math.min(
      mouseEllipse.horizontalRadius,
      mouseEllipse.verticalRadius,
    )
    const mouseSemiMajorAxis =
      baseRadius + (mouseEllipse.horizontalRadius - baseRadius) * mouseEllipse.roundness
    const mouseSemiMinorAxis =
      baseRadius + (mouseEllipse.verticalRadius - baseRadius) * mouseEllipse.roundness

    ctx.strokeStyle = 'rgba(169,6,250,0.8)'
    ctx.lineWidth = 1
    ctx.beginPath()

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI
      const x = commonCenter.x + mouseSemiMajorAxis * Math.cos(angle)
      const y = commonCenter.y + mouseSemiMinorAxis * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()

    // 4.3 Текущая активная траектория
    ctx.strokeStyle = 'rgba(6,74,250,0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI
      const x = commonCenter.x + currentEllipse.value.semiMajorAxis * Math.cos(angle)
      const y = commonCenter.y + currentEllipse.value.semiMinorAxis * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()

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
        ctx,
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
      ctx.fillStyle = speedColor
      ctx.font = '12px Arial'
      ctx.fillText(
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
          ctx,
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
        ctx.fillStyle = 'rgba(0, 150, 255, 0.9)'
        ctx.font = '11px Arial'
        ctx.fillText(
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
          ctx,
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
        ctx.fillStyle = normalColor
        ctx.font = '10px Arial'
        ctx.fillText(
          `cross: ${crossValue.toFixed(3)}`,
          aircraft.value.x + perpX * normalLength + 5,
          aircraft.value.y + perpY * normalLength,
        )
      }
    }

    // 8. Отрисовываем направление вращения
    ctx.fillStyle =
      rotationDirection.value === 1 ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)'
    ctx.font = '14px Arial'
    ctx.fillText(
      rotationDirection.value === 1 ? '↻' : '↺',
      currentEllipseCenter.value.x + 10,
      currentEllipseCenter.value.y - 10,
    )

    // 9. Отладочный текст в углу с подложкой
    const speed = velocityLength
    const angleDeg = ((aircraftAngle.value * 180) / Math.PI).toFixed(1)

    const isCritical = isInCriticalPoint(
      aircraftAngle.value,
      travelshopIntroStore.config.aircraft.directionChange.hysteresis.angleBuffer,
    )

    const moveDirection = getAircraftMoveDirection(
      aircraftVelocity.value,
      travelshopIntroStore.config.aircraft.directionChange.minVelocityThreshold,
      rotationDirection.value,
    )

    // Собираем все строки для отладочной информации
    const debugLines = [
      `${t('tshIntro.panel.direction')}: ${rotationDirection.value === 1 ? t('tshIntro.panel.clockwise') : t('tshIntro.panel.counterclockwise')}`,
      `${t('tshIntro.panel.speed')}: ${speed.toFixed(2)} px/s`,
      `${t('tshIntro.panel.angle')}: ${angleDeg}°`,
      `Cross: ${directionChangeState.value.smoothedCrossValue.toFixed(3)}`,
      `${t('tshIntro.panel.movement')}: ${moveDirection > 0 ? t('tshIntro.panel.right') : t('tshIntro.panel.left')}`,
      `${t('tshIntro.panel.critical_point')}: ${isCritical ? t('tshIntro.panel.yes') : t('tshIntro.panel.no')}`,
      `${t('tshIntro.panel.tilt')}: ${((aircraft.value.tiltAngle * 180) / Math.PI).toFixed(1)}°`,
      `${t('tshIntro.panel.reflection')}: ${aircraft.value.flipHorizontal === 1 ? t('tshIntro.panel.no') : t('tshIntro.panel.yes')}`,
      `${t('tshIntro.panel.position')}: (${Math.round(aircraft.value.x)}, ${Math.round(aircraft.value.y)})`,
    ]

    // Добавляем строку с курсором если есть
    if (mousePosition.value) {
      debugLines.push(
        `${t('tshIntro.panel.cursor')}: (${Math.round(mousePosition.value.x)}, ${Math.round(mousePosition.value.y)})`,
      )
    }

    // Устанавливаем стиль текста для измерения
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'

    // Вычисляем максимальную ширину текста для подложки
    let maxWidth = 0
    debugLines.forEach(line => {
      const metrics = ctx.measureText(line)
      maxWidth = Math.max(maxWidth, metrics.width)
    })

    // Параметры подложки
    const padding = 12
    const lineHeight = 20
    const borderRadius = 10
    const boxX = 10
    const boxY = 10

    // Вычисляем размеры подложки
    const boxWidth = maxWidth + padding * 2
    const boxHeight = debugLines.length * lineHeight + padding * 2

    // Рисуем подложку со скругленными углами
    ctx.save()

    // Сначала устанавливаем тень
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    // Заливка подложки
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'

    // Начинаем путь для скругленного прямоугольника
    ctx.beginPath()
    ctx.moveTo(boxX + borderRadius, boxY)
    ctx.lineTo(boxX + boxWidth - borderRadius, boxY)
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + borderRadius)
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - borderRadius)
    ctx.quadraticCurveTo(
      boxX + boxWidth,
      boxY + boxHeight,
      boxX + boxWidth - borderRadius,
      boxY + boxHeight,
    )
    ctx.lineTo(boxX + borderRadius, boxY + boxHeight)
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - borderRadius)
    ctx.lineTo(boxX, boxY + borderRadius)
    ctx.quadraticCurveTo(boxX, boxY, boxX + borderRadius, boxY)
    ctx.closePath()
    ctx.fill()

    // Добавляем тонкую рамку
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()

    // Сбрасываем тень для текста
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Рисуем текст на подложке
    debugLines.forEach((line, index) => {
      // Для строки с курсором используем другой цвет
      if (line.includes(t('tshIntro.panel.cursor'))) {
        ctx.fillStyle = 'rgba(0, 150, 255, 0.9)'
      } else {
        ctx.fillStyle = 'white'
      }

      // Вычисляем Y-координату для текущей строки
      const textY = boxY + padding * 2 + index * lineHeight

      ctx.fillText(line, boxX + padding, textY)
    })

    ctx.restore()
  }

  // Основной цикл анимации
  const animate = () => {
    if (!allImagesLoaded.value) {
      animationId.value = requestAnimationFrame(animate)
      return
    }

    const now = Date.now()
    const deltaTime = now - lastAnimationUpdateTime.value
    lastAnimationUpdateTime.value = now

    // Обновляем облака
    updateClouds()

    // Обновляем центр эллипса
    const safeZoneBounds = getSafeZoneBounds(travelshopIntroStore.config.safeZoneMargins)
    updateEllipseCenter({
      bounds: safeZoneBounds,
      isMouseOverCanvas: isMouseOverCanvas.value,
      mousePosition: mousePosition.value,
    })

    // Обновляем параметры эллипса
    updateEllipseParameters()

    // Обновляем самолет
    updateAircraft({
      config: travelshopIntroStore.config,
      deltaTime,
      currentEllipseCenter: currentEllipseCenter.value,
      currentEllipse: currentEllipse.value,
      isMouseOverCanvas: isMouseOverCanvas.value,
      mousePosition: mousePosition.value,
    })

    // Отрисовываем сцену
    drawScene()

    animationId.value = requestAnimationFrame(animate)
  }

  // Запуск анимации
  const startAnimation = () => {
    if (!allImagesLoaded.value) return

    if (initScene()) {
      createInitialClouds(travelshopIntroStore.config, actualImageSizes)
      startCloudGeneration(travelshopIntroStore.config)
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

  // Пересоздание сцены
  const recreateScene = () => {
    if (!allImagesLoaded.value) return

    stopAnimation()

    if (initScene()) {
      clouds.value = []
      createInitialClouds(travelshopIntroStore.config, actualImageSizes)
      startCloudGeneration(travelshopIntroStore.config)
      animate()
    }
  }

  // Инициализация
  onMounted(async () => {
    await loadImages(imageSources)

    if (allImagesLoaded.value) {
      nextTick(() => {
        startAnimation()
      })
    }

    const canvas = canvasRef.value
    if (canvas) {
      canvas.addEventListener('mousemove', e => handleMouseMove(e, canvasRef))
      canvas.addEventListener('mouseenter', handleMouseEnter)
      canvas.addEventListener('mouseleave', handleMouseLeave)
    }

    window.addEventListener('resize', resizeThrottle)
  })

  onUnmounted(() => {
    const canvas = canvasRef.value
    if (canvas) {
      canvas.removeEventListener('mousemove', e => handleMouseMove(e, canvasRef))
      canvas.removeEventListener('mouseenter', handleMouseEnter)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }

    stopAnimation()
    window.removeEventListener('resize', resizeThrottle)
  })

  // Watchers
  watch(containerRef, newContainer => {
    if (newContainer && allImagesLoaded.value) {
      recreateScene()
    }
  })

  watch(
    () => travelshopIntroStore.config,
    () => {
      if (allImagesLoaded.value) {
        rotationDirection.value = travelshopIntroStore.config.aircraft.rotationDirection
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

  watch(
    () => isMouseOverCanvas.value,
    isOver => {
      if (!allImagesLoaded.value) return

      if (isOver) {
        updateTargetEllipseForMouse()
      } else {
        updateTargetEllipseForAirport()
      }
    },
  )

  // Экспорт конфигурации
  const exportConfig = () => {
    const configData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      config: travelshopIntroStore.config,
      debugParams: travelshopIntroStore.debugParams,
    }

    const jsonString = JSON.stringify(configData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'tsh-config.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  // Импорт конфигурации (локальный метод)
  const handleImportConfig = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    if (!file) return
    const reader = new FileReader()

    reader.onload = e => {
      try {
        const content = e.target?.result as string
        const configData = JSON.parse(content)

        if (!configData.config || !configData.debugParams) {
          throw new Error('Некорректный формат файла конфигурации')
        }
        travelshopIntroStore.importConfig(configData.config)

        Object.entries(configData.debugParams).forEach(([_category, params]) => {
          if (Array.isArray(params)) {
            params.forEach((param: any) => {
              if (param.id && param.value !== undefined) {
                travelshopIntroStore.updateDebugParam(param.id, param.value)
              }
            })
          }
        })

        input.value = ''

        recreateScene()
      } catch (error) {
        console.error('Ошибка при импорте конфигурации:', error)
        alert('Ошибка при загрузке конфигурации. Проверьте формат файла.')
        input.value = ''
      }
    }

    reader.readAsText(file)
  }

  return {
    // Ссылки и состояния
    canvasRef,
    allImagesLoaded,
    loading,

    // Методы анимации
    recreateScene,
    startAnimation,
    stopAnimation,

    // Ввод
    isMouseOverCanvas,
    mousePosition,

    // Геометрия
    currentEllipseCenter,
    airportEllipseCenter,
    rotationDirection,
    aircraftAngle,
    aircraftVelocity,

    // Адаптивные значения
    adaptiveAirportEllipse,
    adaptiveMouseEllipse,
    responsiveAirportEllipse,
    adaptiveCanvasHeight,
    adaptiveAirportMarginTop,
    adaptiveCloudsCount,

    // Методы для экспорта/импорта
    exportConfig,
    handleImportConfig,
  }
}
