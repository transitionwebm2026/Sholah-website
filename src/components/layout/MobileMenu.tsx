'use client';

import {Menu, Phone, X} from 'lucide-react';
import {useEffect, useRef, useState, type MouseEvent, type ReactNode} from 'react';
import {Link, usePathname} from '@/i18n/navigation';
import type {NavItem} from '@/lib/navigation';
import {cn} from '@/lib/utils';
import {LanguageSwitcher} from './LanguageSwitcher';
import {NavLinks} from './NavLinks';

type Props = {
  items: NavItem[];
  brand: ReactNode;
  labels: {open: string; close: string; nav: string; bookNow: string; switchLanguage: string};
  phone: {href: string; display: string} | null;
  className?: string;
};

/**
 * Full-screen menu built on the native <dialog> element: focus is trapped, Escape closes it
 * and the rest of the page becomes inert, without any extra library.
 */
export function MobileMenu({items, brand, labels, phone, className}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after navigating to another page.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const close = () => dialogRef.current?.close();

  // Also close when the current page's own link is tapped (pathname would not change).
  function handleLinkClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('a')) close();
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
        aria-label={labels.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="grid size-11 place-items-center rounded-full border border-white/20 text-white transition hover:border-gold-400 hover:text-gold-300"
      >
        <Menu aria-hidden className="size-5" />
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label={labels.nav}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-brand p-0 text-white"
      >
        <div className="flex min-h-full flex-col px-5 pt-4 pb-8">
          <div className="flex items-center justify-between gap-4">
            {brand}
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="grid size-11 place-items-center rounded-full border border-white/20 transition hover:border-gold-400 hover:text-gold-300"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <nav aria-label={labels.nav} className="mt-8" onClick={handleLinkClick}>
            <NavLinks items={items} variant="mobile" />
          </nav>

          <div className="mt-auto space-y-4 pt-10" onClick={handleLinkClick}>
            <Link
              href="/contact"
              className={cn(
                'flex min-h-13 w-full items-center justify-center rounded-full bg-gold-400 px-6 text-base font-semibold text-navy-950 shadow-gold'
              )}
            >
              {labels.bookNow}
            </Link>
            <div className="flex items-center justify-between gap-3">
              {phone ? (
                <a href={phone.href} className="inline-flex min-h-11 items-center gap-2 font-semibold text-white/90">
                  <Phone aria-hidden className="size-4 text-gold-400" />
                  <span dir="ltr">{phone.display}</span>
                </a>
              ) : (
                <span />
              )}
              <LanguageSwitcher label={labels.switchLanguage} />
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
