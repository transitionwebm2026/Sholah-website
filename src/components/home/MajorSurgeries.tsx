import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {Link} from '@/i18n/navigation';
import {serviceImages} from '@/lib/content';
import type {ServiceId} from '@/lib/types';

type Surgery = {id: string; category: ServiceId; title: string; description: string};

/** Section 4: three highlighted procedures linking to their specialty on /services. */
export async function MajorSurgeries() {
  const t = await getTranslations('Home.surgeries');
  const tCommon = await getTranslations('Common');
  const items = t.raw('items') as Surgery[];

  return (
    <Section id="surgeries" labelledBy="surgeries-title" tone="light">
      <Container>
        <SectionHeading id="surgeries-title" eyebrow={t('eyebrow')} title={t('title')} description={t('description')} onLight />

        <ul className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} data-reveal>
              <article className="fx-card group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-900/5 hover:shadow-luxe">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image
                    src={serviceImages[item.category]}
                    alt=""
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                    className="fx-media object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="text-xl font-bold text-navy-900">
                    <Link href={`/services#${item.category}`} className="after:absolute after:inset-0 after:rounded-3xl">
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

        <div data-reveal="up" className="mt-14 text-center">
          <ButtonLink href="/services" variant="navy">
            {t('cta')}
            <DirectionalArrow />
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
