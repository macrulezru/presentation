import { createRestClient, type ApiResponse } from 'rest-pipeline-js';
import { ref } from 'vue';

export interface ArtsImage {
  directory: string;
  preview: string;
  images: string[];
  meta?: Record<string, unknown>;
  $loki?: number;
}

const client = createRestClient({
  baseURL: 'https://api.macrulez.ru/v1',
  timeout: 7000,
  cache: { enabled: true, ttlMs: 60000 },
});

export function useArtsImages() {
  const arts = ref<ArtsImage[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchArts() {
    loading.value = true;
    error.value = null;
    const res: ApiResponse<ArtsImage[]> = await client.request('/arts/');
    if ('error' in res && res.error) {
      error.value = String(res.error);
      arts.value = [];
    } else {
      arts.value = Array.isArray(res.data) ? res.data : [];
    }
    loading.value = false;
  }

  fetchArts();

  return {
    arts,
    loading,
    error,
    fetchArts,
  };
}
