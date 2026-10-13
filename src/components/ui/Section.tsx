import type {ReactNode} from 'react';
import {cn} from '@/lib/utils';

export type SectionTone = 'brand' | 'deep' | 'light';

const tones: Record<SectionTone, string> = {
  brand: 'bg-brand text-white',
  deep: 'bg-brand-deep text-white',
  light: 'bg-ivory text-ink'
};

type Props = {
  id: string;
  /** id of the heading that names this section (for `aria-labelledby`). */
  labelledBy?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
};

export function Section({id, labelledBy, tone = 'brand', className, children}: Props) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('relative isolate overflow-hidden py-20 sm:py-24 lg:py-28', tones[tone], className)}
    >
      {children}
    </section>
  );
}
