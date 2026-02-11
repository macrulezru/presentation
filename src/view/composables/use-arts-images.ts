import { createRestClient } from 'rest-pipeline-js';
import { ref } from 'vue';

interface ArtsApiImage {
  id: number;
  filename: string;
  position: number;
  url: string;
}

interface ArtsApiItem {
  id: number;
  directory: string;
  preview: string;
  preview_url: string;
  images: ArtsApiImage[];
}

interface ArtsApiResponse {
  success: boolean;
  data: ArtsApiItem[];
}

export interface ArtsImage {
  directory: string;
  preview: string;
  images: string[];
  meta?: Record<string, unknown>;
}

const client = createRestClient({
  baseURL: 'https://macrulez-api.ru/api/portfolio',
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
    try {
      const res = await client.request('/arts');
      const payload = (res && 'data' in res ? res.data : res) as ArtsApiResponse;
      if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
        throw new Error('Invalid API response');
      }
      arts.value = payload.data.map(item => ({
        directory: item.directory,
        preview: item.preview_url || '',
        images: (item.images || [])
          .slice()
          .sort((a, b) => a.position - b.position)
          .map(img => img.url),
        meta: { id: item.id },
      }));
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      arts.value = [];
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
