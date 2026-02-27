type NpmPackageItem = {
  title: string;
  url: string;
  description: string;
};

type PortfolioResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export function usePortfolioNpmPackages(lang: MaybeRef<string>) {
  const langRef = toRef(lang);

  return useAsyncData(
    () => `portfolio-npm:${langRef.value}`,
    async () => {
      return await $fetch<PortfolioResponse<NpmPackageItem[]>>('/api/portfolio/npm', {
        query: { lang: langRef.value || 'ru' },
      });
    },
    { watch: [langRef] },
  );
}

export type { NpmPackageItem };

