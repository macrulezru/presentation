import * as THREE from 'three';

import type { PlasmaConfig } from './types';

export function useParticles() {
  const createPlasmaParticles = (config: PlasmaConfig, isMobile: boolean = false) => {
    // Используем адаптивное количество частиц
    const particleCount = isMobile
      ? config.mobileParticleCount || Math.floor(config.particleCount * 0.5)
      : config.particleCount;

    const positions = new Float32Array(particleCount * 3);
    const colorsArray = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    const colorPhases = new Float32Array(particleCount);

    const getSafeColors = (): [THREE.Color, THREE.Color, THREE.Color, THREE.Color] => {
      const defaultColors: [THREE.Color, THREE.Color, THREE.Color, THREE.Color] = [
        new THREE.Color(0x000a99),
        new THREE.Color(0x0044aa),
        new THREE.Color(0x0088bb),
        new THREE.Color(0x00aa88),
      ];

      if (!config.currentColors || !Array.isArray(config.currentColors)) {
        return defaultColors;
      }

      const colors: [THREE.Color, THREE.Color, THREE.Color, THREE.Color] = [
        defaultColors[0],
        defaultColors[1],
        defaultColors[2],
        defaultColors[3],
      ];

      const maxColors = Math.min(4, config.currentColors.length);
      for (let i = 0; i < maxColors; i++) {
        const configColor = config.currentColors[i];
        if (configColor && configColor instanceof THREE.Color) {
          colors[i] = configColor;
        }
      }

      return colors;
    };

    const safeColors = getSafeColors();

    for (let i = 0; i < particleCount; i++) {
      const isFrontZone = Math.random() < 0.65;

      let x = 0,
        y = 0,
        z = 0;

      if (isFrontZone) {
        const radius = 12 + Math.random() * 28;
        const phi = Math.acos(1 - Math.random() * 1.6);
        const theta = Math.random() * Math.PI * 2;
        x = radius * Math.sin(phi) * Math.cos(theta) * 0.9;
        y = radius * Math.sin(phi) * Math.sin(theta) * 0.9;
        z = radius * Math.cos(phi) * (1.3 + Math.random() * 0.4);
      } else {
        const radius = 22 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const colorProgress = Math.random();
      const color = new THREE.Color();

      if (colorProgress < 0.25) {
        color.copy(safeColors[0]).lerp(safeColors[1], colorProgress * 4);
      } else if (colorProgress < 0.5) {
        color.copy(safeColors[1]).lerp(safeColors[2], (colorProgress - 0.25) * 4);
      } else if (colorProgress < 0.75) {
        color.copy(safeColors[2]).lerp(safeColors[3], (colorProgress - 0.5) * 4);
      } else {
        color.copy(safeColors[3]).lerp(safeColors[0], (colorProgress - 0.75) * 4);
      }

      color.multiplyScalar(0.78);
      colorsArray[i * 3] = color.r;
      colorsArray[i * 3 + 1] = color.g;
      colorsArray[i * 3 + 2] = color.b;

      const distanceFromCenter = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      const sizeMultiplier = Math.max(0.6, 1.1 - distanceFromCenter / 80);
      sizes[i] = config.particleSize * (0.7 + Math.random() * 1.0) * sizeMultiplier;
      phases[i] = Math.random() * Math.PI * 2;
      colorPhases[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('colorPhase', new THREE.BufferAttribute(colorPhases, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: config.particleSpeed },
        uCycleProgress: { value: 0 },
        uParticleBrightness: { value: config.particleBrightness },
        uColors: {
          value: safeColors,
        },
        uFrontBias: { value: 1.5 },
      },
      vertexShader: `
        precision mediump float;
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
        precision mediump float;
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
    });

    return new THREE.Points(geometry, material);
  };

  const createGlowParticles = (config: PlasmaConfig, isMobile: boolean = false) => {
    // Используем адаптивное количество частиц
    const particleCount = isMobile
      ? config.mobileGlowParticleCount || Math.floor(config.glowParticleCount * 0.5)
      : config.glowParticleCount;

    const positions = new Float32Array(particleCount * 3);
    const colorsArray = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colorPhases = new Float32Array(particleCount);

    const getSafeColors = (): [THREE.Color, THREE.Color, THREE.Color, THREE.Color] => {
      const defaultColors: [THREE.Color, THREE.Color, THREE.Color, THREE.Color] = [
        new THREE.Color(0x000a99),
        new THREE.Color(0x0044aa),
        new THREE.Color(0x0088bb),
        new THREE.Color(0x00aa88),
      ];

      if (!config.currentColors || !Array.isArray(config.currentColors)) {
        return defaultColors;
      }

      const colors: [THREE.Color, THREE.Color, THREE.Color, THREE.Color] = [
        defaultColors[0],
        defaultColors[1],
        defaultColors[2],
        defaultColors[3],
      ];

      const maxColors = Math.min(4, config.currentColors.length);
      for (let i = 0; i < maxColors; i++) {
        const configColor = config.currentColors[i];
        if (configColor && configColor instanceof THREE.Color) {
          colors[i] = configColor;
        }
      }

      return colors;
    };

    const safeColors = getSafeColors();

    for (let i = 0; i < particleCount; i++) {
      const isFrontZone = Math.random() < 0.7;

      let x = 0,
        y = 0,
        z = 0;

      if (isFrontZone) {
        const radius = 6 + Math.random() * 18;
        const phi = Math.acos(1 - Math.random() * 1.4);
        const theta = Math.random() * Math.PI * 2;
        x = radius * Math.sin(phi) * Math.cos(theta) * 0.7;
        y = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
        z = radius * Math.cos(phi) * (1.3 + Math.random() * 0.3);
      } else {
        const radius = 12 + Math.random() * 25;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const colorIndex = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
      const color = safeColors[colorIndex].clone();
      color.multiplyScalar(1.04);
      colorsArray[i * 3] = color.r;
      colorsArray[i * 3 + 1] = color.g;
      colorsArray[i * 3 + 2] = color.b;

      const zPos = Math.abs(z);
      const sizeMultiplier = zPos < 15 ? 1.4 : 0.9;
      sizes[i] = config.glowParticleSize * (0.8 + Math.random() * 1.0) * sizeMultiplier;
      colorPhases[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('colorPhase', new THREE.BufferAttribute(colorPhases, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: config.glowParticleSpeed },
        uCycleProgress: { value: 0 },
        uGlowBrightness: { value: config.glowParticleBrightness },
      },
      vertexShader: `
        precision mediump float;
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
        precision mediump float;
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
    });

    return new THREE.Points(geometry, material);
  };

  const updateParticleBrightness = (
    config: PlasmaConfig,
    plasmaParticles: THREE.Points | null,
    glowParticles: THREE.Points | null,
    brightness: number,
  ) => {
    config.particleBrightness = brightness;
    config.glowParticleBrightness = brightness;

    if (plasmaParticles?.material instanceof THREE.ShaderMaterial) {
      const { uniforms } = plasmaParticles.material;
      if (uniforms.uParticleBrightness) {
        uniforms.uParticleBrightness.value = brightness;
      }
    }
    if (glowParticles?.material instanceof THREE.ShaderMaterial) {
      const { uniforms } = glowParticles.material;
      if (uniforms.uGlowBrightness) {
        uniforms.uGlowBrightness.value = brightness;
      }
    }
  };

  return {
    createPlasmaParticles,
    createGlowParticles,
    updateParticleBrightness,
  };
}
