import { useHead } from 'nuxt/app';

import { useI18n } from '@/view/composables/use-i18n';

const APP_URL = 'https://macrulez.ru';
const OG_IMAGE = 'https://macrulez.ru/og-image.png';

/**
 * Формируем SEO-теги на момент рендеринга (SSR).
 * Используем немедленные строки (не реактивные) чтобы теги
 * попадали в HTML на хосте в зависимости от локали в URL.
 */
export function useSeoHead() {
  const { t, locale } = useI18n();

  // Получаем значения сразу как строки (SSR-friendly)
  const description = String(t('seo.description'));
  const keywords = String(t('seo.keywords'));
  const ogTitle = String(t('seo.ogTitle'));
  const ogDescription = String(t('seo.ogDescription'));
  const ogImageAlt = String(t('seo.ogImageAlt'));
  const siteName = String(t('seo.siteName'));
  const twitterTitle = String(t('seo.twitterTitle'));
  const twitterDescription = String(t('seo.twitterDescription'));

  const langMap: Record<string, string> = {
    ru: 'ru',
    en: 'en',
    de: 'de',
    kz: 'kk',
    zh: 'zh',
  };
  const htmlLang = langMap[locale?.value as string] ?? 'ru';

  // Build all head tags in a single place to ensure SSR emits the final
  // title and meta without client-side template param processing.
  useHead({
    htmlAttrs: {
      lang: htmlLang,
    },
    // Do not use `titleTemplate` / `templateParams` here —
    // with the `template-params` plugin present they leave
    // the raw "%s" in the emitted title. Rely on an explicit
    // `title` object instead.
    // Explicit title object with processTemplateParams:false so Unhead
    // does not split or rewrite the title using template params.
    // Give this title a high priority so other plugins won't override
    // the fully-resolved localized title.
    title: {
      // Build a clean title like "Name - Role (details)".
      // Many locales use a pipe-separated `seo.title` (e.g. "Name | Role (details) | Resume").
      // Prefer the author from `siteName` before the first " - ", and the role/details
      // from the second segment of `seo.title`.
      textContent: (() => {
        try {
          const raw = String(t('seo.title'));
          const parts = raw
            .split('|')
            .map(s => s.trim())
            .filter(Boolean);
          const author = siteName.split(' - ')[0] || siteName;
          const role = parts[1] || parts[0] || raw;
          return `${author} - ${role}`;
        } catch (e) {
          return String(t('seo.title'));
        }
      })(),
      processTemplateParams: false,
      tagPriority: 1000,
    },
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'apple-mobile-web-app-title', content: siteName },

      // OpenGraph
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: ogTitle },
      { property: 'og:description', content: ogDescription },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:width', content: '630' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: ogImageAlt },
      { property: 'og:url', content: APP_URL },
      { property: 'og:site_name', content: siteName },

      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: twitterTitle },
      { name: 'twitter:description', content: twitterDescription },
      { name: 'twitter:image', content: OG_IMAGE },
    ],
  } as any);
}
