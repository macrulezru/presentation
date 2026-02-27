import { cachedEventHandler } from 'nitropack/runtime';
import { Agent } from 'undici';

const ipv4Agent = new Agent({ connect: { family: 4 } });

type NpmPackageItem = {
  title: string;
  url: string;
  description: string;
};

export default cachedEventHandler(
  async event => {
    const query = getQuery(event);
    const lang = typeof query.lang === 'string' ? query.lang : 'ru';

    const { macrulezApiBase } = useRuntimeConfig(event);

    try {
      const response = await $fetch(`${macrulezApiBase}/portfolio/npm`, {
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

      const items: NpmPackageItem[] = Array.isArray(data)
        ? data.map((item: any) => ({
            title: item?.title ?? '',
            url: item?.url ?? '',
            description: item?.translation?.description ?? '',
          }))
        : [];

      return { success: true, data: items };
    } catch (e) {
      return {
        success: false,
        data: [] as NpmPackageItem[],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
  {
    maxAge: 60,
    swr: true,
    name: 'portfolio-npm',
    getKey: event => {
      const query = getQuery(event);
      const lang = typeof query.lang === 'string' ? query.lang : 'ru';
      return `portfolio-npm:${lang}`;
    },
  },
);

