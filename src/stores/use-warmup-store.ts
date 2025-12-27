import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWarmupStore = defineStore('warmup', () => {
  const warmupStatus = ref<boolean>(false);

  const setWarmupStatus = (status: boolean) => {
    warmupStatus.value = status;
  };

  return {
    warmupStatus,
    setWarmupStatus,
  };
});
