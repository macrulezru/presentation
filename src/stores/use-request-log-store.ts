import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { metricsBus, type RequestRecord } from '@/core/metrics/metrics-bus';

export const useRequestLogStore = defineStore('request-log', () => {
  const records = ref<RequestRecord[]>([]);
  const selectedId = ref<string | null>(null);
  let unsubscribe: (() => void) | null = null;

  const ensureSubscription = () => {
    if (unsubscribe) return;
    unsubscribe = metricsBus.subscribe(data => {
      records.value = data;
      if (selectedId.value && !data.some(r => r.id === selectedId.value)) {
        selectedId.value = null;
      }
    });
  };

  const select = (id: string | null) => {
    selectedId.value = id;
  };

  const clear = () => {
    metricsBus.clear();
    selectedId.value = null;
  };

  const selected = computed<RequestRecord | null>(() => {
    if (!selectedId.value) return null;
    return records.value.find(r => r.id === selectedId.value) ?? null;
  });

  return {
    records,
    selectedId,
    selected,
    ensureSubscription,
    select,
    clear,
  };
});
