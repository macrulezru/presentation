import { LocalesList } from '@/enums/locales.enum';

const SITE_URL = 'https://macrulez.ru';

export default defineEventHandler(event => {
  const alternateLinks = (currentLocale: string) =>
    [
      ...LocalesList.map(
        l =>
          `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/ru"/>`,
    ].join('\n');

  const urlEntries = LocalesList.map(
    locale => `  <url>
    <loc>${SITE_URL}/${locale}</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
${alternateLinks(locale)}
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
