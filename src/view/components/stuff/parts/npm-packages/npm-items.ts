import { createRestClient } from 'rest-pipeline-js';
import { ref, computed, watchEffect } from 'vue';

import { useI18n } from '@/view/composables/use-i18n';

export interface NpmPackageItem {
  title: string;
  url: string;
  description: string;
}

export function useNpmPackages() {
  const { locale } = useI18n();
  const items = ref<NpmPackageItem[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const client = createRestClient({ baseURL: 'https://macrulez-api.ru/api/portfolio' });

  const cache: Record<string, NpmPackageItem[]> = {};

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
      const response = await client.get(`/npm?lang=${currentLocale}`);
      const payload = response && 'data' in response ? response.data : response;
      const data = payload && typeof payload === 'object' && 'data' in payload ? payload.data : [];
      if (Array.isArray(data)) {
        cache[currentLocale] = data.map(item => ({
          title: item?.title ?? '',
          url: item?.url ?? '',
          description: item?.translation?.description ?? '',
        }));
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
