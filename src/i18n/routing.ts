import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  // Always prefix (`/ar/`, `/en/`) so every page has one canonical, crawlable URL per language.
  // Required for static export: there is no proxy/middleware, every locale is its own folder in `out/`.
  // The bare `/` is handled by `app/page.tsx` (client redirect) and `public/.htaccess` (server redirect).
  localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];

export const localeDirection: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr'
};

/** Native labels on the two sides of the language toggle, shown regardless of the active locale. */
export const localeShortName: Record<Locale, string> = {
  ar: 'عربي',
  en: 'EN'
};
