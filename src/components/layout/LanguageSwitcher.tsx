'use client';

import {useLocale} from 'next-intl';
import {useEffect, useTransition, type MouseEvent} from 'react';
import {Link, usePathname, useRouter} from '@/i18n/navigation';
import {localeShortName, routing, type Locale} from '@/i18n/routing';
import {cn} from '@/lib/utils';

const HEADER_OFFSET = 96;
const RESTORE_TIMEOUT_MS = 4000;

type Anchor = {id: string; progress: number; locale: string; previous: HTMLElement; startedAt: number};

/**
 * Pending scroll restoration. A module variable (not storage) is enough because the locale
 * switch is a client-side navigation, so this module stays loaded across it.
 */
let pending: Anchor | null = null;

/**
 * Pages differ in height between Arabic and English, so restoring the raw scrollY would land
 * on unrelated content. Instead we remember which section is at the top of the viewport and
 * how far into it the user has scrolled, then restore that same spot in the other language.
 */
function captureAnchor(locale: string): Anchor | null {
  const sections = document.querySelectorAll<HTMLElement>('main section[id]');
  let current: HTMLElement | null = null;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= HEADER_OFFSET) current = section;
    else break;
  }
  if (!current) return null;
  const rect = current.getBoundingClientRect();
  const progress = Math.min(Math.max((HEADER_OFFSET - rect.top) / rect.height, 0), 1);
  return {id: current.id, progress, locale, previous: current, startedAt: performance.now()};
}

function scrollToAnchor(anchor: Anchor, el: HTMLElement) {
  const top = el.getBoundingClientRect().top + window.scrollY + anchor.progress * el.offsetHeight - HEADER_OFFSET;
  window.scrollTo({top: Math.max(top, 0), behavior: 'instant'});
}

/**
 * The new layout can commit before the new page content has streamed in, so wait until the
 * section exists as a *new* element (not the one from the previous language) before scrolling,
 * then re-apply once web fonts are ready since they can change text heights.
 */
function restoreAnchor(locale: string) {
  const anchor = pending;
  if (!anchor || anchor.locale !== locale) return;

  const tick = () => {
    if (pending !== anchor) return; // superseded by another switch
    const el = document.getElementById(anchor.id);
    if (el && el !== anchor.previous && document.documentElement.lang === locale) {
      pending = null;
      scrollToAnchor(anchor, el);
      const scrolledTo = window.scrollY;
      document.fonts?.ready.then(() => {
        // Only adjust if the user has not scrolled in the meantime.
        if (Math.abs(window.scrollY - scrolledTo) < 2) scrollToAnchor(anchor, el);
      });
      return;
    }
    if (performance.now() - anchor.startedAt < RESTORE_TIMEOUT_MS) {
      requestAnimationFrame(tick);
      return;
    }
    // Timed out (e.g. the node was reused rather than replaced): restore best-effort.
    pending = null;
    if (el && document.documentElement.lang === locale) scrollToAnchor(anchor, el);
  };
  requestAnimationFrame(tick);
}

type Props = {
  /** Accessible label, e.g. "Switch language to Arabic". */
  label: string;
  /** Narrower below `sm`, so it fits between the logo and the menu button on phones. */
  compact?: boolean;
  className?: string;
};

/**
 * Two-sided toggle (عربي | EN): the gold thumb sits under the active language and slides to the
 * other side as soon as it is tapped, while the page switches. Still a real link (hreflang, works
 * without JS). `dir="ltr"` pins the sides, so they don't swap places when the page direction flips.
 */
export function LanguageSwitcher({label, compact, className}: Props) {
  const locale = useLocale() as Locale;
  const target = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Move the thumb immediately; the new page renders it in the same place.
  const shown = isPending ? target : locale;

  // Runs once the layout re-renders in the new language.
  useEffect(() => {
    restoreAnchor(locale);
  }, [locale]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks (new tab/window) behave like a normal link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();

    // No section at the top (e.g. still in the hero): `scroll: false` keeps the offset as is.
    pending = captureAnchor(target);

    startTransition(() => {
      router.replace(pathname, {locale: target, scroll: false});
    });
  }

  return (
    <Link
      href={pathname}
      locale={target}
      hrefLang={target}
      scroll={false}
      onClick={handleClick}
      aria-label={label}
      aria-busy={isPending || undefined}
      dir="ltr"
      className={cn(
        'group relative inline-grid h-11 grid-cols-2 items-center rounded-full border border-white/20 bg-white/5 p-1 text-sm font-semibold transition-colors hover:border-gold-400',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-gold-400 shadow-gold transition-transform duration-300 ease-out motion-reduce:transition-none',
          shown === routing.locales[1] && 'translate-x-full'
        )}
      />
      {routing.locales.map((l) => (
        <span
          key={l}
          lang={l}
          className={cn(
            'relative grid h-full place-items-center transition-colors duration-300',
            compact ? 'min-w-10 px-2 sm:min-w-12 sm:px-3' : 'min-w-12 px-3',
            l === shown ? 'text-navy-950' : 'text-white/70 group-hover:text-white'
          )}
        >
          {localeShortName[l]}
        </span>
      ))}
    </Link>
  );
}
