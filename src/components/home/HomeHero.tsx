import {PageHero} from '@/components/ui/PageHero';
import type {HeroView} from '@/lib/cms/views';

/** Home content for the shared hero: no breadcrumbs; title highlight and buttons come from the CMS. */
export function HomeHero({hero}: {hero: HeroView}) {
  return <PageHero hero={hero} />;
}
