'use client';

import {Link, usePathname} from '@/i18n/navigation';
import type {NavItem} from '@/lib/navigation';
import {cn} from '@/lib/utils';

function isActive(pathname: string, href: string) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
}

type Props = {
  items: NavItem[];
  variant: 'desktop' | 'mobile';
};

export function NavLinks({items, variant}: Props) {
  const pathname = usePathname();

  return (
    <ul className={variant === 'desktop' ? 'flex items-center gap-1' : 'flex flex-col gap-1'}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'transition-colors',
                variant === 'desktop'
                  ? 'relative rounded-full px-3.5 py-2 text-[0.95rem] font-medium after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-gold-400 after:transition-transform hover:text-gold-300'
                  : 'flex min-h-12 items-center rounded-2xl px-4 text-lg font-semibold hover:bg-white/5',
                active
                  ? variant === 'desktop'
                    ? 'text-gold-300 after:scale-x-100'
                    : 'bg-white/5 text-gold-300'
                  : 'text-white/85'
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
