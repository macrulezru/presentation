import * as THREE from 'three'
import { type Ref } from 'vue'
import type { CameraState, ThreeSceneContext } from './types'
import { createDefaultConfig, initColors } from './config'

export function useThreeScene(containerRef: Ref<HTMLElement | undefined>) {
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let canvas: HTMLCanvasElement | null = null
  let resizeObserver: ResizeObserver | null = null

  const config = createDefaultConfig()
  const cameraState: CameraState = {
    basePosition: new THREE.Vector3(0, 5, 15),
    targetPosition: new THREE.Vector3(0, 5, 15),
    targetRotation: new THREE.Euler(0, 0, 0, 'YXZ'),
    currentRotation: new THREE.Euler(0, 0, 0, 'YXZ'),
  }

  const detectDeviceAndSensors = () => {
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )

    let isGyroAvailable = false
    let isCompassAvailable = false

    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        isGyroAvailable = true
        isCompassAvailable = true
      } else if ('ondeviceorientation' in window) {
        isGyroAvailable = true
        isCompassAvailable = true
      }
    }

    return { isMobileDevice, isGyroAvailable, isCompassAvailable }
  }

  const createRenderer = (canvas: HTMLCanvasElement, width: number, height: number) => {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })

    // Устанавливаем размеры без учета pixelRatio
    renderer.setSize(width, height, false)
    renderer.setClearColor(0x000011, 1)

    return renderer
  }

  const createCamera = (width: number, height: number) => {
    const camera = new THREE.PerspectiveCamera(110, width / height, 0.1, 1000)
    camera.position.copy(cameraState.basePosition)
    return camera
  }

  const createScene = () => {
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000011, 10, 60)
    return scene
  }

  const createLighting = (scene: THREE.Scene) => {
    const ambientLight = new THREE.AmbientLight(0x220099, 0.1)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x440099, 0.2)
    directionalLight.position.set(3, 10, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x660099, 0.4, 80)
    pointLight.name = 'mainPointLight'
    pointLight.position.set(0, 4, 0)
    scene.add(pointLight)
  }

  const handleResize = () => {
    if (!camera || !renderer || !containerRef.value) return

    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight

    // Устанавливаем CSS размеры
    if (canvas) {
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    // Обновляем камеру
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    // Обновляем рендерер (без учета pixelRatio)
    renderer.setSize(width, height, false)
  }

  const init = async () => {
    if (!containerRef.value) return

    initColors(config)
    const deviceInfo = detectDeviceAndSensors()

    // Получаем размеры контейнера
    const containerWidth = containerRef.value.clientWidth
    const containerHeight = containerRef.value.clientHeight

    // Создаем canvas элемент
    canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    canvas.style.zIndex = '0'
    canvas.style.pointerEvents = 'auto'
    canvas.style.maxWidth = '100%'
    canvas.style.maxHeight = '100%'

    // Устанавливаем атрибуты width/height равными CSS размерам
    canvas.width = containerWidth
    canvas.height = containerHeight

    containerRef.value.prepend(canvas)

    // Создаем объекты с учетом текущих размеров
    scene = createScene()
    camera = createCamera(containerWidth, containerHeight)
    renderer = createRenderer(canvas, containerWidth, containerHeight)
    createLighting(scene)

    // Для мобильных устройств с гироскопом не смотрим в центр
    if (!(deviceInfo.isMobileDevice && config.enableGyroParallax) && camera) {
      camera.lookAt(0, -5, 0)
    }

    // Создаем контекст сцены
    const sceneContext: ThreeSceneContext = {
      scene: scene!,
      camera: camera!,
      renderer: renderer!,
      plasmaField: null,
      plasmaParticles: null,
      glowParticles: null,
    }

    // Создаем ResizeObserver для отслеживания изменений размера контейнера
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })

    resizeObserver.observe(containerRef.value)

    // Также обрабатываем изменение размера окна
    window.addEventListener('resize', handleResize)

    // Вызываем один раз для начальной установки
    handleResize()

    return {
      sceneContext,
      config,
      cameraState,
      deviceInfo,
      cleanup: () => {
        if (resizeObserver) {
          resizeObserver.disconnect()
          resizeObserver = null
        }

        window.removeEventListener('resize', handleResize)

        // Удаляем canvas из DOM
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas)
          canvas = null
        }

        // Освобождаем ресурсы Three.js
        if (renderer) {
          renderer.dispose()
          renderer = null
        }

        if (scene) {
          scene.clear()
          scene = null
        }

        camera = null
      },
    }
  }

  return {
    init,
    config,
    cameraState,
  }
}
