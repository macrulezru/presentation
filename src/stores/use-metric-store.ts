import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMetricStore = defineStore('metric', () => {
  const isShowMetric = ref<boolean>(false);

  const setShowStatus = (status: boolean) => {
    isShowMetric.value = status;
  };

  return {
    isShowMetric,
    setShowStatus,
  };
});
