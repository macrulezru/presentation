<script setup lang="ts">
  import '@/view/components/travelshop-project/parts/travelshop-intro/travelshop-intro.scss'

  import { ref } from 'vue'
  import { useTravelshopCanvas } from '@/view/composables/use-travelshop-animation'
  import { useResponsive } from '@/view/composables/use-responsive.ts'
  const { t } = useI18n()

  const { isDesktop } = useResponsive()

  const canvasContainer = ref<HTMLElement>()

  const {
    canvasRef,
    showDebugControls,
    debugParams,
    toggleDebugControls,
    updateDebugParam,
    resetToDefaults,
  } = useTravelshopCanvas(canvasContainer)
</script>

<template>
  <div class="travelshop-intro" ref="canvasContainer">
    <div class="travelshop-intro__wrapper">
      <canvas ref="canvasRef" class="travelshop-intro__canvas" />
    </div>

    <template v-if="isDesktop">
      <span
        v-if="!showDebugControls"
        class="travelshop-intro__toggle-wrapper"
        @click="toggleDebugControls"
      >
        <span class="travelshop-intro__toggle-controls">⚙️</span>
        <span>{{ t('tshIntro.buttons.flight-control') }}</span>
      </span>
      <div v-if="showDebugControls" class="travelshop-intro__controls">
        <div class="travelshop-intro__controls-header">
          <div class="travelshop-intro__controls-header-title">
            <span class="travelshop-intro__controls-title">
              {{ t('tshIntro.buttons.settings') }}
            </span>
            <button class="travelshop-intro__controls-reset" @click="resetToDefaults">
              {{ t('tshIntro.buttons.resetSettings') }}
            </button>
          </div>
          <button
            class="travelshop-intro__controls-close"
            @click="toggleDebugControls"
            :title="t('tshIntro.buttons.close')"
          >
            ×
          </button>
        </div>

        <div class="travelshop-intro__controls-wrapper">
          <div
            v-for="(params, category) in debugParams"
            :key="category"
            class="travelshop-intro__controls-category"
          >
            <h4 class="travelshop-intro__controls-category-title">
              {{ t(`tshIntro.categories.${category}`) }}
            </h4>

            <div
              v-for="param in params"
              :key="param.id"
              class="travelshop-intro__controls-param"
            >
              <div class="travelshop-intro__controls-param-label">
                <label :for="param.id" class="travelshop-intro__controls-param-text">
                  {{ t(`tshIntro.parameters.${param.id}`) }}
                </label>
                <span class="travelshop-intro__controls-param-value">
                  {{ param.value.toFixed(param.step < 1 ? 2 : 0) }}
                </span>
              </div>
              <input
                :id="param.id"
                type="range"
                :min="param.min"
                :max="param.max"
                :step="param.step"
                :value="param.value"
                @input="
                  updateDebugParam(
                    param.id,
                    parseFloat(($event.target as HTMLInputElement).value),
                  )
                "
                class="travelshop-intro__controls-slider"
              />
              <div class="travelshop-intro__controls-info">
                {{ t(`tshIntro.info.${param.id}`) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
