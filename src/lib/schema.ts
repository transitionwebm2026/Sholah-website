/*
 * JSON-LD builders that are safe in both server and client components (no server-only imports).
 * The site-wide graph that reads build-time settings lives in `schema-server.ts`.
 */
import type {Locale} from '@/i18n/routing';
import {stripGold} from '@/components/ui/GoldText';
import type {ArticleCardView, ArticleDetail, FaqView} from './cms/views';
import {siteConfig} from './site';
import {absoluteUrl, localizedUrl} from './urls';

export const SCHEMA_ID = {
  website: `${siteConfig.url}/#website`,
  clinic: `${siteConfig.url}/#clinic`,
  physician: `${siteConfig.url}/#physician`
};

export function faqSchema(items: FaqView[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {'@type': 'Answer', text: item.answer}
    }))
  };
}

export function breadcrumbSchema(locale: Locale, items: Array<{name: string; path: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: stripGold(item.name),
      item: localizedUrl(locale, item.path)
    }))
  };
}

type Author = {name: string; jobTitle: string};

function articleNode(locale: Locale, article: ArticleCardView | ArticleDetail, author: Author) {
  const url = localizedUrl(locale, `/articles/${article.slug}`);
  return {
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    ...(article.image ? {image: [absoluteUrl(article.image)]} : {}),
    datePublished: article.published,
    dateModified: 'updated' in article ? article.updated : article.published,
    inLanguage: locale,
    articleSection: article.category,
    url,
    mainEntityOfPage: {'@type': 'WebPage', '@id': url},
    author: {
      '@type': 'Person',
      name: author.name,
      url: localizedUrl(locale, '/about'),
      jobTitle: author.jobTitle
    },
    publisher: {'@id': SCHEMA_ID.clinic}
  };
}

export function articleSchema(locale: Locale, article: ArticleDetail, author: Author) {
  return {'@context': 'https://schema.org', ...articleNode(locale, article, author)};
}

/** Articles index: a CollectionPage whose main entity is an ItemList of Article entries. */
export function articleListSchema(locale: Locale, articles: ArticleCardView[], author: Author, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: localizedUrl(locale, '/articles'),
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: articleNode(locale, article, author)
      }))
    }
  };
}
