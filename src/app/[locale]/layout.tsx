import '../globals.css';
import type {Metadata, Viewport} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {ReactNode} from 'react';
import {FloatingContact} from '@/components/layout/FloatingContact';
import {Footer} from '@/components/layout/Footer';
import {Header} from '@/components/layout/Header';
import {JsonLd} from '@/components/ui/JsonLd';
import {PointerFx} from '@/components/ui/PointerFx';
import {RevealFx} from '@/components/ui/RevealFx';
import {stripGold} from '@/components/ui/GoldText';
import {localeDirection, routing} from '@/i18n/routing';
import {ArticleLinksProvider} from '@/lib/cms/article-links';
import {getDataset, getView} from '@/lib/cms/server';
import {SiteProvider} from '@/lib/cms/site-context';
import {tr} from '@/lib/cms/views';
import {arabicFont, englishFont} from '@/lib/fonts';
import {getSiteSchema} from '@/lib/schema-server';
import {siteConfig} from '@/lib/site';
import {localizedUrl} from '@/lib/urls';

type Props = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

// Pre-render `/ar/` and `/en/` (and every page below them) at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: '#062553',
  colorScheme: 'dark'
};

export async function generateMetadata({params}: Omit<Props, 'children'>): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const [site, heroes] = await Promise.all([getView('layout', locale), getDataset('heroes')]);
  const home = heroes.find((h) => h.page === 'home');

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: tr(home?.meta_title, locale) || site.siteName,
      template: `%s | ${site.siteName}`
    },
    description: tr(home?.meta_description, locale) || stripGold(tr(home?.description, locale)),
    applicationName: site.siteName,
    authors: [{name: site.doctor.name || site.siteName, url: localizedUrl(locale, '/about')}],
    creator: site.siteName,
    publisher: site.siteName,
    category: 'health',
    formatDetection: {telephone: false, email: false, address: false},
    robots: {
      index: true,
      follow: true,
      googleBot: {index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1}
    }
  };
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for every server component below this layout.
  setRequestLocale(locale);

  const [t, site, articles, siteSchema] = await Promise.all([
    getTranslations('Common'),
    getView('layout', locale),
    getDataset('articles'),
    getSiteSchema(locale)
  ]);
  const font = locale === 'ar' ? arabicFont : englishFont;

  return (
    <html lang={locale} dir={localeDirection[locale]} className={font.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col bg-navy-900 font-sans text-white antialiased">
        {/* Messages are UI strings only (content comes from the CMS), so the client gets all of them. */}
        <NextIntlClientProvider>
          <SiteProvider initial={site}>
            <ArticleLinksProvider slugs={articles.map((a) => a.slug)}>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold-400 focus:px-5 focus:py-3 focus:font-semibold focus:text-navy-950"
              >
                {t('skipToContent')}
              </a>
              <Header />
              <main id="main-content" tabIndex={-1} className="flex-1 overflow-x-clip outline-none">
                {children}
              </main>
              <Footer />
              <FloatingContact />
            </ArticleLinksProvider>
          </SiteProvider>
          <PointerFx />
          <RevealFx />
        </NextIntlClientProvider>
        <JsonLd data={siteSchema} />
      </body>
    </html>
  );
}
