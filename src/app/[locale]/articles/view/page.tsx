import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {Suspense} from 'react';
import {ArticleQueryView} from '@/components/views/ArticleView';
import type {Locale} from '@/i18n/routing';
import {buildPageMetadata} from '@/lib/seo';

type Props = {params: Promise<{locale: string}>};

/*
 * `/articles/view?slug=…` — a static shell that loads the article in the browser. It serves
 * articles published in the dashboard after the last build (and `.htaccess` redirects unknown
 * `/articles/<slug>/` URLs here). Not indexed: the next build gives each article its own page.
 */
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const metadata = await buildPageMetadata(locale, 'articles', '/articles');
  return {...metadata, robots: {index: false, follow: true}};
}

export default async function ArticleViewerPage({params}: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  return (
    <Suspense>
      <ArticleQueryView />
    </Suspense>
  );
}
