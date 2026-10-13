import type {HTMLAttributes, ReactNode} from 'react';
import {cn} from '@/lib/utils';

type Props = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'start';
  /** Set on ivory sections so colours keep AA contrast. */
  onLight?: boolean;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
};

type EyebrowProps = {children: ReactNode; onLight?: boolean} & HTMLAttributes<HTMLParagraphElement>;

export function Eyebrow({children, onLight, className, ...rest}: EyebrowProps) {
  return (
    <p
      className={cn(
        // Letter-spacing and uppercase are LTR-only: tracking breaks Arabic letter joining.
        'mb-4 inline-flex items-center gap-3 text-sm font-semibold ltr:uppercase ltr:tracking-[0.18em]',
        onLight ? 'text-gold-700' : 'text-gold-400',
        className
      )}
      {...rest}
    >
      <span aria-hidden className="fx-line h-px w-8 bg-current" />
      {children}
    </p>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = 'center',
  onLight,
  as: Tag = 'h2',
  className
}: Props) {
  return (
    <div className={cn('max-w-3xl', align === 'center' ? 'mx-auto text-center' : 'text-start', className)}>
      {eyebrow && (
        <Eyebrow onLight={onLight} data-reveal="up">
          {eyebrow}
        </Eyebrow>
      )}
      <Tag
        id={id}
        data-reveal="up"
        className={cn(
          'text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-[2.6rem]',
          onLight ? 'text-navy-900' : 'text-white'
        )}
      >
        {title}
      </Tag>
      {description && (
        <p data-reveal="up" className={cn('mt-5 text-lg leading-relaxed text-pretty', onLight ? 'text-slate-600' : 'text-white/80')}>
          {description}
        </p>
      )}
    </div>
  );
}
