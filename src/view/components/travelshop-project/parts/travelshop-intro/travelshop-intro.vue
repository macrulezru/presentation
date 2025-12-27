<script setup lang="ts">
  import { computed, ref, onUnmounted } from 'vue';

  import { useTravelshopIntroStore } from '@/stores/use-travelshop-intro-store';
  import Music from '@/view/assets/music/control.mp3';
  import { useI18n } from '@/view/composables/use-i18n';
  import { useResponsive } from '@/view/composables/use-responsive.ts';
  import { useTravelshopCanvas } from '@/view/composables/use-travelshop-canvas';
  import Button from '@/view/ui/ui-button/ui-button.vue';

  import '@/view/components/travelshop-project/parts/travelshop-intro/travelshop-intro.scss';

  const { t } = useI18n();
  const { isDesktop } = useResponsive();

  const canvasContainer = ref<HTMLElement>();
  const audio = ref<HTMLAudioElement>();
  const isPlaying = ref(false);
  const isLoading = ref(false);
  const hasAudioLoaded = ref(false);
  const configFileInput = ref<HTMLInputElement>();

  const travelshopIntroStore = useTravelshopIntroStore();

  const { canvasRef, exportConfig, handleImportConfig } =
    useTravelshopCanvas(canvasContainer);

  const newAudio = computed(() => {
    return new Audio(Music);
  });

  const loadAudio = async (): Promise<HTMLAudioElement> => {
    if (audio.value && hasAudioLoaded.value) {
      return audio.value;
    }

    isLoading.value = true;

    // Устанавливаем свойства до загрузки
    newAudio.value.volume = 0.5;
    newAudio.value.loop = true;

    return new Promise((resolve, reject) => {
      newAudio.value.addEventListener(
        'canplaythrough',
        () => {
          audio.value = newAudio.value;
          hasAudioLoaded.value = true;
          isLoading.value = false;
          resolve(newAudio.value);
        },
        { once: true },
      );

      newAudio.value.addEventListener(
        'error',
        e => {
          console.error('Ошибка загрузки аудио:', e);
          isLoading.value = false;
          reject(new Error('Не удалось загрузить аудиофайл'));
        },
        { once: true },
      );

      // Начинаем загрузку
      newAudio.value.load();
    });
  };

  const triggerMusic = async () => {
    try {
      // Если аудио еще не загружено, загружаем его
      if (!hasAudioLoaded.value) {
        await loadAudio();
      }

      if (!audio.value) {
        console.error('Аудио элемент не создан');
        return;
      }

      if (isPlaying.value) {
        // Ставим на паузу
        audio.value.pause();
        isPlaying.value = false;
      } else {
        // Воспроизводим
        await audio.value.play();
        isPlaying.value = true;
      }
    } catch (error) {
      console.error('Ошибка управления аудио:', error);
      isPlaying.value = false;
      // Сбрасываем состояние загрузки при ошибке
      if (error instanceof Error && error.message === 'Не удалось загрузить аудиофайл') {
        hasAudioLoaded.value = false;
        audio.value = undefined;
      }
    }
  };

  const handleExportConfig = () => {
    exportConfig();
  };

  const handleImportClick = () => {
    configFileInput.value?.click();
  };

  onUnmounted(() => {
    if (audio.value) {
      audio.value.pause();
      audio.value = undefined;
    }
    isPlaying.value = false;
    hasAudioLoaded.value = false;
  });
</script>

<template>
  <div ref="canvasContainer" class="travelshop-intro">
    <div
      class="travelshop-intro__wrapper"
      :class="{
        'travelshop-intro__wrapper_dev-mode': travelshopIntroStore.showDebugControls,
      }"
    >
      <canvas ref="canvasRef" class="travelshop-intro__canvas" />
    </div>

    <template v-if="isDesktop">
      <span
        v-if="!travelshopIntroStore.showDebugControls"
        class="travelshop-intro__toggle-wrapper"
        @click="travelshopIntroStore.toggleDebugControls"
      >
        <span class="travelshop-intro__toggle-controls" />
        <span>{{ t('tshIntro.buttons.flight-control') }}</span>
      </span>
      <div
        v-if="travelshopIntroStore.showDebugControls"
        class="travelshop-intro__controls"
      >
        <div class="travelshop-intro__controls-header">
          <div class="travelshop-intro__controls-header-title">
            <span class="travelshop-intro__controls-title">
              {{ t('tshIntro.buttons.settings') }}
            </span>
            <Button control @click="handleExportConfig">
              {{ t('tshIntro.buttons.export') }}
            </Button>
            <Button control @click="handleImportClick">
              {{ t('tshIntro.buttons.import') }}
            </Button>
            <Button control reset @click="travelshopIntroStore.resetToDefaults">
              {{ t('tshIntro.buttons.resetSettings') }}
            </Button>
            <button
              class="travelshop-intro__music-btn"
              :class="{
                'travelshop-intro__music-btn--loading': isLoading,
                'travelshop-intro__music-btn--playing': isPlaying && !isLoading,
              }"
              :disabled="isLoading"
              :title="
                isLoading
                  ? t('tshIntro.buttons.loadingMusic')
                  : isPlaying
                    ? t('tshIntro.buttons.pauseMusic')
                    : t('tshIntro.buttons.playMusic')
              "
              @click="triggerMusic"
            >
              <span class="travelshop-intro__music-icon">
                <svg
                  v-if="isLoading"
                  class="travelshop-intro__music-loading-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <!-- Иконка загрузки/спиннера -->
                  <path
                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                  />
                </svg>
                <svg
                  v-else-if="!isPlaying"
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
            :title="t('tshIntro.buttons.close')"
            @click="travelshopIntroStore.toggleDebugControls"
          >
            ×
          </button>
        </div>

        <div class="travelshop-intro__controls-wrapper">
          <div
            v-for="(params, category) in travelshopIntroStore.debugParams"
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
                class="travelshop-intro__controls-slider"
                @input="
                  travelshopIntroStore.updateDebugParam(
                    param.id,
                    parseFloat(($event.target as HTMLInputElement).value),
                  )
                "
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
      ref="configFileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleImportConfig"
    />
  </div>
</template>
