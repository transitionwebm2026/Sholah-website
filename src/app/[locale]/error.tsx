'use client';

import {RotateCcw} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {buttonClasses} from '@/components/ui/ButtonLink';

export default function ErrorBoundary({reset}: {error: Error & {digest?: string}; reset: () => void}) {
  const t = useTranslations('Error');

  return (
    <section className="bg-brand py-32 text-center">
      <div className="mx-auto max-w-xl px-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <p className="mt-4 text-lg text-white/80">{t('description')}</p>
        <button type="button" onClick={reset} className={buttonClasses('primary', 'lg', 'mt-8')}>
          <RotateCcw aria-hidden className="size-4" />
          {t('retry')}
        </button>
      </div>
    </section>
  );
}
