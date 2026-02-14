import { useAsyncData } from 'nuxt/app';
import { computed } from 'vue';

import { useI18n } from '@/view/composables/use-i18n';

export interface NpmPackageItem {
  title: string;
  url: string;
  description: string;
}

const API_BASE = 'https://macrulez-api.ru/api/portfolio';

function mapRawToNpmItem(item: Record<string, unknown>): NpmPackageItem {
  const t = (item?.translation as Record<string, unknown>) ?? {};
  return {
    title: String(item?.title ?? ''),
    url: String(item?.url ?? ''),
    description: String(t?.description ?? ''),
  };
}

export function useNpmPackages() {
  const { locale } = useI18n();

  const { data, pending, error } = useAsyncData(
    () => `npm-${locale.value}`,
    async (): Promise<NpmPackageItem[]> => {
      const response = await $fetch<unknown>(`${API_BASE}/npm`, {
        params: { lang: locale.value },
      });
      const raw = Array.isArray(response)
        ? response
        : (response && typeof response === 'object' && 'data' in response
            ? (response as { data?: unknown[] }).data
            : []) ?? [];
      return Array.isArray(raw) ? raw.map(item => mapRawToNpmItem(item as Record<string, unknown>)) : [];
    },
    { watch: [locale] },
  );

  return {
    items: computed(() => data.value ?? []),
    loading: computed(() => pending.value),
    error: computed(() => error.value ?? null),
  };
}
