'use client';

/*
 * Live content for a statically exported site. Every page ships with the content as it was at
 * build time (fast first paint, SEO, works without JS); after hydration this hook re-reads the
 * same view from Supabase and re-renders only if something changed in the dashboard since.
 */
import {useLocale} from 'next-intl';
import {useEffect, useState} from 'react';
import type {Locale} from '@/i18n/routing';
import {datasetLoader, fetchDataset} from './data';
import {cmsConfigured} from './rest';
import {loadView, type ViewKey, type Views} from './views';

const loadFromSupabase = datasetLoader(fetchDataset);

/** How long a fresh copy is reused across client-side navigations before asking again. */
const FRESH_MS = 60_000;

const cache = new Map<string, {data: unknown; at: number}>();
const inflight = new Map<string, Promise<unknown>>();

function fetchView<K extends ViewKey>(id: string, key: K, locale: Locale, slug?: string): Promise<Views[K]> {
  let pending = inflight.get(id) as Promise<Views[K]> | undefined;
  if (!pending) {
    pending = loadView(key, locale, loadFromSupabase, slug)
      .then((data) => {
        cache.set(id, {data, at: Date.now()});
        return data;
      })
      .finally(() => inflight.delete(id));
    inflight.set(id, pending);
  }
  return pending;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Returns `initial` on the first render (identical to the static HTML, so hydration matches),
 * then the latest version from the CMS. Pass `initial = null` for client-only views.
 */
export function useLiveView<K extends ViewKey>(key: K, initial: Views[K] | null, slug?: string) {
  const locale = useLocale() as Locale;
  const id = `${key}:${locale}:${slug ?? ''}`;
  // The page's first load hydrates with `initial` (the cache is still empty then); later
  // client-side navigations start straight from the cached fresh copy.
  const [data, setData] = useState<Views[K] | null>(() => (cache.get(id)?.data as Views[K] | undefined) ?? initial);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!cmsConfigured) return;
    const hit = cache.get(id);
    if (hit && Date.now() - hit.at < FRESH_MS) return; // Already rendered from the cache.
    let active = true;
    fetchView(id, key, locale, slug)
      .then((fresh) => {
        if (active) setData((current) => (same(current, fresh) ? current : fresh));
      })
      .catch((error: unknown) => {
        // Keep showing the build-time content; the site must never break because the API is down.
        console.warn('[cms] live refresh failed:', error);
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [id, key, locale, slug]);

  const status: 'loading' | 'ready' | 'error' = data ? 'ready' : failed || !cmsConfigured ? 'error' : 'loading';
  return {data, status};
}
