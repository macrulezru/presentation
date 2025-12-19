import * as THREE from 'three'
import { type Ref } from 'vue'
import type { CameraState, ThreeSceneContext } from './types'
import { createDefaultConfig, initColors } from './config'

export function useThreeScene(containerRef: Ref<HTMLElement | undefined>) {
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null

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

  const createRenderer = (canvas: HTMLCanvasElement) => {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000011, 1)

    return renderer
  }

  const createCamera = () => {
    const camera = new THREE.PerspectiveCamera(
      110,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )

    // Исправлено: убрали .value, так как cameraState - обычный объект
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

  const init = async () => {
    if (!containerRef.value) return

    initColors(config)
    const deviceInfo = detectDeviceAndSensors()

    // Создаем canvas элемент
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100dvh' // Динамическая высота viewport
    canvas.style.zIndex = '0'
    canvas.style.pointerEvents = 'auto' // Разрешаем события мыши
    containerRef.value.prepend(canvas)

    // Создаем объекты
    scene = createScene()
    camera = createCamera()
    renderer = createRenderer(canvas)
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

    const handleResize = () => {
      if (!camera || !renderer) return

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    return {
      sceneContext, // Обычный объект
      config, // Обычный объект
      cameraState, // Обычный объект
      deviceInfo, // Обычный объект
      cleanup: () => {
        window.removeEventListener('resize', handleResize)
        renderer?.dispose()
        scene?.clear()
        // Удаляем canvas из DOM
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas)
        }
      },
    }
  }

  return {
    init,
    config,
    cameraState,
  }
}
