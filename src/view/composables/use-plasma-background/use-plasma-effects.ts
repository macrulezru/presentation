import * as THREE from 'three'
import { MIN_BRIGHTNESS, MAX_BRIGHTNESS } from './config'
import type { PlasmaConfig } from './types'

export function usePlasmaEffects() {
  const createPlasmaField = (config: PlasmaConfig) => {
    const geometry = new THREE.PlaneGeometry(
      config.fieldSize,
      config.fieldSize,
      config.fieldDetail,
      config.fieldDetail,
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

    // Безопасные цвета
    const safeColors = [
      config.currentColors[0] || new THREE.Color(0x000a99),
      config.currentColors[1] || new THREE.Color(0x0044aa),
      config.currentColors[2] || new THREE.Color(0x0088bb),
      config.currentColors[3] || new THREE.Color(0x00aa88),
    ]

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: config.fieldAmplitude },
        uSpeed: { value: config.fieldSpeed },
        uBrightness: { value: config.brightness },
        uEnableWaves: { value: config.enableWaves },
        uEnablePulse: { value: config.enablePulse },
        uEnableSwirl: { value: config.enableSwirl },
        uColor1: { value: safeColors[0] },
        uColor2: { value: safeColors[1] },
        uColor3: { value: safeColors[2] },
        uColor4: { value: safeColors[3] },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = -8
    return mesh
  }

  const updateBrightness = (
    config: PlasmaConfig,
    plasmaField: THREE.Mesh | null,
    brightness: number,
  ) => {
    config.brightness = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, brightness))

    if (plasmaField?.material instanceof THREE.ShaderMaterial) {
      const uniforms = plasmaField.material.uniforms
      if (uniforms.uBrightness) {
        uniforms.uBrightness.value = config.brightness
      }
    }
  }

  return {
    createPlasmaField,
    updateBrightness,
  }
}
