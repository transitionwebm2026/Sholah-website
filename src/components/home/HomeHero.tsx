import {CalendarCheck} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {PageHero} from '@/components/ui/PageHero';

/** Home content for the shared hero: no breadcrumbs, highlighted title, services as the second action. */
export async function HomeHero() {
  const t = await getTranslations('Home.hero');
  const tCommon = await getTranslations('Common');

  return (
    <PageHero
      title={t.rich('title', {
        gold: (chunks) => <span className="text-gold-gradient fx-shimmer">{chunks}</span>
      })}
      description={t('bio')}
      actions={
        <>
          <ButtonLink href="/contact">
            <CalendarCheck aria-hidden className="size-5" />
            {tCommon('bookNow')}
          </ButtonLink>
          <ButtonLink href="/services" variant="outline">
            {tCommon('ourServices')}
            <DirectionalArrow />
          </ButtonLink>
        </>
      }
    />
  );
}
