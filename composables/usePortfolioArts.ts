type ArtsImage = {
  directory: string;
  preview: string;
  images: string[];
  meta?: Record<string, unknown>;
};

type PortfolioResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export function usePortfolioArts() {
  return useAsyncData('portfolio-arts', async () => {
    return await $fetch<PortfolioResponse<ArtsImage[]>>('/api/portfolio/arts');
  });
}

export type { ArtsImage };

