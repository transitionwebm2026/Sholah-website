import {getTranslations} from 'next-intl/server';
import {PatientJourney} from '@/components/interactive/PatientJourney';
import {Container} from '@/components/ui/Container';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Step} from '@/lib/types';

/** Section 6: interactive step-by-step patient journey. */
export async function JourneySection() {
  const t = await getTranslations('Home.journey');
  const tCommon = await getTranslations('Common');
  const steps = t.raw('steps') as Step[];

  return (
    <Section id="journey" labelledBy="journey-title" tone="brand">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Container>
        <SectionHeading id="journey-title" eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
        <div data-reveal="up" className="mt-14">
          <PatientJourney
            steps={steps}
            labels={{
              tablist: t('label'),
              steps: steps.map((_, i) => tCommon('step', {number: i + 1})),
              next: tCommon('nextStep'),
              previous: tCommon('previousStep')
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
