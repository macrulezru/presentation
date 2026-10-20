<script setup lang="ts">
  import { type NeonWavesConfig } from '@/view/composables/useNeonWaves';

  const props = defineProps<{
    config: NeonWavesConfig;
  }>();

  const format = (val: number) => Math.round(val * 100) / 100;

  // Функция для конвертации rgba в hex (для input type="color")
  const rgbaToHex = (rgba: string) => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#000000';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  // Функция для конвертации hex в rgba (сохраняем исходную альфу)
  const hexToRgba = (hex: string, originalRgba: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const alphaMatch = originalRgba.match(/,\s*([\d.]+)\)$/);
    const alpha = alphaMatch ? alphaMatch[1] : '1';
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
</script>

<template>
  <div class="debug-panel">
    <h3>Настройки волн</h3>

    <div class="section">
      <label>Яркость: {{ format(config.maxBrightness) }}</label>
      <input
        v-model.number="config.maxBrightness"
        type="range"
        min="0"
        max="1"
        step="0.01"
      />
    </div>

    <div class="section">
      <label>Отступ (gap): {{ config.gap }}</label>
      <input v-model.number="config.gap" type="range" min="100" max="800" step="10" />
    </div>

    <div class="section">
      <label>Пульсация: {{ format(config.pulseAmp) }}</label>
      <input
        v-model.number="config.pulseAmp"
        type="range"
        min="0"
        max="0.5"
        step="0.01"
      />
    </div>

    <div class="section">
      <label>Затухание: {{ config.fadeEdgeWidth }}</label>
      <input
        v-model.number="config.fadeEdgeWidth"
        type="range"
        min="0"
        max="500"
        step="10"
      />
    </div>

    <!-- Настройки волн -->
    <div class="waves-settings">
      <h4>Волны</h4>
      <div v-for="(wave, idx) in config.waves" :key="idx" class="wave-item">
        <span>Волна {{ idx + 1 }} ({{ wave.zone }})</span>

        <label>Толщина: {{ wave.thickness }}</label>
        <input v-model.number="wave.thickness" type="range" min="10" max="400" step="5" />

        <label>Амплитуда: {{ wave.amp }}</label>
        <input v-model.number="wave.amp" type="range" min="0" max="300" step="5" />

        <label>Цвет (top)</label>
        <input
          type="color"
          :value="rgbaToHex(config.colors[wave.color].top)"
          @input="
            e =>
              (config.colors[wave.color].top = hexToRgba(
                (e.target as HTMLInputElement).value,
                config.colors[wave.color].top,
              ))
          "
        />
      </div>
    </div>

    <!-- Настройки слоёв ленты -->
    <div class="layers-settings">
      <h4>Слои ленты (ribbonLayers)</h4>
      <div v-for="(layer, idx) in config.ribbonLayers" :key="idx" class="layer-item">
        <span>Слой {{ idx + 1 }}</span>
        <label>Масштаб: {{ format(layer.scale) }}</label>
        <input v-model.number="layer.scale" type="range" min="0" max="1" step="0.05" />
        <label>Прозрачность: {{ format(layer.alpha) }}</label>
        <input v-model.number="layer.alpha" type="range" min="0" max="1" step="0.05" />
      </div>
    </div>

    <!-- Настройки слоёв линий -->
    <div class="layers-settings">
      <h4>Слои линий (edgeLayers)</h4>
      <div v-for="(layer, idx) in config.edgeLayers" :key="idx" class="layer-item">
        <span>Слой {{ idx + 1 }} ({{ layer.colorKey }})</span>
        <label>Ширина: {{ format(layer.width) }}</label>
        <input v-model.number="layer.width" type="range" min="0.1" max="10" step="0.1" />
        <label>Прозрачность: {{ format(layer.alpha) }}</label>
        <input v-model.number="layer.alpha" type="range" min="0" max="1" step="0.05" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .debug-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    max-height: 90vh;
    overflow-y: auto;
    background: rgb(20 20 20 / 90%);
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgb(0 0 0 / 50%);
    border: 1px solid #333;
  }

  .section {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .section label {
    color: #adb9c1;
  }

  input[type='range'] {
    width: 100%;
  }

  input[type='color'] {
    width: 100%;
    height: 30px;
    border: none;
    cursor: pointer;
    background: none;
  }

  .wave-item,
  .layer-item {
    margin-bottom: 15px;
    padding: 10px;
    background: rgb(255 255 255 / 5%);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  h3,
  h4 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #8aec0b;
  }
</style>
