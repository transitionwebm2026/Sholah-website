import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {stripGold} from '@/components/ui/GoldText';
import {routing, type Locale} from '@/i18n/routing';
import {getDataset} from './cms/server';
import type {PageKey} from './cms/types';
import {tr} from './cms/views';
import {absoluteUrl, languageAlternates, localizedUrl} from './urls';

export {absoluteUrl, languageAlternates, localizedUrl};
export type {PageKey};

const OG_LOCALE: Record<Locale, string> = {ar: 'ar_EG', en: 'en_US'};

/*
 * Metadata is written into the static HTML at build time, so title/description/OG changes made in
 * the dashboard reach search engines after the next build (the visible page content is live).
 */

export async function getSiteName(locale: Locale) {
  const [settings, doctor] = await Promise.all([getDataset('settings'), getDataset('doctor')]);
  return tr(settings?.site_name, locale) || tr(doctor?.name, locale);
}

type BuildMetadataInput = {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  /** Use the title as-is instead of applying the "%s | Site name" template. */
  absoluteTitle?: boolean;
  image?: {url: string; width?: number; height?: number; alt: string};
  article?: {publishedTime: string; modifiedTime?: string; section: string; author: string};
  noIndex?: boolean;
};

export async function buildMetadata({
  locale,
  path = '',
  title,
  description,
  absoluteTitle,
  image,
  article,
  noIndex
}: BuildMetadataInput): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'Metadata'});
  const siteName = await getSiteName(locale);
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
    ...(noIndex ? {robots: {index: false, follow: true}} : {}),
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
            modifiedTime: article.modifiedTime,
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

/** Standard pages: SEO title/description from Dashboard → Pages (falls back to the hero text). */
export async function buildPageMetadata(locale: Locale, page: PageKey, path = ''): Promise<Metadata> {
  const heroes = await getDataset('heroes');
  const hero = heroes.find((h) => h.page === page);
  const title = tr(hero?.meta_title, locale) || stripGold(tr(hero?.title, locale));
  const description = tr(hero?.meta_description, locale) || tr(hero?.description, locale);
  return buildMetadata({locale, path, title, description, absoluteTitle: page === 'home'});
}
