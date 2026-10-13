import {Quote, Star} from 'lucide-react';
import type {Review} from '@/lib/types';
import {cn} from '@/lib/utils';

/** Pure presentational card, safe to render from both server and client components. */
export function ReviewCard({review, ratingLabel, className}: {review: Review; ratingLabel: string; className?: string}) {
  return (
    <figure
      className={cn(
        'fx-glow flex h-full flex-col rounded-3xl bg-white p-7 shadow-card ring-1 ring-navy-900/5 sm:p-8',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div role="img" aria-label={ratingLabel} className="flex gap-1 text-gold-600">
          {Array.from({length: 5}, (_, i) => (
            <Star key={i} aria-hidden className="size-4 fill-current" />
          ))}
        </div>
        <Quote aria-hidden className="size-9 text-gold-400/50 rtl:-scale-x-100" />
      </div>

      <blockquote className="mt-5 flex-1 text-[1.05rem] leading-relaxed text-slate-700">
        <p>{review.text}</p>
      </blockquote>

      <figcaption className="mt-7 flex items-center gap-4 border-t border-navy-900/10 pt-5">
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-lg font-bold text-gold-300"
        >
          {review.name.charAt(0)}
        </span>
        <span>
          <span className="block font-bold text-navy-900">{review.name}</span>
          <span className="block text-sm text-gold-700">{review.procedure}</span>
        </span>
      </figcaption>
    </figure>
  );
}
