import { cachedEventHandler } from 'nitropack/runtime';
import { Agent } from 'undici';

const ipv4Agent = new Agent({ connect: { family: 4 } });

type BlogPostItem = {
  title: string;
  descriptionHtml: string;
  coverImage: string;
  url: string;
};

export default cachedEventHandler(
  async event => {
    const { macrulezApiBase } = useRuntimeConfig(event);

    try {
      const response = await $fetch(`${macrulezApiBase}/macrulez-blog/posts?per_page=3`, {
        timeout: 7000,
        retry: 1,
        dispatcher: ipv4Agent,
      });

      const data = (response as any)?.data?.items ?? [];

      const items: BlogPostItem[] = Array.isArray(data)
        ? data.map((item: any) => ({
            title: item?.title ?? '',
            descriptionHtml: item?.descriptionHtml ?? '',
            coverImage: item?.coverImage ?? '',
            url: item?.slug ?? '',
          }))
        : [];

      return { success: true, data: items };
    } catch (e) {
      return {
        success: false,
        data: [] as BlogPostItem[],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
  {
    maxAge: 60,
    swr: true,
    name: 'portfolio-blog',
  },
);
