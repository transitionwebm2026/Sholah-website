import {Container} from '@/components/ui/Container';
import {Section} from '@/components/ui/Section';
import {StatsGrid} from '@/components/ui/StatsGrid';
import type {HomeViewData} from '@/lib/cms/views';

/** Section 3: full-width animated counters (the stats marked "show on home"). */
export function StatsBand({stats}: {stats: HomeViewData['stats']}) {
  const items = stats.items.filter((s) => s.onHome);
  if (!items.length) return null;

  return (
    <Section id="stats" labelledBy="stats-title" tone="brand" className="py-16 sm:py-20">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-70" />
      <Container>
        <h2 id="stats-title" className="mb-10 text-center text-2xl font-bold sm:text-3xl">
          {stats.title}
        </h2>
        <StatsGrid items={items} />
      </Container>
    </Section>
  );
}
