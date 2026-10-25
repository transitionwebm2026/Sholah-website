'use client';

import {useTranslations} from 'next-intl';
import {createContext, use, type ReactNode} from 'react';
import {useLiveView} from './live';
import type {SiteView} from './views';

const SiteContext = createContext<SiteView | null>(null);

/** Global settings (logos, contact details, navigation, footer), kept live like the pages. */
export function SiteProvider({initial, children}: {initial: SiteView; children: ReactNode}) {
  const {data} = useLiveView('layout', initial);
  return <SiteContext value={data ?? initial}>{children}</SiteContext>;
}

export function useSite(): SiteView {
  const site = use(SiteContext);
  if (!site) throw new Error('useSite() must be used inside <SiteProvider>.');
  return site;
}

type NavKey = 'home' | 'about' | 'services' | 'reviews' | 'videos' | 'articles' | 'contact';

/** A page's name as the editor wrote it in the navbar (breadcrumbs), with the built-in label as fallback. */
export function useNavLabel(key: NavKey): string {
  const site = useSite();
  const t = useTranslations('Nav');
  const path = key === 'home' ? '/' : `/${key}`;
  return site.nav.find((item) => item.href === path)?.label || t(key);
}
