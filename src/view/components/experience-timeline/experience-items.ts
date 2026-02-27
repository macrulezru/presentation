import { createRestClient } from 'rest-pipeline-js';
import { ref, computed, watch, onServerPrefetch } from 'vue';

import { useI18n } from '~/composables/useI18n';

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  description: string;
  period?: string;
  duration?: string;
  url?: string;
  logo?: string;
  logo_url?: string;
}

export function useExperienceItems() {
  const { locale } = useI18n();
  const items = ref<ExperienceItem[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const client = createRestClient({
    baseURL: 'https://macrulez-api.ru/api',
    timeout: 7000,
    cache: { enabled: true, ttlMs: 60000 },
  });

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
      const response = await client.get(`/portfolio/company?lang=${currentLocale}`);
      const payload = response && 'data' in response ? response.data : response;
      const data =
        payload && typeof payload === 'object' && 'data' in payload ? payload.data : [];
      if (Array.isArray(data)) {
        cache[currentLocale] = data.map(item => ({
          id: String(item?.id ?? ''),
          company: item?.translation?.company ?? '',
          position: item?.translation?.position ?? '',
          description: item?.translation?.description ?? '',
          period: item?.translation?.period ?? undefined,
          duration: item?.translation?.duration ?? undefined,
          url: item?.url ?? undefined,
          logo: item?.logo ?? undefined,
          logo_url: item?.logo_url ?? undefined,
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

  // SSR: дождаться данных перед рендером HTML
  if (import.meta.env.SSR) {
    onServerPrefetch(() => fetchItems(locale.value));
  } else {
    // Client: реагировать на смену локали
    watch(
      locale,
      newLocale => {
        fetchItems(newLocale);
      },
      { immediate: true },
    );
  }

  return {
    items: computed(() => items.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
  };
}
