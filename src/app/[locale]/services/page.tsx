import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {ServicesView} from '@/components/views/ServicesView';
import type {Locale} from '@/i18n/routing';
import {getView} from '@/lib/cms/server';
import {buildPageMetadata} from '@/lib/seo';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return buildPageMetadata(locale, 'services', '/services');
}

export default async function ServicesPage({params}: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  return <ServicesView initial={await getView('services', locale)} />;
}
