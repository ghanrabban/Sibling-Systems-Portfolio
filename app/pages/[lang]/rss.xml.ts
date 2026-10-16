import rss from '@astrojs/rss';
import { entries, locales, publicationUrl, type Locale } from '../../lib/content';
import { site } from '../../config/site';
export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}
export async function GET({ params }: { params: { lang: Locale } }) {
  return rss({
    title: `${site.name} — ${params.lang === 'id' ? 'Tulisan' : 'Writing'}`,
    description: site[params.lang].description,
    site: site.url,
    customData: `<language>${params.lang}</language>`,
    items: (await entries('blog', params.lang)).map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: publicationUrl(entry),
    })),
  });
}
