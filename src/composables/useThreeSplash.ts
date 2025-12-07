import * as THREE from 'three'
import { onMounted, onUnmounted, type Ref } from 'vue'

export function useThreeSplash(containerRef: Ref<HTMLElement | undefined>) {
  // Three.js переменные
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let animationFrameId: number

  // Массивы объектов
  let objects: any[] = []
  let connections: any[] = []
  let particles: any[] = []

  // Параметры
  let globalSpeed = 1
  let globalRotation = 1
  let globalBrightness = 0.4
  let connectionDensity = 80
  let time = 0

  // Флаг активности анимации
  let isAnimationActive = false

  // Intersection Observer
  let intersectionObserver: IntersectionObserver | null = null

  // Таймеры интервалов
  let maintainInterval: NodeJS.Timeout | null = null
  let connectionsInterval: NodeJS.Timeout | null = null

  // Константы
  const vueColors = [
    0x42b883, // Яркий зеленый Vue
    0x64d4b4, // Светлый бирюзовый
    0x3aaf85, // Средний зеленый
    0x2dccaf, // Бирюзовый
    0x5ce0c6, // Очень светлый бирюзовый
  ]

  const VIEWPORT_BOUNDS = {
    x: 25,
    y: 15,
    z: 25,
  }

  const MIN_OBJECTS = 20
  const MAX_OBJECTS = 35
  const OBJECT_LIFETIME_MIN = 15000
  const OBJECT_LIFETIME_MAX = 30000
  const APPEAR_DURATION = 1000 // мс на появление
  const DISAPPEAR_DURATION = 1000 // мс на исчезновение

  // Easing функции
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
  const easeInCubic = (t: number) => t * t * t

  // Функции для создания материалов
  const createBrightMaterial = (color: number, isWireframe = false) => {
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.25,
        wireframe: true,
        side: THREE.DoubleSide,
      })
    }

    return new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.2,
      transmission: 0.1,
      transparent: true,
      opacity: 0.95,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
      emissive: color,
      emissiveIntensity: 0.1,
    })
  }

  // Создание объекта с плавным появлением
  const createObject = () => {
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
    const sphereGeometry = new THREE.SphereGeometry(0.8, 20, 20)

    const isCube = Math.random() > 0.5
    const color = vueColors[Math.floor(Math.random() * vueColors.length)]

    // Основной объект
    const mesh = new THREE.Mesh(
      isCube ? cubeGeometry : sphereGeometry,
      createBrightMaterial(color as number),
    )

    // Проволочная оболочка
    const wireGeometry = isCube
      ? new THREE.BoxGeometry(1.15, 1.15, 1.15)
      : new THREE.SphereGeometry(0.95, 16, 16)
    const wireMesh = new THREE.Mesh(
      wireGeometry,
      createBrightMaterial(color as number, true),
    )
    mesh.add(wireMesh)

    // Начальная позиция
    mesh.position.set(
      (Math.random() - 0.5) * VIEWPORT_BOUNDS.x * 1.5,
      (Math.random() - 0.5) * VIEWPORT_BOUNDS.y,
      (Math.random() - 0.5) * VIEWPORT_BOUNDS.z * 1.5,
    )

    // Начальный размер - почти 0 (будет увеличиваться)
    const targetSize = 0.8 + Math.random() * 0.8
    mesh.scale.setScalar(0.001)
    wireMesh.scale.setScalar(0.001)

    // Скорость движения
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.015,
      (Math.random() - 0.5) * 0.02,
    )

    // Начальное вращение
    mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
    )

    const obj = {
      mesh: mesh,
      wireframe: wireMesh,
      isCube: isCube,
      lifetime:
        OBJECT_LIFETIME_MIN + Math.random() * (OBJECT_LIFETIME_MAX - OBJECT_LIFETIME_MIN),
      age: 0,
      velocity: velocity,
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
      ),
      targetSize: targetSize,
      state: 'appearing', // appearing, alive, disappearing
      appearProgress: 0,
      disappearProgress: 0,
    }

    scene.add(mesh)
    objects.push(obj)

    updateBrightness()

    return obj
  }

  // Удаление объекта
  const removeObject = (index: number) => {
    const obj = objects[index]

    if (obj) {
      scene.remove(obj.mesh)

      // Очистка ресурсов
      obj.mesh.geometry.dispose()
      obj.mesh.material.dispose()
      if (obj.wireframe) {
        obj.wireframe.geometry.dispose()
        obj.wireframe.material.dispose()
      }
    }

    objects.splice(index, 1)
  }

  // Создание соединения
  const createConnection = (obj1: any, obj2: any) => {
    // Не создаем соединения с объектами, которые появляются или исчезают
    if (obj1.state !== 'alive' || obj2.state !== 'alive') return null

    const start = obj1.mesh.position
    const end = obj2.mesh.position

    // Проверяем расстояние
    const distance = start.distanceTo(end)
    if (distance > 25) return null

    // Создаем кривую Безье с амплитудой
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    const curveHeight = distance * 0.4

    // Добавляем изгиб
    midPoint.y += (Math.random() - 0.5) * curveHeight
    midPoint.x += (Math.random() - 0.5) * curveHeight * 0.6
    midPoint.z += (Math.random() - 0.5) * curveHeight * 0.6

    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end)
    const points = curve.getPoints(25)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    // Смешиваем цвета объектов
    const color1 = new THREE.Color(obj1.mesh.material.color)
    const color2 = new THREE.Color(obj2.mesh.material.color)
    const mixedColor = color1.clone().lerp(color2, 0.5)

    // Материал для линии
    const material = new THREE.LineBasicMaterial({
      color: mixedColor,
      transparent: true,
      opacity: 0, // начинаем с прозрачности 0
      linewidth: 2,
    })

    const line = new THREE.Line(geometry, material)

    const connection = {
      line: line,
      startObj: obj1,
      endObj: obj2,
      age: 0,
      maxAge: 5000 + Math.random() * 4000,
      pulsePhase: Math.random() * Math.PI * 2,
      controlPoint: midPoint.clone(),
      appearProgress: 0,
      state: 'appearing',
    }

    scene.add(line)
    connections.push(connection)

    return connection
  }

  // Удаление соединения
  const removeConnection = (index: number) => {
    const conn = connections[index]

    if (conn) {
      scene.remove(conn.line)
      conn.line.geometry.dispose()
      conn.line.material.dispose()
    }

    connections.splice(index, 1)
  }

  // Создание частиц
  const createParticles = () => {
    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8)

    for (let i = 0; i < 200; i++) {
      const color = vueColors[Math.floor(Math.random() * vueColors.length)]
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4 + Math.random() * 0.4,
      })

      const particle = new THREE.Mesh(particleGeometry, material)

      particle.position.set(
        (Math.random() - 0.5) * VIEWPORT_BOUNDS.x * 2.5,
        (Math.random() - 0.5) * VIEWPORT_BOUNDS.y * 1.8,
        (Math.random() - 0.5) * VIEWPORT_BOUNDS.z * 2.5,
      )

      particles.push({
        mesh: particle,
        speed: 0.001 + Math.random() * 0.003,
        amplitude: 1.5 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        originalY: particle.position.y,
      })

      scene.add(particle)
    }
  }

  // Обновление яркости
  const updateBrightness = () => {
    objects.forEach(obj => {
      if (obj.state === 'alive') {
        obj.mesh.material.opacity = 0.95 * globalBrightness
        obj.wireframe.material.opacity = 0.25 * globalBrightness
        obj.mesh.material.emissiveIntensity = 0.1 * globalBrightness
      }
    })

    connections.forEach(conn => {
      if (conn.state === 'alive') {
        conn.line.material.opacity = 0.15 * globalBrightness
      }
    })

    particles.forEach(particle => {
      particle.mesh.material.opacity = 0.6 * globalBrightness
    })

    // Обновление света с приведением типов
    if (scene) {
      const ambientLight = scene.getObjectByName(
        'ambientLight',
      ) as THREE.AmbientLight | null
      const directionalLight = scene.getObjectByName(
        'directionalLight',
      ) as THREE.DirectionalLight | null
      const pointLight = scene.getObjectByName('pointLight') as THREE.PointLight | null

      if (ambientLight) ambientLight.intensity = 0.3 * globalBrightness
      if (directionalLight) directionalLight.intensity = 0.8 * globalBrightness
      if (pointLight) pointLight.intensity = 0.5 * globalBrightness
    }
  }

  // Создание случайных соединений
  const createRandomConnections = () => {
    if (objects.length < 2) return

    const aliveObjects = objects.filter(obj => obj.state === 'alive')
    if (aliveObjects.length < 2) return

    const targetConnections = Math.min(
      50,
      Math.floor(aliveObjects.length * (connectionDensity / 100) * 1.2),
    )

    // Удаляем только очень старые соединения
    for (let i = connections.length - 1; i >= 0; i--) {
      if (connections[i].age > connections[i].maxAge * 1.5) {
        removeConnection(i)
      }
    }

    // Создаем новые соединения если нужно
    if (connections.length < targetConnections) {
      for (let attempt = 0; attempt < 15; attempt++) {
        if (connections.length >= targetConnections) break

        const obj1 = aliveObjects[Math.floor(Math.random() * aliveObjects.length)]
        const obj2 = aliveObjects[Math.floor(Math.random() * aliveObjects.length)]

        if (obj1 === obj2) continue

        // Проверяем, нет ли уже соединения
        const existingConnection = connections.find(
          conn =>
            (conn.startObj === obj1 && conn.endObj === obj2) ||
            (conn.startObj === obj2 && conn.endObj === obj1),
        )

        if (!existingConnection) {
          createConnection(obj1, obj2)
        }
      }
    }
  }

  // Поддержание количества объектов
  const maintainObjects = () => {
    const aliveObjects = objects.filter(obj => obj.state === 'alive')

    // Всегда поддерживаем минимальное количество живых объектов
    if (aliveObjects.length < MIN_OBJECTS) {
      const needed = MIN_OBJECTS - aliveObjects.length
      for (let i = 0; i < needed; i++) {
        createObject()
      }
    }

    // Иногда создаем дополнительные объекты
    if (aliveObjects.length < MAX_OBJECTS && Math.random() > 0.7) {
      createObject()
    }
  }

  // Анимация
  const animate = () => {
    // Если анимация неактивна, не запускаем новый кадр
    if (!isAnimationActive) {
      return
    }

    animationFrameId = requestAnimationFrame(animate)
    const deltaTime = 16
    time += deltaTime * globalSpeed * 0.001

    // Обновление объектов
    objects.forEach((obj, index) => {
      obj.age += deltaTime

      // Управление состояниями объекта
      switch (obj.state) {
        case 'appearing':
          obj.appearProgress += deltaTime / APPEAR_DURATION
          if (obj.appearProgress >= 1) {
            obj.appearProgress = 1
            obj.state = 'alive'
          }

          // Анимация появления (увеличение из точки)
          const appearScale = easeOutCubic(obj.appearProgress) * obj.targetSize
          obj.mesh.scale.setScalar(appearScale)
          obj.wireframe.scale.setScalar(appearScale * 1.15)

          // Постепенное увеличение прозрачности
          const appearOpacity = easeOutCubic(obj.appearProgress)
          obj.mesh.material.opacity = 0.95 * appearOpacity * globalBrightness
          obj.wireframe.material.opacity = 0.25 * appearOpacity * globalBrightness
          break

        case 'alive':
          // Проверяем, не пора ли начинать исчезать
          if (obj.age > obj.lifetime - DISAPPEAR_DURATION) {
            obj.state = 'disappearing'
            obj.disappearProgress = 0
          }
          break

        case 'disappearing':
          obj.disappearProgress += deltaTime / DISAPPEAR_DURATION
          if (obj.disappearProgress >= 1) {
            // Полностью исчез - удаляем
            removeObject(index)
            return
          }

          // Анимация исчезновения (уменьшение в точку)
          const disappearScale = (1 - easeInCubic(obj.disappearProgress)) * obj.targetSize
          obj.mesh.scale.setScalar(disappearScale)
          obj.wireframe.scale.setScalar(disappearScale * 1.15)

          // Постепенное уменьшение прозрачности
          const disappearOpacity = 1 - easeInCubic(obj.disappearProgress)
          obj.mesh.material.opacity = 0.95 * disappearOpacity * globalBrightness
          obj.wireframe.material.opacity = 0.25 * disappearOpacity * globalBrightness
          break
      }

      // Физика движения (только для живых и появляющихся объектов)
      if (obj.state !== 'disappearing') {
        obj.mesh.position.add(obj.velocity.clone().multiplyScalar(globalSpeed))

        // Мягкие границы с отскоком
        const bounds = VIEWPORT_BOUNDS
        const pos = obj.mesh.position

        if (Math.abs(pos.x) > bounds.x) {
          obj.velocity.x *= -0.9
          pos.x = Math.sign(pos.x) * bounds.x * 0.95
        }
        if (Math.abs(pos.y) > bounds.y) {
          obj.velocity.y *= -0.9
          pos.y = Math.sign(pos.y) * bounds.y * 0.95
        }
        if (Math.abs(pos.z) > bounds.z) {
          obj.velocity.z *= -0.9
          pos.z = Math.sign(pos.z) * bounds.z * 0.95
        }
      }

      // Плавное вращение (одинаковая скорость для всех состояний)
      obj.mesh.rotation.x += obj.rotationSpeed.x * globalRotation
      obj.mesh.rotation.y += obj.rotationSpeed.y * globalRotation
      obj.mesh.rotation.z += obj.rotationSpeed.z * globalRotation

      // Вращение проволочной оболочки в другую сторону
      obj.wireframe.rotation.x -= obj.rotationSpeed.x * globalRotation * 0.7
      obj.wireframe.rotation.y -= obj.rotationSpeed.y * globalRotation * 0.7
    })

    // Обновление соединений
    connections.forEach((conn, index) => {
      conn.age += deltaTime

      // Управление состояниями соединения
      if (conn.state === 'appearing') {
        conn.appearProgress += deltaTime / 500 // 500ms на появление
        if (conn.appearProgress >= 1) {
          conn.appearProgress = 1
          conn.state = 'alive'
        }
        conn.line.material.opacity =
          0.15 * easeOutCubic(conn.appearProgress) * globalBrightness
      }

      // Проверяем, нужно ли удалять соединение
      if (
        conn.age > conn.maxAge ||
        !objects.includes(conn.startObj) ||
        !objects.includes(conn.endObj) ||
        (conn.startObj && conn.startObj.state === 'disappearing') ||
        (conn.endObj && conn.endObj.state === 'disappearing')
      ) {
        // Начинаем исчезать
        if (conn.state !== 'disappearing') {
          conn.state = 'disappearing'
          conn.disappearProgress = 0
        }

        conn.disappearProgress += deltaTime / 400 // 400ms на исчезновение
        if (conn.disappearProgress >= 1) {
          removeConnection(index)
          return
        }

        conn.line.material.opacity =
          0.15 * (1 - easeInCubic(conn.disappearProgress)) * globalBrightness
      }

      // Обновляем кривую только для живых соединений
      if (conn.state === 'alive' && conn.startObj && conn.endObj) {
        const start = conn.startObj.mesh.position
        const end = conn.endObj.mesh.position

        // Анимируем контрольную точку
        const midPoint = conn.controlPoint.clone()
        const distance = start.distanceTo(end)
        const baseHeight = distance * 0.3

        // Плавное движение контрольной точки
        midPoint.y += Math.sin(time * 1.5 + conn.pulsePhase) * baseHeight * 0.2
        midPoint.x += Math.sin(time * 1.2 + conn.pulsePhase * 1.3) * baseHeight * 0.15
        midPoint.z += Math.sin(time * 1.3 + conn.pulsePhase * 1.7) * baseHeight * 0.15

        // Обновляем контрольную точку
        conn.controlPoint.lerp(midPoint, 0.1)

        const curve = new THREE.QuadraticBezierCurve3(start, conn.controlPoint, end)
        const points = curve.getPoints(25)

        // Обновляем геометрию линии
        const positions = conn.line.geometry.attributes.position.array as Float32Array
        for (let j = 0; j < points.length; j++) {
          const point = points[j]
          positions[j * 3] = point?.x || 0
          positions[j * 3 + 1] = point?.y || 0
          positions[j * 3 + 2] = point?.z || 0
        }

        conn.line.geometry.attributes.position.needsUpdate = true
      }
    })

    // Обновление частиц
    particles.forEach(particle => {
      particle.mesh.position.y =
        particle.originalY +
        Math.sin(time * particle.speed + particle.phase) * particle.amplitude

      const angle = time * particle.speed * 3 + particle.phase
      particle.mesh.position.x += Math.cos(angle) * 0.01
      particle.mesh.position.z += Math.sin(angle) * 0.01

      particle.mesh.material.opacity =
        (0.4 + Math.sin(time * 2 + particle.phase) * 0.3) * globalBrightness
    })

    // Движение камеры
    camera.position.x = Math.sin(time * 0.015) * 3
    camera.position.z = 25 + Math.cos(time * 0.012) * 2
    camera.position.y = 5 + Math.sin(time * 0.008) * 1.5
    camera.lookAt(0, 2, 0)

    // Движение света
    const pointLight = scene.getObjectByName('pointLight') as THREE.PointLight | null
    if (pointLight) {
      pointLight.position.x = camera.position.x * 0.3
      pointLight.position.z = camera.position.z * 0.3 - 5
    }

    renderer.render(scene, camera)
  }

  // Остановка анимации
  const stopAnimation = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
    isAnimationActive = false
    console.log('Animation stopped')
  }

  // Запуск анимации
  const startAnimation = () => {
    if (!isAnimationActive) {
      isAnimationActive = true
      console.log('Animation started')
      animate()
    }
  }

  // Проверка видимости элемента
  const isElementInViewport = () => {
    if (!containerRef.value) return false

    const rect = containerRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const windowWidth = window.innerWidth || document.documentElement.clientWidth

    // Проверяем, пересекается ли элемент с viewport
    const vertInView = rect.top <= windowHeight && rect.bottom >= 0
    const horInView = rect.left <= windowWidth && rect.right >= 0

    return vertInView && horInView
  }

  // Очистка ресурсов
  const cleanup = () => {
    stopAnimation()

    // Очистка интервалов
    if (maintainInterval) {
      clearInterval(maintainInterval)
      maintainInterval = null
    }
    if (connectionsInterval) {
      clearInterval(connectionsInterval)
      connectionsInterval = null
    }

    // Очистка Three.js ресурсов
    objects.forEach(obj => {
      if (obj.mesh) {
        obj.mesh.geometry.dispose()
        obj.mesh.material.dispose()
        scene.remove(obj.mesh)
      }
      if (obj.wireframe) {
        obj.wireframe.geometry.dispose()
        obj.wireframe.material.dispose()
      }
    })

    connections.forEach(conn => {
      if (conn.line) {
        conn.line.geometry.dispose()
        conn.line.material.dispose()
        scene.remove(conn.line)
      }
    })

    particles.forEach(particle => {
      if (particle.mesh) {
        particle.mesh.geometry.dispose()
        particle.mesh.material.dispose()
        scene.remove(particle.mesh)
      }
    })

    if (renderer) {
      renderer.dispose()
    }
    if (scene) {
      scene.clear()
    }

    // Отключение Intersection Observer
    if (intersectionObserver && containerRef.value) {
      intersectionObserver.unobserve(containerRef.value)
      intersectionObserver.disconnect()
      intersectionObserver = null
    }

    objects = []
    connections = []
    particles = []
  }

  // Инициализация Intersection Observer
  const initIntersectionObserver = () => {
    if (!containerRef.value) return

    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0, // Срабатывает при любом пересечении
    }

    intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        console.log(
          'Intersection ratio:',
          entry.intersectionRatio,
          'Is intersecting:',
          entry.isIntersecting,
        )

        if (entry.isIntersecting) {
          // Элемент виден - запускаем анимацию
          console.log('Splash block is visible - starting animation')
          startAnimation()
        } else {
          // Элемент не виден - останавливаем анимацию
          console.log('Splash block is not visible - stopping animation')
          stopAnimation()
        }
      })
    }, options)

    intersectionObserver.observe(containerRef.value)
  }

  // Инициализация Three.js
  const initThreeJS = () => {
    if (!containerRef.value) return

    // Сцена
    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0a0a14, 15, 60)

    // Камера
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200,
    )
    camera.position.z = 25
    camera.position.y = 5

    // Рендерер
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Вставляем canvas в контейнер
    const canvas = renderer.domElement
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.zIndex = '0'
    containerRef.value.prepend(canvas)

    // Освещение
    const ambientLight = new THREE.AmbientLight(0x42b883, 0.3)
    ambientLight.name = 'ambientLight'
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x64d4b4, 0.8)
    directionalLight.name = 'directionalLight'
    directionalLight.position.set(10, 20, 15)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x42b883, 0.5, 50)
    pointLight.name = 'pointLight'
    pointLight.position.set(0, 10, 0)
    scene.add(pointLight)

    // Инициализация системы
    for (let i = 0; i < MIN_OBJECTS; i++) {
      createObject()
    }

    createParticles()

    // Запуск систем поддержания
    maintainInterval = setInterval(maintainObjects, 2000)
    connectionsInterval = setInterval(createRandomConnections, 1500)

    // Обработка ресайза
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Инициализация Intersection Observer
    initIntersectionObserver()

    // Проверка начальной видимости после небольшой задержки
    // Это гарантирует, что DOM полностью обновлен
    setTimeout(() => {
      if (isElementInViewport()) {
        console.log('Initial check: element is in viewport, starting animation')
        startAnimation()
      } else {
        console.log('Initial check: element is NOT in viewport, waiting for intersection')
      }
    }, 100)

    // Возвращаем функции для управления
    return {
      cleanup: () => {
        window.removeEventListener('resize', handleResize)
        cleanup()
      },
      updateBrightness: (value: number) => {
        globalBrightness = value
        updateBrightness()
      },
      updateSpeed: (value: number) => {
        globalSpeed = value
      },
      updateRotation: (value: number) => {
        globalRotation = value
      },
      updateConnectionDensity: (value: number) => {
        connectionDensity = value
      },
      startAnimation: () => {
        startAnimation()
      },
      stopAnimation: () => {
        stopAnimation()
      },
    }
  }

  // Инициализируем при монтировании
  onMounted(async () => {
    const controls = initThreeJS()

    // Очищаем при размонтировании
    onUnmounted(() => {
      if (controls) {
        controls.cleanup()
      }
    })

    return controls
  })

  return {
    updateBrightness: (value: number) => {
      globalBrightness = value
      updateBrightness()
    },
    updateSpeed: (value: number) => {
      globalSpeed = value
    },
    updateRotation: (value: number) => {
      globalRotation = value
    },
    updateConnectionDensity: (value: number) => {
      connectionDensity = value
    },
    startAnimation: () => {
      startAnimation()
    },
    stopAnimation: () => {
      stopAnimation()
    },
  }
}
