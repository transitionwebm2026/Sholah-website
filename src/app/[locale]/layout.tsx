import '../globals.css';
import type {Metadata, Viewport} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import type {ReactNode} from 'react';
import {FloatingContact} from '@/components/layout/FloatingContact';
import {Footer} from '@/components/layout/Footer';
import {Header} from '@/components/layout/Header';
import {JsonLd} from '@/components/ui/JsonLd';
import {PointerFx} from '@/components/ui/PointerFx';
import {RevealFx} from '@/components/ui/RevealFx';
import {localeDirection, routing} from '@/i18n/routing';
import {arabicFont, englishFont} from '@/lib/fonts';
import {getSiteSchema} from '@/lib/schema';
import {localizedUrl} from '@/lib/seo';
import {siteConfig} from '@/lib/site';

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
  const t = await getTranslations({locale, namespace: 'Metadata'});

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t('pages.home.title'),
      template: `%s | ${t('siteName')}`
    },
    description: t('pages.home.description'),
    applicationName: t('siteName'),
    authors: [{name: t('siteName'), url: localizedUrl(locale, '/about')}],
    creator: t('siteName'),
    publisher: t('siteName'),
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

  const [messages, t, siteSchema] = await Promise.all([
    getMessages(),
    getTranslations('Common'),
    getSiteSchema(locale)
  ]);
  const font = locale === 'ar' ? arabicFont : englishFont;

  return (
    <html lang={locale} dir={localeDirection[locale]} className={font.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col bg-navy-900 font-sans text-white antialiased">
        {/* Client components receive their strings as props; only the error boundary reads messages. */}
        <NextIntlClientProvider messages={{Error: messages.Error}}>
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
          <PointerFx />
          <RevealFx />
        </NextIntlClientProvider>
        <JsonLd data={siteSchema} />
      </body>
    </html>
  );
}
