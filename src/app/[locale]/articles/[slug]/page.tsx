import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {ArticleView} from '@/components/views/ArticleView';
import type {Locale} from '@/i18n/routing';
import {getDataset, getView} from '@/lib/cms/server';
import {buildMetadata, getSiteName} from '@/lib/seo';

type Props = {params: Promise<{locale: string; slug: string}>};

/** Placeholder param when there are no articles yet: static export needs at least one. */
const NO_ARTICLES = '_';

// Combined with the parent layout's locales → every published article is pre-rendered in both
// languages. Articles published later are served by /articles/view until the next build.
export async function generateStaticParams() {
  const articles = await getDataset('articles');
  return articles.length ? articles.map((a) => ({slug: a.slug})) : [{slug: NO_ARTICLES}];
}

export const dynamicParams = false;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale: rawLocale, slug} = await params;
  const locale = rawLocale as Locale;
  const [{article}, site] = await Promise.all([getView('article', locale, slug), getView('layout', locale)]);
  if (!article) return {};

  return buildMetadata({
    locale,
    path: `/articles/${slug}`,
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    image: article.image ? {url: article.image, alt: article.title} : undefined,
    article: {
      publishedTime: article.published,
      modifiedTime: article.updated,
      section: article.category,
      author: site.doctor.name || (await getSiteName(locale))
    }
  });
}

export default async function ArticlePage({params}: Props) {
  const {locale: rawLocale, slug} = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const view = await getView('article', locale, slug);
  if (!view.article) notFound();

  return <ArticleView key={slug} initial={view} slug={slug} />;
}
