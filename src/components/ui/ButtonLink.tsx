import type {AnchorHTMLAttributes, ReactNode} from 'react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

export type ButtonVariant = 'primary' | 'outline' | 'outlineDark' | 'whatsapp' | 'navy';

// Effects (`btn-fx`, `fx-shine`, `fx-wipe`) live in globals.css.
const base =
  'btn-fx inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition duration-300 ease-out motion-safe:hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4';

const sizes = {
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-13 px-7 py-3.5 text-base'
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'fx-shine bg-gold-400 text-navy-950 shadow-gold hover:bg-gold-300 hover:shadow-[0_18px_36px_-12px_rgb(223_165_129/0.75)] focus-visible:outline-gold-300',
  outline:
    'fx-wipe border border-white/25 bg-white/5 text-white backdrop-blur-sm [--fx-fill:var(--color-white)] hover:border-white hover:text-navy-950 focus-visible:border-white focus-visible:text-navy-950',
  outlineDark:
    'fx-wipe border border-navy-900/20 text-navy-900 [--fx-fill:var(--color-navy-900)] hover:border-navy-900 hover:text-white focus-visible:border-navy-900 focus-visible:text-white',
  whatsapp:
    'fx-shine bg-[#25D366] text-[#052e16] hover:bg-[#3be07a] hover:shadow-[0_16px_34px_-12px_rgb(37_211_102/0.7)] focus-visible:outline-[#25D366]',
  navy: 'fx-shine bg-navy-900 text-white [--fx-shine:rgb(233_193_164/0.45)] hover:bg-navy-800 hover:shadow-[0_16px_34px_-14px_rgb(6_37_83/0.7)]'
};

type Props = {
  href: string;
  /** Renders a plain <a>. External http(s) links open in a new tab. */
  external?: boolean;
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>;

export function buttonClasses(variant: ButtonVariant = 'primary', size: keyof typeof sizes = 'lg', className?: string) {
  return cn(base, sizes[size], variants[variant], className);
}

export function ButtonLink({href, external, variant = 'primary', size = 'lg', className, children, ...rest}: Props) {
  const classes = buttonClasses(variant, size, className);

  if (external) {
    const newTab = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(newTab ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
