import { cachedEventHandler } from 'nitropack/runtime';
import { Agent } from 'undici';

const ipv4Agent = new Agent({ connect: { family: 4 } });

type ArtsImage = {
  directory: string;
  preview: string;
  previewWidth: number | null;
  previewHeight: number | null;
  previewThumbhash: string | null;
  images: string[];
  meta?: Record<string, unknown>;
};

type ArtsApiResponse = {
  success: boolean;
  data: Array<{
    id: number;
    directory: string;
    preview: string;
    preview_url: string;
    preview_width?: number | null;
    preview_height?: number | null;
    preview_thumbhash?: string | null;
    images: Array<{ id: number; filename: string; position: number; url: string }>;
  }>;
};

export default cachedEventHandler(
  async event => {
    const { macrulezApiBase } = useRuntimeConfig(event);

    try {
      // Оригинальный эндпоинт: /api/portfolio/arts (без lang)
      const payload = await $fetch<ArtsApiResponse>(`${macrulezApiBase}/portfolio/arts`, {
        timeout: 7000,
        retry: 1,
        dispatcher: ipv4Agent,
      });

      if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
        return { success: false, data: [] as ArtsImage[], error: 'Invalid upstream response' };
      }

      const arts: ArtsImage[] = payload.data.map(item => ({
        directory: item.directory,
        preview: item.preview_url || '',
        previewWidth: item.preview_width ?? null,
        previewHeight: item.preview_height ?? null,
        previewThumbhash: item.preview_thumbhash ?? null,
        images: (item.images || [])
          .slice()
          .sort((a, b) => a.position - b.position)
          .map(img => img.url),
        meta: { id: item.id },
      }));

      return { success: true, data: arts };
    } catch (e) {
      return {
        success: false,
        data: [] as ArtsImage[],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
  {
    maxAge: 60,
    swr: true,
    name: 'portfolio-arts-v2',
    getKey: () => 'portfolio-arts-v2',
  },
);

