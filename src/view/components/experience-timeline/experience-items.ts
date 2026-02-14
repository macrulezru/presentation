import { useAsyncData } from 'nuxt/app';
import { computed } from 'vue';

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
  logo_url?: string;
}

const API_BASE = 'https://macrulez-api.ru/api';

function mapRawToExperienceItem(item: Record<string, unknown>): ExperienceItem {
  const t = (item?.translation as Record<string, unknown>) ?? {};
  return {
    id: String(item?.id ?? ''),
    company: String(t?.company ?? ''),
    position: String(t?.position ?? ''),
    description: String(t?.description ?? ''),
    period: t?.period as string | undefined,
    duration: t?.duration as string | undefined,
    url: item?.url as string | undefined,
    logo: item?.logo as string | undefined,
    logo_url: item?.logo_url as string | undefined,
  };
}

export function useExperienceItems() {
  const { locale } = useI18n();

  const { data, pending, error } = useAsyncData(
    () => `experience-${locale.value}`,
    async (): Promise<ExperienceItem[]> => {
      const response = await $fetch<unknown>(`${API_BASE}/portfolio/company`, {
        params: { lang: locale.value },
      });
      const raw = Array.isArray(response)
        ? response
        : (response && typeof response === 'object' && 'data' in response
            ? (response as { data?: unknown[] }).data
            : []) ?? [];
      return Array.isArray(raw) ? raw.map(item => mapRawToExperienceItem(item as Record<string, unknown>)) : [];
    },
    { watch: [locale] },
  );

  return {
    items: computed(() => data.value ?? []),
    loading: computed(() => pending.value),
    error: computed(() => error.value ?? null),
  };
}
