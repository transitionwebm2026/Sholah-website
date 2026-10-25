'use client';

import {Link} from '@/i18n/navigation';
import {useSite} from '@/lib/cms/site-context';
import {cn} from '@/lib/utils';

type Props = {
  className?: string;
  /** `horizontal` fits the header bar; `stacked` is the logo's original layout (footer). */
  variant?: 'horizontal' | 'stacked';
};

/** Logos are uploaded in Dashboard → Global settings (defaults: `public/media/brand`). */
export function Brand({className, variant = 'horizontal'}: Props) {
  const site = useSite();
  const stacked = variant === 'stacked';
  const src = stacked ? site.logos.footer : site.logos.header;
  const name = site.doctor.name || site.siteName;

  return (
    <Link href="/" className={cn('inline-flex min-w-0 items-center transition-opacity hover:opacity-85', className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded logo of unknown aspect ratio, sized by height
        <img
          src={src}
          alt={name}
          loading={stacked ? 'lazy' : 'eager'}
          decoding="async"
          className={stacked ? 'h-40 w-auto max-w-full object-contain' : 'h-10 w-auto max-w-[min(14rem,100%)] object-contain sm:h-12'}
        />
      ) : (
        <span className="text-lg font-bold text-white">{name}</span>
      )}
    </Link>
  );
}
