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

type PortfolioResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export function usePortfolioExperience(lang: MaybeRef<string>) {
  const langRef = toRef(lang);

  return useAsyncData(
    () => `portfolio-company:${langRef.value}`,
    async () => {
      return await $fetch<PortfolioResponse<ExperienceItem[]>>('/api/portfolio/company', {
        query: { lang: langRef.value || 'ru' },
      });
    },
    { watch: [langRef] },
  );
}

export type { ExperienceItem };

