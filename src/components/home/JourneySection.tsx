import {useTranslations} from 'next-intl';
import {PatientJourney} from '@/components/interactive/PatientJourney';
import {Container} from '@/components/ui/Container';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {HomeViewData} from '@/lib/cms/views';

/** Section 6: interactive step-by-step patient journey. */
export function JourneySection({journey}: {journey: HomeViewData['journey']}) {
  const t = useTranslations('Home.journey');
  const tCommon = useTranslations('Common');
  const {steps} = journey;
  if (!steps.length) return null;

  return (
    <Section id="journey" labelledBy="journey-title" tone="brand">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Container>
        <SectionHeading id="journey-title" eyebrow={journey.eyebrow} title={journey.title} description={journey.description} />
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
