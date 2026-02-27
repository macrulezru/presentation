<script setup lang="ts">
  import './pipeline-boarding-pass.scss';

  import { computed, ref, onMounted } from 'vue';

  import type { FlightModel } from '@/models/availability.model';
  import type { PointModel } from '@/models/points.model';
  import type { SeatModel } from '@/models/seatmap.model';
  import type { ServiceModel } from '@/models/services.model';

  import { useI18n } from '~/composables/useI18n';

  const { t, locale } = useI18n();

  const props = defineProps<{
    pipelineStorage: {
      departurePoint: PointModel | null;
      arrivalPoint: PointModel | null;
      flight: FlightModel | null;
      services: ServiceModel[] | null;
      seat: SeatModel | null;
    };
  }>();

  // Генерация случайных данных
  function randomFrom<T>(arr: T[]): T {
    if (arr.length === 0) {
      throw new Error('Array must not be empty');
    }
    return arr[Math.floor(Math.random() * arr.length)] as T;
  }

  const terminal = ref('A');
  const gate = ref(1);
  const classKeys = ['economy', 'business', 'luxury'];

  const flightClass = computed(() => {
    const classes = classKeys.map(k => t(`pipeline-demo.boardingPass.classes.${k}`));
    return classes[0] || '';
  });

  const qrLink = computed(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&color=64CDF4&bgcolor=151515&data=${encodeURIComponent(
      `http://macrulez.ru/${locale.value}`,
    )}`;
  });

  // Генерация баркода
  function randomBarcode(): string {
    return `I${Math.floor(100000000 + Math.random() * 900000000).toString()}${
      props.pipelineStorage.flight?.segments?.[0]?.flightNumber || 'M1745'
    }Ivanov`;
  }
  function randomBarcodeNumber(): string {
    return `M1 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(
      100000 + Math.random() * 900000,
    )} ${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const barcode = ref('');
  const barcodeNumber = ref('');

  onMounted(() => {
    terminal.value = randomFrom(['A', 'B', 'C', 'D', 'E', 'F']);
    gate.value = Math.floor(Math.random() * 50 + 1);
    barcode.value = randomBarcode();
    barcodeNumber.value = randomBarcodeNumber();
  });
</script>

<template>
  <div class="pipeline-boarding-pass">
    <!-- Header -->
    <div class="pipeline-boarding-pass__header-row">
      <div class="pipeline-boarding-pass__logo" />
      <div class="pipeline-boarding-pass__title">
        {{ t('pipeline-demo.boardingPass.title') }}
      </div>
    </div>
    <!-- Info -->
    <div class="pipeline-boarding-pass__info-row">
      <div class="pipeline-boarding-pass__info-section">
        <span class="pipeline-boarding-pass__label">
          {{ t('pipeline-demo.boardingPass.passenger') }}
        </span>
        <span class="pipeline-boarding-pass__value">ИВАНОВ АЛЕКСЕЙ</span>
      </div>
      <div class="pipeline-boarding-pass__info-section">
        <span class="pipeline-boarding-pass__label">
          {{ t('pipeline-demo.boardingPass.flight') }}
        </span>
        <span class="pipeline-boarding-pass__value">
          {{ pipelineStorage.flight?.segments?.[0]?.flightNumber }}
        </span>
      </div>
      <div class="pipeline-boarding-pass__info-section">
        <span class="pipeline-boarding-pass__label">
          {{ t('pipeline-demo.boardingPass.class') }}
        </span>
        <span class="pipeline-boarding-pass__value">{{ flightClass }}</span>
      </div>
      <div class="pipeline-boarding-pass__info-section">
        <span class="pipeline-boarding-pass__label">{{ t('pipeline-demo.seat') }}</span>
        <span class="pipeline-boarding-pass__value">
          {{ pipelineStorage.seat?.freetext }}
        </span>
      </div>
    </div>
    <!-- Route -->
    <div class="pipeline-boarding-pass__route-row">
      <div class="pipeline-boarding-pass__airport">
        <div class="pipeline-boarding-pass__airport-code">
          {{ pipelineStorage.departurePoint?.code }}
        </div>
        <div class="pipeline-boarding-pass__airport-name">
          {{
            pipelineStorage.departurePoint?.nameRu || pipelineStorage.departurePoint?.name
          }}
        </div>
      </div>
      <div class="pipeline-boarding-pass__flight-path">
        <div class="pipeline-boarding-pass__flight-line"></div>
        <span class="pipeline-boarding-pass__plane-icon">✈</span>
      </div>
      <div class="pipeline-boarding-pass__airport">
        <div class="pipeline-boarding-pass__airport-code">
          {{ pipelineStorage.arrivalPoint?.code }}
        </div>
        <div class="pipeline-boarding-pass__airport-name">
          {{ pipelineStorage.arrivalPoint?.nameRu || pipelineStorage.arrivalPoint?.name }}
        </div>
      </div>
    </div>
    <!-- Details -->
    <div class="pipeline-boarding-pass__details-row">
      <div class="pipeline-boarding-pass__detail-item">
        <span class="pipeline-boarding-pass__label">
          {{ t('pipeline-demo.boardingPass.departureDate') }}
        </span>
        <span class="pipeline-boarding-pass__value">
          {{ pipelineStorage.flight?.segments?.[0]?.departureDate }}
        </span>
      </div>
      <div class="pipeline-boarding-pass__detail-item">
        <span class="pipeline-boarding-pass__label">
          {{ t('pipeline-demo.boardingPass.departureTime') }}
        </span>
        <span class="pipeline-boarding-pass__value">
          {{ pipelineStorage.flight?.segments?.[0]?.departureTime }}
        </span>
      </div>
      <div class="pipeline-boarding-pass__detail-item">
        <span class="pipeline-boarding-pass__label">
          {{ t('pipeline-demo.boardingPass.arrivalTime') }}
        </span>
        <span class="pipeline-boarding-pass__value">
          {{ pipelineStorage.flight?.segments?.[0]?.arrivalTime }}
        </span>
      </div>
      <div class="pipeline-boarding-pass__detail-item">
        <span class="pipeline-boarding-pass__label">
          {{ t('pipeline-demo.boardingPass.terminal') }}
        </span>
        <span class="pipeline-boarding-pass__value">{{ terminal }}</span>
      </div>
    </div>
    <!-- Boarding -->
    <div class="pipeline-boarding-pass__boarding-row">
      <div class="pipeline-boarding-pass__boarding-item">
        <span class="pipeline-boarding-pass__label">
          {{ t('pipeline-demo.boardingPass.boardingStart') }}
        </span>
        <span class="pipeline-boarding-pass__value">
          {{ pipelineStorage.flight?.segments?.[0]?.departureTime }}
          <span class="pipeline-boarding-pass__status">
            {{ t('pipeline-demo.boardingPass.onTime') }}
          </span>
        </span>
      </div>
      <div class="pipeline-boarding-pass__boarding-item">
        <span class="pipeline-boarding-pass__label">
          {{ t('pipeline-demo.boardingPass.boardingEnd') }}
        </span>
        <span class="pipeline-boarding-pass__value">
          {{ pipelineStorage.flight?.segments?.[0]?.departureTime }}
        </span>
      </div>
      <div class="pipeline-boarding-pass__boarding-item">
        <span class="pipeline-boarding-pass__label">
          {{ t('pipeline-demo.boardingPass.gate') }}
        </span>
        <span class="pipeline-boarding-pass__value">{{ gate }}</span>
      </div>
    </div>
    <!-- Barcode -->
    <div class="pipeline-boarding-pass__barcode-row">
      <div class="pipeline-boarding-pass__barcode">{{ barcode }}</div>
      <div class="pipeline-boarding-pass__barcode-number">{{ barcodeNumber }}</div>
      <div class="pipeline-boarding-pass__barcode-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#5dfafc" stroke-width="2" />
          <text x="12" y="16" text-anchor="middle" font-size="12" fill="#5dfafc">i</text>
        </svg>
        {{ t('pipeline-demo.boardingPass.saveNote') }}
      </div>
    </div>
    <!-- Footer -->
    <div class="pipeline-boarding-pass__footer">
      <span class="pipeline-boarding-pass__footer-note">
        {{ t('pipeline-demo.boardingPass.footerNote') }}
      </span>
      <span class="pipeline-boarding-pass__footer-qr">
        <img :src="qrLink" alt="QR Code" />
      </span>
    </div>
  </div>
</template>
