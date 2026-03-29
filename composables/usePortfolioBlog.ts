type BlogPostItem = {
  title: string;
  descriptionHtml: string;
  coverImage: string;
  url: string;
};

type PortfolioResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export function usePortfolioBlog() {
  return useAsyncData(
    () => `portfolio-blog`,
    async () => {
      return await $fetch<PortfolioResponse<BlogPostItem[]>>('/api/portfolio/blog');
    },
  );
}

export type { BlogPostItem };
