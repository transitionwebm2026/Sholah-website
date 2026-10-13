import {getTranslations} from 'next-intl/server';
import {Container} from '@/components/ui/Container';
import {Section} from '@/components/ui/Section';
import {StatsGrid} from '@/components/ui/StatsGrid';

/** Section 3: full-width animated counters. */
export async function StatsBand() {
  const t = await getTranslations('Home.stats');

  return (
    <Section id="stats" labelledBy="stats-title" tone="brand" className="py-16 sm:py-20">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-70" />
      <Container>
        <h2 id="stats-title" className="mb-10 text-center text-2xl font-bold sm:text-3xl">
          {t('title')}
        </h2>
        <StatsGrid keys={['patients', 'surgeries', 'years']} />
      </Container>
    </Section>
  );
}
