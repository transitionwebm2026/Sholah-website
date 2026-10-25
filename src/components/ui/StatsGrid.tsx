import type {StatView} from '@/lib/cms/views';
import {cn} from '@/lib/utils';
import {CmsIcon} from './CmsIcon';
import {Counter} from './Counter';

/** Reusable animated achievement counters (home + about), edited in Dashboard → Home page → Statistics. */
export function StatsGrid({items, className}: {items: StatView[]; className?: string}) {
  if (!items.length) return null;

  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2',
        items.length === 3 ? 'lg:grid-cols-3' : items.length >= 4 ? 'lg:grid-cols-4' : '',
        className
      )}
    >
      {items.map((item) => (
        <div
          key={`${item.icon}-${item.label}`}
          data-reveal
          className="fx-glow flex flex-col-reverse items-center gap-3 bg-navy-900/90 px-6 py-10 text-center sm:py-12"
        >
          <dt className="text-base font-medium text-white/75">{item.label}</dt>
          <dd className="text-gold-gradient text-5xl font-bold sm:text-6xl">
            <Counter value={item.value} suffix={item.suffix} />
          </dd>
          <CmsIcon name={item.icon} fallback="award" className="size-9 text-gold-400/80" strokeWidth={1.5} />
        </div>
      ))}
    </dl>
  );
}
