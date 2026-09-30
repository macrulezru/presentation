<script setup lang="ts">
  import { useI18n } from '~/composables/useI18n';

  const { t } = useI18n();
</script>

<template>
  <div class="seat-map-legend">
    <div class="legend-item">
      <span class="legend-swatch swatch-available"></span>
      <span class="legend-label">{{ t('seatmap-demo.legend.available') }}</span>
    </div>
    <div class="legend-item">
      <span class="legend-swatch swatch-occupied"></span>
      <span class="legend-label">{{ t('seatmap-demo.legend.occupied') }}</span>
    </div>
    <div class="legend-item">
      <span class="legend-swatch swatch-selected"></span>
      <span class="legend-label">{{ t('seatmap-demo.legend.selected') }}</span>
    </div>
    <div class="legend-item">
      <span class="legend-swatch swatch-blocked"></span>
      <span class="legend-label">{{ t('seatmap-demo.legend.blocked') }}</span>
    </div>
    <div class="legend-item">
      <span class="legend-swatch swatch-overwing"></span>
      <span class="legend-label">{{ t('seatmap-demo.legend.overwing') }}</span>
    </div>
    <div class="legend-item">
      <span class="legend-icon icon-exit">{{ t('seatmap-demo.legend.exit_icon') }}</span>
      <span class="legend-label">{{ t('seatmap-demo.legend.exit') }}</span>
    </div>
  </div>
</template>

<style scoped>
  .seat-map-legend {
    display: flex;
    flex-flow: column wrap;
    gap: 12px 20px;
    padding: 24px;
    border: 1px solid var(--color-7);
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: var(--color-4);
  }

  .legend-swatch {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .swatch-available {
    background: #e8f4f8;
    border: 1px solid transparent;
  }

  .swatch-occupied {
    background: #252325;
    border: 1px solid #524e52;
  }

  .swatch-selected {
    background: #569700;
    border: 1px solid #afe46b;
  }

  .swatch-blocked {
    background: #e0e0e0;
    border: 1px solid #999;
    opacity: 0.6;
  }

  .swatch-overwing {
    background: rgb(33 150 243 / 12%);
    border: 1px solid #90caf9;
  }

  .legend-icon {
    color: #e53935;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: -1px;
  }
</style>
