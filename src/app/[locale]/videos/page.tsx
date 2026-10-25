import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {VideosView} from '@/components/views/ListViews';
import type {Locale} from '@/i18n/routing';
import {getView} from '@/lib/cms/server';
import {buildPageMetadata} from '@/lib/seo';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return buildPageMetadata(locale, 'videos', '/videos');
}

export default async function VideosPage({params}: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  return <VideosView initial={await getView('videos', locale)} />;
}
