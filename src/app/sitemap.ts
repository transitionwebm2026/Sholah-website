import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {ARTICLE_SLUGS, getArticlePublished} from '@/lib/content';
import {languageAlternates, localizedUrl} from '@/lib/seo';

export const dynamic = 'force-static';

type Entry = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  lastModified?: Date;
};

/** Multilingual sitemap: every URL lists its Arabic, English and x-default alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  const entries: Entry[] = [
    {path: '', priority: 1, changeFrequency: 'weekly'},
    {path: '/about', priority: 0.8, changeFrequency: 'monthly'},
    {path: '/services', priority: 0.9, changeFrequency: 'monthly'},
    {path: '/reviews', priority: 0.7, changeFrequency: 'monthly'},
    {path: '/videos', priority: 0.6, changeFrequency: 'monthly'},
    {path: '/articles', priority: 0.8, changeFrequency: 'weekly'},
    {path: '/contact', priority: 0.8, changeFrequency: 'yearly'},
    ...ARTICLE_SLUGS.map<Entry>((slug) => ({
      path: `/articles/${slug}`,
      priority: 0.6,
      changeFrequency: 'yearly',
      lastModified: new Date(getArticlePublished(slug))
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
