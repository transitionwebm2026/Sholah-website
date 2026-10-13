import {Activity, Award, BookOpen, Users} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {siteConfig} from '@/lib/site';
import {cn} from '@/lib/utils';
import {Counter} from './Counter';

type StatKey = keyof typeof siteConfig.stats;

const icons: Record<StatKey, typeof Users> = {
  patients: Users,
  surgeries: Activity,
  years: Award,
  publications: BookOpen
};

/** Reusable animated achievement counters (home + about). */
export async function StatsGrid({keys, className}: {keys: StatKey[]; className?: string}) {
  const t = await getTranslations('Stats');

  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2',
        keys.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
        className
      )}
    >
      {keys.map((key) => {
        const Icon = icons[key];
        return (
          <div key={key} data-reveal className="fx-glow flex flex-col-reverse items-center gap-3 bg-navy-900/90 px-6 py-10 text-center sm:py-12">
            <dt className="text-base font-medium text-white/75">{t(key)}</dt>
            <dd className="text-gold-gradient text-5xl font-bold sm:text-6xl">
              <Counter value={siteConfig.stats[key]} />
            </dd>
            <Icon aria-hidden className="size-9 text-gold-400/80" strokeWidth={1.5} />
          </div>
        );
      })}
    </dl>
  );
}
