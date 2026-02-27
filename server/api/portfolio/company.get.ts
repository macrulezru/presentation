import { cachedEventHandler } from 'nitropack/runtime';
import { Agent } from 'undici';

const ipv4Agent = new Agent({ connect: { family: 4 } });

type ExperienceItem = {
  id: string;
  company: string;
  position: string;
  description: string;
  period?: string;
  duration?: string;
  url?: string;
  logo?: string;
  logo_url?: string;
};

export default cachedEventHandler(
  async event => {
    const query = getQuery(event);
    const lang = typeof query.lang === 'string' ? query.lang : 'ru';

    const { macrulezApiBase } = useRuntimeConfig(event);

    try {
      const response = await $fetch(`${macrulezApiBase}/portfolio/company`, {
        query: { lang },
        timeout: 7000,
        retry: 1,
        dispatcher: ipv4Agent,
      });

      const payload =
        response && typeof response === 'object' && 'data' in (response as any)
          ? (response as any).data
          : response;

      const data = Array.isArray(payload)
        ? payload
        : payload && typeof payload === 'object' && 'data' in (payload as any)
          ? (payload as any).data
          : [];

      const items: ExperienceItem[] = Array.isArray(data)
        ? data.map((item: any) => ({
            id: String(item?.id ?? ''),
            company: item?.translation?.company ?? '',
            position: item?.translation?.position ?? '',
            description: item?.translation?.description ?? '',
            period: item?.translation?.period ?? undefined,
            duration: item?.translation?.duration ?? undefined,
            url: item?.url ?? undefined,
            logo: item?.logo ?? undefined,
            logo_url: item?.logo_url ?? undefined,
          }))
        : [];

      return { success: true, data: items };
    } catch (e) {
      return {
        success: false,
        data: [] as ExperienceItem[],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
  {
    // 60s достаточно для портфолио-данных, можно поднять позже
    maxAge: 60,
    swr: true,
    name: 'portfolio-company',
    getKey: event => {
      const query = getQuery(event);
      const lang = typeof query.lang === 'string' ? query.lang : 'ru';
      return `portfolio-company:${lang}`;
    },
  },
);

