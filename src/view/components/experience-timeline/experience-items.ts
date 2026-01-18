import { createRestClient } from 'rest-pipeline-js';
import { ref, computed, watchEffect } from 'vue';

import { useI18n } from '@/view/composables/use-i18n';

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  description: string;
  period?: string;
  duration?: string;
  url?: string;
  logo?: string;
}

export function useExperienceItems() {
  const { locale } = useI18n();
  const items = ref<ExperienceItem[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const client = createRestClient({ baseURL: 'https://api.macrulez.ru/v1' });

  const cache: Record<string, ExperienceItem[]> = {};

  async function fetchItems(currentLocale: string) {
    if (cache[currentLocale]) {
      items.value = cache[currentLocale];
      loading.value = false;
      error.value = null;
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const response = await client.get(`/experience/${currentLocale}`);
      const data = response && 'data' in response ? response.data : response;
      if (Array.isArray(data)) {
        cache[currentLocale] = data as ExperienceItem[];
        items.value = cache[currentLocale];
      } else {
        items.value = [];
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error');
      items.value = [];
    } finally {
      loading.value = false;
    }
  }

  watchEffect(() => {
    fetchItems(locale.value);
  });

  return {
    items: computed(() => items.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
  };
}
