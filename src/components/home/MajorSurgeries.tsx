import {useTranslations} from 'next-intl';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {CmsImage} from '@/components/ui/CmsImage';
import {Container} from '@/components/ui/Container';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {Link} from '@/i18n/navigation';
import type {HomeViewData} from '@/lib/cms/views';
import {cn} from '@/lib/utils';

/** Section 4: the specialties of /services, each linking to its section there. */
export function MajorSurgeries({surgeries}: {surgeries: HomeViewData['surgeries']}) {
  const tCommon = useTranslations('Common');
  if (!surgeries.items.length) return null;
  // Four specialties sit in one row on wide screens (2×2 below) instead of 3 + 1.
  const four = surgeries.items.length % 4 === 0 && surgeries.items.length % 3 !== 0;

  return (
    <Section id="surgeries" labelledBy="surgeries-title" tone="light">
      <Container>
        <SectionHeading
          id="surgeries-title"
          eyebrow={surgeries.eyebrow}
          title={surgeries.title}
          description={surgeries.description}
          onLight
        />

        <ul className={cn('mt-14 grid gap-8 md:grid-cols-2', four ? 'xl:grid-cols-4' : 'lg:grid-cols-3')}>
          {surgeries.items.map((item) => (
            <li key={item.slug} data-reveal>
              <article className="fx-card group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-900/5 hover:shadow-luxe">
                <div className="relative aspect-[3/2] overflow-hidden bg-navy-900">
                  <CmsImage
                    src={item.image}
                    sizes={four ? '(min-width: 1280px) 300px, (min-width: 768px) 50vw, 100vw' : '(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw'}
                    className="fx-media object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="text-xl font-bold text-navy-900">
                    <Link href={item.href} className="after:absolute after:inset-0 after:rounded-3xl">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-3 flex-1 leading-relaxed text-slate-600">{item.description}</p>
                  <span aria-hidden className="mt-6 inline-flex items-center gap-2 font-semibold text-gold-700">
                    {tCommon('learnMore')}
                    <DirectionalArrow />
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>

        {surgeries.cta && (
          <div data-reveal="up" className="mt-14 text-center">
            <ButtonLink href="/services" variant="navy">
              {surgeries.cta}
              <DirectionalArrow />
            </ButtonLink>
          </div>
        )}
      </Container>
    </Section>
  );
}
