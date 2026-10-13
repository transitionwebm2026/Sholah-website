import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {routing, type Locale} from '@/i18n/routing';
import {siteConfig} from './site';

export type PageKey = 'home' | 'about' | 'services' | 'reviews' | 'videos' | 'articles' | 'contact';

const OG_LOCALE: Record<Locale, string> = {ar: 'ar_EG', en: 'en_US'};

/**
 * Absolute URL for a locale + path. Always ends with "/" to match the static export
 * (`trailingSlash: true`), so canonical and hreflang URLs never point at a redirect.
 */
export function localizedUrl(locale: Locale, path = '') {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `${siteConfig.url}/${locale}/${clean ? `${clean}/` : ''}`;
}

export function absoluteUrl(path: string) {
  return `${siteConfig.url}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** hreflang map: one entry per locale plus `x-default` (the default, Arabic, version). */
export function languageAlternates(path = '') {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) languages[locale] = localizedUrl(locale, path);
  languages['x-default'] = localizedUrl(routing.defaultLocale, path);
  return languages;
}

type BuildMetadataInput = {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  /** Use the title as-is instead of applying the "%s | Site name" template. */
  absoluteTitle?: boolean;
  image?: {url: string; width: number; height: number; alt: string};
  article?: {publishedTime: string; section: string; author: string};
};

export async function buildMetadata({
  locale,
  path = '',
  title,
  description,
  absoluteTitle,
  image,
  article
}: BuildMetadataInput): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'Metadata'});
  const siteName = t('siteName');
  const url = localizedUrl(locale, path);
  const fullTitle = absoluteTitle ? title : `${title} | ${siteName}`;
  const ogImage = image ?? {url: `/images/og-${locale}.jpg`, width: 1200, height: 630, alt: t('ogAlt')};

  return {
    title: absoluteTitle ? {absolute: title} : title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path)
    },
    openGraph: {
      url,
      title: fullTitle,
      description,
      siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [ogImage],
      ...(article
        ? {
            type: 'article',
            publishedTime: article.publishedTime,
            section: article.section,
            authors: [article.author]
          }
        : {type: 'website'})
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage.url]
    }
  };
}

/** Shorthand for the standard pages whose title/description live in `Metadata.pages.<key>`. */
export async function buildPageMetadata(locale: Locale, page: PageKey, path = ''): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'Metadata.pages'});
  return buildMetadata({
    locale,
    path,
    title: t(`${page}.title`),
    description: t(`${page}.description`),
    absoluteTitle: page === 'home'
  });
}
