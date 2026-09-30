<script setup lang="ts">
  import './seat-map.scss';

  import { ref } from 'vue';

  import SeatMapViewer from './components/skins/skinA/SeatMapViewer.vue';
  import ErrorBanner from './components/ui/ErrorBanner.vue';
  import JsonCodeMirror from './components/ui/JsonCodeMirror/JsonCodeMirror.vue';
  import { samples, loadSampleData, type SampleData } from './data';
  import { useSeatMapStore } from './stores/seatMap.store';

  import { parseSeatMap } from './index';

  import UiLoading from '@/view/ui/ui-loading/ui-loading.vue';
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();

  const store = useSeatMapStore();

  const selectedSample = ref('');
  const rawData = ref<unknown>(null);
  const currentClientId = ref('');
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  let loadToken = 0;

  async function loadData(clientId: string) {
    const token = ++loadToken;

    if (!clientId) {
      rawData.value = null;
      currentClientId.value = '';
      error.value = null;
      store.clearSelection();
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await loadSampleData(clientId);
      const universal = await parseSeatMap({
        clientId: result.clientId,
        data: result.data,
      });

      if (token !== loadToken) return; // подоспел более новый запрос — этот результат устарел

      currentClientId.value = result.clientId;
      rawData.value = result.data;
      store.loadSeatMap(universal);
      error.value = null;
    } catch (err) {
      if (token !== loadToken) return;

      rawData.value = null;
      currentClientId.value = '';
      store.clearSelection();
      error.value = (err as Error).message;
    } finally {
      if (token === loadToken) isLoading.value = false;
    }
  }

  async function loadSample(sample: SampleData) {
    selectedSample.value = sample.clientId;
    await loadData(selectedSample.value);
  }
</script>

<template>
  <Transition name="content-appear" appear>
    <div class="seat-map">
      <div class="seat-map__container">
        <div class="seat-map__header">
          <div class="seat-map__title">{{ t('seatmap-demo.title') }}</div>
        </div>
        <div class="seat-map__header-block">
          <div>
            <div class="seat-map__description">
              <div>{{ t('seatmap-demo.intro_1') }}</div>
              <div>{{ t('seatmap-demo.intro_2') }}</div>
              <div>{{ t('seatmap-demo.intro_3') }}</div>
            </div>
          </div>
          <div>
            <div>
              <div class="seat-map__steps-list-title">
                {{ t('seatmap-demo.intro_example') }}
              </div>
              <div class="seat-map__steps-list">
                <div class="seat-map__step-item">
                  <span class="seat-map__step-item-title">
                    {{ t('seatmap-demo.intro_example_1_title') }}
                  </span>
                  <span class="seat-map__step-item-description">
                    {{ t('seatmap-demo.intro_example_1_desc') }}
                  </span>
                </div>
                <div class="seat-map__step-item">
                  <span class="seat-map__step-item-title">
                    {{ t('seatmap-demo.intro_example_2_title') }}
                  </span>
                  <span class="seat-map__step-item-description">
                    {{ t('seatmap-demo.intro_example_2_desc') }}
                  </span>
                </div>
                <div class="seat-map__step-item">
                  <span class="seat-map__step-item-title">
                    {{ t('seatmap-demo.intro_example_3_title') }}
                  </span>
                  <span class="seat-map__step-item-description">
                    {{ t('seatmap-demo.intro_example_3_desc') }}
                  </span>
                </div>
                <div class="seat-map__step-item">
                  <span class="seat-map__step-item-title">
                    {{ t('seatmap-demo.intro_example_4_title') }}
                  </span>
                  <span class="seat-map__step-item-description">
                    {{ t('seatmap-demo.intro_example_4_desc') }}
                  </span>
                </div>
                <div class="seat-map__step-item">
                  <span class="seat-map__step-item-title">
                    {{ t('seatmap-demo.intro_example_5_title') }}
                  </span>
                  <span class="seat-map__step-item-description">
                    {{ t('seatmap-demo.intro_example_5_desc') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="seat-map__flow">
          <div class="seat-map__sources">
            <div class="seat-map__step-header">
              <div class="seat-map__step-title">
                {{ t('seatmap-demo.flow.source_title') }}
              </div>
              <div class="seat-map__step-description">
                {{ t('seatmap-demo.flow.source_desc') }}
              </div>
            </div>
            <div class="seat-map__sources-wrapper">
              <button
                v-for="sample in samples"
                :key="sample.clientId"
                class="seat-map__source"
                :class="{ 'seat-map__source_active': selectedSample === sample.clientId }"
                @click="loadSample(sample)"
              >
                {{ sample.name }}
              </button>
            </div>
          </div>
          <div class="seat-map__flow-link" />
          <div
            class="seat-map__api-raw-data"
            :class="{ 'seat-map__api-raw-data_disabled': !rawData || isLoading }"
          >
            <div class="seat-map__step-header">
              <div class="seat-map__step-title">
                {{ t('seatmap-demo.flow.api_raw_title') }}
              </div>
              <div class="seat-map__step-description">
                {{ t('seatmap-demo.flow.api_raw_desc') }}
              </div>
            </div>
            <ErrorBanner
              v-if="error"
              :message="error"
              type="error"
              @dismiss="error = null"
            />

            <div v-if="!rawData || isLoading" class="seat-map__empty-json-data">
              <UiLoading
                v-if="isLoading"
                type="circle"
                :circleRadius="20"
                :thickness="2"
                strokeColor="#151515"
                progressColor="#78cf05"
              />
            </div>
            <JsonCodeMirror
              v-if="rawData && !isLoading"
              class="seat-map__json-data seat-map__json-data_raw"
              :value="rawData"
              readonly
            />
          </div>
          <div class="seat-map__flow-link" />
          <div
            class="seat-map__drivers-selector"
            :class="{ 'seat-map__drivers-selector_disabled': !store.model && isLoading }"
          >
            <div class="seat-map__step-header">
              <div class="seat-map__step-title">
                {{ t('seatmap-demo.flow.drivers_title') }}
              </div>
              <div class="seat-map__step-description">
                {{ t('seatmap-demo.flow.drivers_desc') }}
              </div>
            </div>
            <div class="seat-map__drivers-wrapper">
              <div class="seat-map__drivers">
                <div
                  v-for="sample in samples"
                  :key="sample.clientId"
                  class="seat-map__driver-block"
                  :class="{
                    'seat-map__driver-block_active':
                      selectedSample === sample.clientId && !isLoading,
                  }"
                >
                  {{ t('seatmap-demo.flow.driver_prefix') }} - {{ sample.name }}
                </div>
              </div>
            </div>
          </div>
          <div class="seat-map__flow-link" />
          <div
            class="seat-map__api-formated-data"
            :class="{ 'seat-map__api-formated-data_disabled': !store.model || isLoading }"
          >
            <div class="seat-map__step-header">
              <div class="seat-map__step-title">
                {{ t('seatmap-demo.flow.universal_title') }}
              </div>
              <div class="seat-map__step-description">
                {{ t('seatmap-demo.flow.universal_desc') }}
              </div>
            </div>
            <div v-if="!store.model || isLoading" class="seat-map__empty-json-data" />
            <JsonCodeMirror
              v-if="store.model && !isLoading"
              class="seat-map__json-data seat-map__json-data_universal"
              :value="store.model.toJSON()"
              readonly
            />
          </div>
          <div v-if="!isLoading && store.model" class="seat-map__flow-link" />
          <div v-if="!isLoading && store.model" class="seat-map__map-container">
            <SeatMapViewer :interactive="true" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
