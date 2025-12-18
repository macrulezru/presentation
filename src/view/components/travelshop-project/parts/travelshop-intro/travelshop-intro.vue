<script setup lang="ts">
  import Button from '@/view/ui/ui-button/ui-button.vue'

  import '@/view/components/travelshop-project/parts/travelshop-intro/travelshop-intro.scss'

  import Music from '@/view/assets/music/control.mp3'

  import { ref } from 'vue'
  import { useTravelshopCanvas } from '@/view/composables/use-travelshop-animation'
  import { useResponsive } from '@/view/composables/use-responsive.ts'

  const { t } = useI18n()

  const { isDesktop } = useResponsive()

  const canvasContainer = ref<HTMLElement>()
  const audio = ref<HTMLAudioElement>()
  const isPlaying = ref(false)
  const audioError = ref(false)
  const configFileInput = ref<HTMLInputElement>()

  const {
    canvasRef,
    showDebugControls,
    debugParams,
    toggleDebugControls,
    updateDebugParam,
    resetToDefaults,
    exportConfig,
    importConfig,
  } = useTravelshopCanvas(canvasContainer)

  const triggerMusic = async () => {
    if (!audio.value) {
      return
    }

    if (isPlaying.value) {
      audio.value.pause()
      isPlaying.value = false
      audioError.value = false
    } else {
      try {
        await audio.value.play()
        isPlaying.value = true
        audioError.value = false
      } catch (error) {
        console.error('Ошибка воспроизведения:', error)
        audioError.value = true
      }
    }
  }

  const handleExportConfig = () => {
    exportConfig()
  }

  const handleImportConfig = () => {
    configFileInput.value?.click()
  }

  onMounted(() => {
    audio.value = new Audio(Music)
    audio.value.volume = 0.5
    audio.value.loop = true

    setTimeout(() => {
      if (!isPlaying.value && audio.value) {
        audio.value
          .play()
          .then(() => {
            isPlaying.value = true
          })
          .catch(() => {
            // Игнорируем ошибку - пользователь включит вручную
          })
      }
    }, 1000)
  })

  onUnmounted(() => {
    if (audio.value) {
      audio.value.pause()
    }
  })
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
        <span class="travelshop-intro__toggle-controls" />
        <span>{{ t('tshIntro.buttons.flight-control') }}</span>
      </span>
      <div v-if="showDebugControls" class="travelshop-intro__controls">
        <div class="travelshop-intro__controls-header">
          <div class="travelshop-intro__controls-header-title">
            <span class="travelshop-intro__controls-title">
              {{ t('tshIntro.buttons.settings') }}
            </span>
            <Button control @click="handleExportConfig">
              {{ t('tshIntro.buttons.export') }}
            </Button>
            <Button control @click="handleImportConfig">
              {{ t('tshIntro.buttons.import') }}
            </Button>
            <Button control reset @click="resetToDefaults">
              {{ t('tshIntro.buttons.resetSettings') }}
            </Button>
            <button
              class="travelshop-intro__music-btn"
              @click="triggerMusic"
              :class="{
                'travelshop-intro__music-btn--playing': isPlaying,
                'travelshop-intro__music-btn--error': audioError,
              }"
              :title="
                isPlaying
                  ? t('tshIntro.buttons.pauseMusic')
                  : t('tshIntro.buttons.playMusic')
              "
            >
              <span class="travelshop-intro__music-icon">
                <svg
                  v-if="!isPlaying"
                  class="travelshop-intro__music-play-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <svg
                  v-else
                  class="travelshop-intro__music-pause-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              </span>
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

    <input
      type="file"
      ref="configFileInput"
      accept=".json"
      style="display: none"
      @change="importConfig"
    />
  </div>
</template>
