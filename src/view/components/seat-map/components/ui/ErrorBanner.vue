<template>
  <div class="error-banner" :class="type">
    <span class="error-icon">{{ icon }}</span>
    <span class="error-message">{{ message }}</span>
    <button v-if="dismissible" class="dismiss-btn" @click="$emit('dismiss')">✕</button>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    message: string;
    type?: 'error' | 'warning' | 'info';
    dismissible?: boolean;
  }

  interface Emits {
    dismiss: [];
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'error',
    dismissible: true,
  });

  defineEmits<Emits>();

  const icon = computed(() => {
    switch (props.type) {
      case 'error':
        return '⛔';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '⛔';
    }
  });
</script>

<style scoped>
  .error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    margin: 12px 0;
    font-size: 14px;
  }

  .error {
    background-color: #ffebee;
    border: 1px solid #f44336;
    color: #c62828;
  }

  .warning {
    background-color: #fff3e0;
    border: 1px solid #ff9800;
    color: #e65100;
  }

  .info {
    background-color: #e3f2fd;
    border: 1px solid #2196f3;
    color: #1565c0;
  }

  .error-icon {
    font-size: 20px;
  }

  .error-message {
    flex: 1;
  }

  .dismiss-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .dismiss-btn:hover {
    opacity: 1;
  }
</style>
