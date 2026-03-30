import { createRestClient } from 'rest-pipeline-js';
import { ref, computed, watch, onServerPrefetch } from 'vue';

import { useI18n } from '~/composables/useI18n';

export interface BlogPostItem {
  title: string;
  descriptionHtml: string;
  coverImage: string;
  url: string;
}

export function useBlogPost() {
  const { locale } = useI18n();
  const items = ref<BlogPostItem[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const client = createRestClient({
    baseURL: 'https://macrulez-api.ru/api/macrulez-blog',
    timeout: 7000,
    cache: { enabled: true, ttlMs: 60000 },
  });

  const cache: Record<string, BlogPostItem[]> = {};

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
      const response = await client.get(`/posts?per_page=7`);
      const apiResponse =
        response && 'data' in response ? (response as any).data : response;
      const data = apiResponse?.data?.items ?? [];
      if (Array.isArray(data)) {
        cache[currentLocale] = data.map(item => ({
          title: item?.title ?? '',
          descriptionHtml: item?.descriptionHtml ?? '',
          coverImage: item?.coverImage ?? '',
          url: item?.slug ?? '',
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
