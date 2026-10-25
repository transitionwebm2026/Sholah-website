import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {getDataset} from '@/lib/cms/server';
import {languageAlternates, localizedUrl} from '@/lib/urls';

export const dynamic = 'force-static';

type Entry = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  lastModified?: Date;
};

/** Multilingual sitemap: every URL lists its Arabic, English and x-default alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildDate = new Date();
  const articles = await getDataset('articles');

  const entries: Entry[] = [
    {path: '', priority: 1, changeFrequency: 'weekly'},
    {path: '/about', priority: 0.8, changeFrequency: 'monthly'},
    {path: '/services', priority: 0.9, changeFrequency: 'monthly'},
    {path: '/reviews', priority: 0.7, changeFrequency: 'monthly'},
    {path: '/videos', priority: 0.6, changeFrequency: 'monthly'},
    {path: '/articles', priority: 0.8, changeFrequency: 'weekly'},
    {path: '/contact', priority: 0.8, changeFrequency: 'yearly'},
    ...articles.map<Entry>((article) => ({
      path: `/articles/${article.slug}`,
      priority: 0.6,
      changeFrequency: 'yearly',
      lastModified: new Date(article.updated_at ?? article.published_at)
    }))
  ];

  return entries.flatMap((entry) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, entry.path),
      lastModified: entry.lastModified ?? buildDate,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: {languages: languageAlternates(entry.path)}
    }))
  );
}
