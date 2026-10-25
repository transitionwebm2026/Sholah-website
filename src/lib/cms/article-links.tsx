'use client';

import {createContext, use, useMemo, type ComponentProps, type ReactNode} from 'react';
import type {Link} from '@/i18n/navigation';

/*
 * Articles published in the dashboard after the last build have no static page yet. Links to
 * them go to `/articles/view?slug=…`, a client-rendered page, until the next build gives them
 * their own pre-rendered URL. The build passes the list of slugs it pre-rendered.
 */
const PrerenderedSlugs = createContext<ReadonlySet<string> | null>(null);

export function ArticleLinksProvider({slugs, children}: {slugs: string[]; children: ReactNode}) {
  const set = useMemo(() => new Set(slugs), [slugs]);
  return <PrerenderedSlugs value={set}>{children}</PrerenderedSlugs>;
}

export function useArticleHref(slug: string): ComponentProps<typeof Link>['href'] {
  const prerendered = use(PrerenderedSlugs);
  if (!prerendered || prerendered.has(slug)) return `/articles/${slug}`;
  return {pathname: '/articles/view', query: {slug}};
}
