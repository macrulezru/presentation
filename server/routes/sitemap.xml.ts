import { LocalesList } from '@/enums/locales.enum';

const SITE_URL = 'https://macrulez.ru';
const DEFAULT_LOCALE = 'ru';

const urlFor = (locale: string) =>
  locale === DEFAULT_LOCALE ? `${SITE_URL}/` : `${SITE_URL}/${locale}`;

export default defineEventHandler(event => {
  const alternateLinks = [
    ...LocalesList.map(
      l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l)}"/>`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LOCALE)}"/>`,
  ].join('\n');

  const urlEntries = LocalesList.map(
    locale => `  <url>
    <loc>${urlFor(locale)}</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
${alternateLinks}
  </url>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  return xml;
});
