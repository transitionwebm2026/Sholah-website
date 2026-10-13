import type {Metadata} from 'next';
import Image from 'next/image';
import {ChevronDown} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {FaqSection} from '@/components/sections/FaqSection';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {Eyebrow, SectionHeading} from '@/components/ui/SectionHeading';
import type {Locale} from '@/i18n/routing';
import {getFaq, getServiceCategories, serviceImages} from '@/lib/content';
import {buildPageMetadata} from '@/lib/seo';
import type {Step} from '@/lib/types';
import {cn} from '@/lib/utils';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return buildPageMetadata(locale, 'services', '/services');
}

export default async function ServicesPage({params}: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations('Services');
  const tNav = await getTranslations('Nav');
  const [categories, faq] = await Promise.all([getServiceCategories(locale), getFaq(locale, 'services')]);
  const processSteps = t.raw('process.steps') as Step[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        description={t('hero.description')}
        crumbs={[{name: tNav('services'), path: '/services'}]}
      />

      {/* Specialty picker: each card jumps to its detailed section below. */}
      <Section id="fields" labelledBy="fields-title" tone="deep">
        <Container>
          <SectionHeading id="fields-title" eyebrow={t('fields.eyebrow')} title={t('fields.title')} />
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, i) => (
              <li key={category.id} data-reveal>
                <a
                  href={`#${category.id}`}
                  className="fx-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] hover:border-gold-400/50"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={serviceImages[category.id]}
                      alt=""
                      fill
                      placeholder="blur"
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                      className="fx-media object-cover"
                    />
                    <span className="absolute top-4 start-4 grid size-10 place-items-center rounded-full bg-navy-950/85 text-sm font-bold text-gold-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold">{category.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-white/75">{category.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold-300">
                      {t('fields.jump')}
                      <ChevronDown aria-hidden className="fx-bob size-4" />
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* One detailed section per specialty, alternating light / brand tones. */}
      {categories.map((category, i) => {
        const onLight = i % 2 === 0;
        return (
          <Section key={category.id} id={category.id} labelledBy={`${category.id}-title`} tone={onLight ? 'light' : 'brand'}>
            <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className={cn('lg:col-span-5', !onLight && 'lg:order-last')}>
                <div className="lg:sticky lg:top-28">
                  <Eyebrow onLight={onLight} data-reveal="up">
                    {String(i + 1).padStart(2, '0')}
                  </Eyebrow>
                  <h2
                    id={`${category.id}-title`}
                    data-reveal="up"
                    className={cn('text-3xl leading-tight font-bold text-balance sm:text-4xl', onLight ? 'text-navy-900' : 'text-white')}
                  >
                    {category.title}
                  </h2>
                  <p data-reveal="up" className={cn('mt-5 text-lg leading-relaxed', onLight ? 'text-slate-600' : 'text-white/80')}>
                    {category.description}
                  </p>
                  <div data-reveal className="relative mt-8 aspect-[3/2] overflow-hidden rounded-3xl shadow-luxe">
                    <Image
                      src={serviceImages[category.id]}
                      alt=""
                      fill
                      placeholder="blur"
                      sizes="(min-width: 1024px) 480px, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <h3
                  data-reveal="up"
                  className={cn('mb-6 text-sm font-bold ltr:tracking-[0.18em] ltr:uppercase', onLight ? 'text-gold-700' : 'text-gold-400')}
                >
                  {t('fields.procedures')}
                </h3>
                {/* Image → title → text, in the same 3:2 frame and radius as the specialty image beside them. */}
                <ul className="grid gap-5 sm:grid-cols-2">
                  {category.procedures.map((procedure) => (
                    <li
                      key={procedure.id}
                      data-reveal
                      className={cn(
                        'fx-glow group flex flex-col overflow-hidden rounded-3xl',
                        onLight
                          ? 'bg-white shadow-card ring-1 ring-navy-900/5 hover:shadow-luxe'
                          : 'border border-white/10 bg-white/[0.05] hover:border-gold-400/40'
                      )}
                    >
                      <div className="relative aspect-[3/2] overflow-hidden">
                        <Image
                          src={procedure.image}
                          alt=""
                          fill
                          placeholder="blur"
                          sizes="(min-width: 1280px) 330px, (min-width: 1024px) 27vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <h4 className={cn('text-lg font-bold text-balance', onLight ? 'text-navy-900' : 'text-white')}>{procedure.title}</h4>
                        <p className={cn('mt-2 leading-relaxed', onLight ? 'text-slate-600' : 'text-white/75')}>{procedure.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Container>
          </Section>
        );
      })}

      {/* Treatment determination process */}
      <Section id="process" labelledBy="process-title" tone="deep">
        <Container>
          <SectionHeading id="process-title" eyebrow={t('process.eyebrow')} title={t('process.title')} description={t('process.description')} />
          <ol className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <span aria-hidden className="fx-draw-x absolute inset-x-[10%] top-8 hidden h-px bg-linear-to-r from-gold-400/10 via-gold-400/60 to-gold-400/10 lg:block" />
            {processSteps.map((step, i) => (
              <li key={step.title} data-reveal className="relative text-center">
                <span className="relative z-10 mx-auto grid size-16 place-items-center rounded-full border-2 border-gold-400 bg-navy-900 text-xl font-bold text-gold-300 shadow-gold">
                  {i + 1}
                </span>
                <h3 className="mt-6 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-white/75">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <FaqSection id="services-faq" eyebrow={t('faq.eyebrow')} title={t('faq.title')} items={faq} />

      <CtaSection variant="services" />
    </>
  );
}
