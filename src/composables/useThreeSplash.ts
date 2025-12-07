// @ts-nocheck
import * as THREE from 'three'
import { onMounted, onUnmounted, type Ref } from 'vue'

export function usePlasmaBackground(containerRef: Ref<HTMLElement | undefined>) {
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let animationFrameId: number

  let time = 0
  let isAnimationActive = false
  let colorCycleTime = 0

  let mouseX = 0
  let mouseY = 0
  let normalizedMouseX = 0
  let normalizedMouseY = 0
  let targetMouseX = 0
  let targetMouseY = 0
  let mouseInfluence = 0
  let mouseActive = false
  let lastMouseMoveTime = 0
  const MOUSE_DECAY_RATE = 0.05
  const MOUSE_INFLUENCE_RADIUS = 0.4
  const MOUSE_SWIRL_FORCE = 1.2

  let intersectionObserver: IntersectionObserver | null = null

  let plasmaField: THREE.Mesh | null = null
  let plasmaParticles: THREE.Points | null = null
  let glowParticles: THREE.Points | null = null

  const COLOR_CYCLE_DURATION = 30
  const MIN_BRIGHTNESS = 0.05
  const MAX_BRIGHTNESS = 0.3

  const PLASMA_CONFIG = {
    baseColors: [
      new THREE.Color(0x000a99),
      new THREE.Color(0x0044aa),
      new THREE.Color(0x0088bb),
      new THREE.Color(0x00aa88),
      new THREE.Color(0x00bb44),
      new THREE.Color(0x88bb00),
      new THREE.Color(0xbb8800),
      new THREE.Color(0xbb4400),
      new THREE.Color(0xbb0044),
      new THREE.Color(0x8800bb),
      new THREE.Color(0x4400aa),
      new THREE.Color(0x000a99),
    ],

    currentColors: [] as THREE.Color[],

    fieldSize: 120,
    fieldDetail: 200,
    fieldSpeed: 0.6,
    fieldAmplitude: 5.0,

    particleCount: 12000,
    particleSize: 0.1,
    particleSpeed: 0.8,
    particleBrightness: 1.3,

    glowParticleCount: 1000,
    glowParticleSize: 0.2,
    glowParticleSpeed: 0.5,
    glowParticleBrightness: 1.3,

    brightness: 0.225,
    pulseIntensity: 0.1,

    fogDensity: 0.02,

    enableWaves: true,
    enablePulse: true,
    enableFlow: true,
    enableSwirl: true,
    enableColorCycle: true,
    enableMouseInteraction: true,
  }

  const initColors = () => {
    PLASMA_CONFIG.currentColors = [
      PLASMA_CONFIG.baseColors[0].clone(),
      PLASMA_CONFIG.baseColors[3].clone(),
      PLASMA_CONFIG.baseColors[6].clone(),
      PLASMA_CONFIG.baseColors[9].clone(),
    ]
  }

  const updateMousePosition = (event: MouseEvent) => {
    if (!containerRef.value || !PLASMA_CONFIG.enableMouseInteraction) return

    const rect = containerRef.value.getBoundingClientRect()

    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.top

    targetMouseX = (mouseX / rect.width) * 2 - 1
    targetMouseY = -(mouseY / rect.height) * 2 + 1

    lastMouseMoveTime = Date.now()
    mouseActive = true

    mouseInfluence = Math.min(mouseInfluence + 0.2, 1.0)
  }

  const smoothMouseUpdate = () => {
    const smoothing = 0.1
    normalizedMouseX += (targetMouseX - normalizedMouseX) * smoothing
    normalizedMouseY += (targetMouseY - normalizedMouseY) * smoothing

    if (Date.now() - lastMouseMoveTime > 1000) {
      mouseInfluence = Math.max(mouseInfluence - MOUSE_DECAY_RATE, 0)
      if (mouseInfluence < 0.01) {
        mouseActive = false
      }
    }
  }

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

      PLASMA_CONFIG.currentColors[i].multiplyScalar(0.7)
    }

    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      plasmaField.material.uniforms.uColor1.value = PLASMA_CONFIG.currentColors[0]
      plasmaField.material.uniforms.uColor2.value = PLASMA_CONFIG.currentColors[1]
      plasmaField.material.uniforms.uColor3.value = PLASMA_CONFIG.currentColors[2]
      plasmaField.material.uniforms.uColor4.value = PLASMA_CONFIG.currentColors[3]
    }
  }

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
      varying float vDistanceToMouse;
      uniform float uTime;
      uniform float uAmplitude;
      uniform float uSpeed;
      uniform bool uEnableWaves;
      uniform bool uEnableSwirl;
      uniform vec2 uMousePos;
      uniform float uMouseInfluence;
      uniform bool uMouseActive;

      void main() {
        vUv = uv;
        vPosition = position;

        vec3 newPosition = position;

        vec2 mouseDist = position.xy - uMousePos * 60.0;
        float distanceToMouse = length(mouseDist);
        vDistanceToMouse = distanceToMouse;

        float mouseEffect = 0.0;
        float swirlEffect = 0.0;

        if (uMouseActive && uMouseInfluence > 0.01) {
          float mouseRadius = 60.0 * ${MOUSE_INFLUENCE_RADIUS.toFixed(3)};
          float mouseStrength = uMouseInfluence * ${MOUSE_SWIRL_FORCE.toFixed(3)};

          float gaussian = exp(-distanceToMouse * distanceToMouse / (mouseRadius * mouseRadius * 0.5));
          mouseEffect = gaussian * mouseStrength;

          if (distanceToMouse < mouseRadius * 2.0) {
            float angle = atan(mouseDist.y, mouseDist.x);

            float swirl = -gaussian * mouseStrength * 0.8;

            float centerIntensity = 1.0 - smoothstep(0.0, mouseRadius, distanceToMouse);
            swirl *= centerIntensity * 1.5;

            float cosA = cos(swirl);
            float sinA = sin(swirl);
            float rotatedX = mouseDist.x * cosA - mouseDist.y * sinA;
            float rotatedY = mouseDist.x * sinA + mouseDist.y * cosA;

            newPosition.x = uMousePos.x * 60.0 + rotatedX;
            newPosition.y = uMousePos.y * 60.0 + rotatedY;

            mouseEffect = gaussian * mouseStrength * 0.3 * sin(distanceToMouse * 0.1 - uTime * 2.0);
          }
        }

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

          newPosition.z = wave1 + wave2 + wave3 + wave4 + mouseEffect * 8.0;
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
      varying float vDistanceToMouse;
      uniform float uTime;
      uniform float uBrightness;
      uniform bool uEnablePulse;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform vec3 uColor4;
      uniform vec2 uMousePos;
      uniform float uMouseInfluence;
      uniform bool uMouseActive;

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

        if (uMouseActive && uMouseInfluence > 0.01) {
          float mouseGlow = smoothstep(0.5, 0.0, vDistanceToMouse / 40.0);
          mouseGlow *= uMouseInfluence * 0.4;

          vec3 glowColor = mix(uColor1, uColor2, 0.5);
          color += glowColor * mouseGlow * 0.6;

          vec2 toMouse = vPosition.xy - uMousePos * 60.0;
          float angle = atan(toMouse.y, toMouse.x);
          float spiral = sin(angle * 4.0 + uTime * 3.0 - length(toMouse) * 0.1);

          float spiralIntensity = smoothstep(0.4, 0.1, vDistanceToMouse / 50.0);
          color += glowColor * spiral * spiralIntensity * uMouseInfluence * 0.2;

          float brightnessBoost = smoothstep(0.3, 0.0, vDistanceToMouse / 60.0);
          color *= (1.0 + brightnessBoost * 0.15 * uMouseInfluence);
        }

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
        uMousePos: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: 0 },
        uMouseActive: { value: false },
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

  const updateBrightness = (brightness: number) => {
    PLASMA_CONFIG.brightness = Math.max(
      MIN_BRIGHTNESS,
      Math.min(MAX_BRIGHTNESS, brightness),
    )

    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      plasmaField.material.uniforms.uBrightness.value = PLASMA_CONFIG.brightness
    }
  }

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

  const toggleMouseInteraction = (enabled: boolean) => {
    PLASMA_CONFIG.enableMouseInteraction = enabled
    if (!enabled) {
      mouseActive = false
      mouseInfluence = 0
    }
  }

  const animate = () => {
    if (!isAnimationActive) {
      return
    }

    animationFrameId = requestAnimationFrame(animate)
    const deltaTime = 16
    const deltaTimeSeconds = deltaTime * 0.001
    time += deltaTimeSeconds

    smoothMouseUpdate()

    updateColorCycle(deltaTimeSeconds)

    const cycleProgress = (colorCycleTime % COLOR_CYCLE_DURATION) / COLOR_CYCLE_DURATION

    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      plasmaField.material.uniforms.uTime.value = time
      plasmaField.material.uniforms.uMousePos.value.set(
        normalizedMouseX,
        normalizedMouseY,
      )
      plasmaField.material.uniforms.uMouseInfluence.value = mouseInfluence
      plasmaField.material.uniforms.uMouseActive.value = mouseActive
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

    if (plasmaField) {
      plasmaField.rotation.y += 0.0002 * PLASMA_CONFIG.fieldSpeed
      plasmaField.rotation.z += 0.0001 * PLASMA_CONFIG.fieldSpeed

      if (PLASMA_CONFIG.enablePulse) {
        const pulse = Math.sin(time * 0.8) * 0.02 + 1
        plasmaField.scale.setScalar(pulse)
      }
    }

    camera.position.x = Math.sin(time * 0.008) * 1.5
    camera.position.y = 5 + Math.cos(time * 0.006) * 0.5
    camera.position.z = 15 + Math.sin(time * 0.005) * 1
    camera.lookAt(0, -5, 0)

    const pointLight = scene.getObjectByName('mainPointLight') as THREE.PointLight
    if (pointLight && PLASMA_CONFIG.enablePulse) {
      pointLight.intensity = 0.4 + Math.sin(time * 0.6) * 0.08

      pointLight.position.x = Math.sin(time * 0.04) * 4
      pointLight.position.y = 4 + Math.cos(time * 0.03) * 1.5
      pointLight.position.z = Math.cos(time * 0.035) * 4
    }

    renderer.render(scene, camera)
  }

  const stopAnimation = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
    isAnimationActive = false
  }

  const startAnimation = () => {
    if (!isAnimationActive) {
      isAnimationActive = true
      animate()
    }
  }

  const isElementInViewport = () => {
    if (!containerRef.value) return false

    const rect = containerRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const windowWidth = window.innerWidth || document.documentElement.clientWidth

    const vertInView = rect.top <= windowHeight && rect.bottom >= 0
    const horInView = rect.left <= windowWidth && rect.right >= 0

    return vertInView && horInView
  }

  const cleanup = () => {
    stopAnimation()

    if (containerRef.value) {
      containerRef.value.removeEventListener('mousemove', updateMousePosition)
    }

    if (intersectionObserver && containerRef.value) {
      intersectionObserver.unobserve(containerRef.value)
      intersectionObserver.disconnect()
      intersectionObserver = null
    }

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

  const initThreeJS = () => {
    if (!containerRef.value) return

    initColors()

    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000011, 10, 60)

    camera = new THREE.PerspectiveCamera(
      110,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 5, 15)
    camera.lookAt(0, -5, 0)

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000011, 1)

    const canvas = renderer.domElement
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100dvh'
    canvas.style.zIndex = '0'
    canvas.style.pointerEvents = 'auto'
    containerRef.value.prepend(canvas)

    containerRef.value.addEventListener('mousemove', updateMousePosition)

    const ambientLight = new THREE.AmbientLight(0x220099, 0.1)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x440099, 0.2)
    directionalLight.position.set(3, 10, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x660099, 0.4, 80)
    pointLight.name = 'mainPointLight'
    pointLight.position.set(0, 4, 0)
    scene.add(pointLight)

    plasmaField = createPlasmaField()
    scene.add(plasmaField)

    plasmaParticles = createPlasmaParticles()
    scene.add(plasmaParticles)

    glowParticles = createGlowParticles()
    scene.add(glowParticles)

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    initIntersectionObserver()

    setTimeout(() => {
      if (isElementInViewport()) {
        startAnimation()
      }
    }, 150)

    return {
      cleanup: () => {
        window.removeEventListener('resize', handleResize)
        if (containerRef.value) {
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
      toggleMouseInteraction: (enabled: boolean) => {
        toggleMouseInteraction(enabled)
      },
      updateCameraPosition: (x: number, y: number, z: number) => {
        camera.position.set(x, y, z)
        camera.lookAt(0, -5, 0)
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
      getConfig: () => ({
        ...PLASMA_CONFIG,
        colorCycleDuration: COLOR_CYCLE_DURATION,
        minBrightness: MIN_BRIGHTNESS,
        maxBrightness: MAX_BRIGHTNESS,
      }),
      setConfig: (config: Partial<typeof PLASMA_CONFIG>) => {
        Object.assign(PLASMA_CONFIG, config)
        updateBrightness(PLASMA_CONFIG.brightness)
        updateParticleBrightness(PLASMA_CONFIG.particleBrightness)
      },
    }
  }

  onMounted(async () => {
    const controls = initThreeJS()

    onUnmounted(() => {
      if (controls) {
        controls.cleanup()
      }
    })

    return controls
  })

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
    toggleMouseInteraction: (enabled: boolean) => {
      toggleMouseInteraction(enabled)
    },
    startAnimation: () => {
      startAnimation()
    },
    stopAnimation: () => {
      stopAnimation()
    },
  }
}
