import {routing, type Locale} from '@/i18n/routing';
import {siteConfig} from './site';

/**
 * Absolute URL for a locale + path. Always ends with "/" to match the static export
 * (`trailingSlash: true`), so canonical and hreflang URLs never point at a redirect.
 */
export function localizedUrl(locale: Locale, path = '') {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `${siteConfig.url}/${locale}/${clean ? `${clean}/` : ''}`;
}

/** Absolute URL for a site path; already-absolute URLs (e.g. Supabase Storage) pass through. */
export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteConfig.url}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** hreflang map: one entry per locale plus `x-default` (the default, Arabic, version). */
export function languageAlternates(path = '') {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) languages[locale] = localizedUrl(locale, path);
  languages['x-default'] = localizedUrl(routing.defaultLocale, path);
  return languages;
}
