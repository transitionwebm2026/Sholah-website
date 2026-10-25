'use client';

import {ChevronDown} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {FaqSection} from '@/components/sections/FaqSection';
import {CmsImage} from '@/components/ui/CmsImage';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {Eyebrow, SectionHeading} from '@/components/ui/SectionHeading';
import {useLiveView} from '@/lib/cms/live';
import {useNavLabel} from '@/lib/cms/site-context';
import type {ServicesViewData} from '@/lib/cms/views';
import {cn} from '@/lib/utils';

export function ServicesView({initial}: {initial: ServicesViewData}) {
  const v = useLiveView('services', initial).data ?? initial;
  const t = useTranslations('Services');
  const navLabel = useNavLabel('services');

  return (
    <>
      <PageHero hero={v.hero} crumbs={[{name: navLabel, path: '/services'}]} />

      {/* Specialty picker: each card jumps to its detailed section below. */}
      {v.categories.length > 0 && (
        <Section id="fields" labelledBy="fields-title" tone="deep">
          <Container>
            <SectionHeading id="fields-title" eyebrow={v.fields.eyebrow} title={v.fields.title} />
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {v.categories.map((category, i) => (
                <li key={category.slug} data-reveal>
                  <a
                    href={`#${category.slug}`}
                    className="fx-card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] hover:border-gold-400/50"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
                      <CmsImage
                        src={category.image}
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
      )}

      {/* One detailed section per specialty, alternating light / brand tones. */}
      {v.categories.map((category, i) => {
        const onLight = i % 2 === 0;
        return (
          <Section key={category.slug} id={category.slug} labelledBy={`${category.slug}-title`} tone={onLight ? 'light' : 'brand'}>
            <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className={cn('lg:col-span-5', !onLight && 'lg:order-last')}>
                <div className="lg:sticky lg:top-28">
                  <Eyebrow onLight={onLight} data-reveal="up">
                    {String(i + 1).padStart(2, '0')}
                  </Eyebrow>
                  <h2
                    id={`${category.slug}-title`}
                    data-reveal="up"
                    className={cn('text-3xl leading-tight font-bold text-balance sm:text-4xl', onLight ? 'text-navy-900' : 'text-white')}
                  >
                    {category.title}
                  </h2>
                  <p data-reveal="up" className={cn('mt-5 text-lg leading-relaxed', onLight ? 'text-slate-600' : 'text-white/80')}>
                    {category.description}
                  </p>
                  {category.image && (
                    <div data-reveal className="relative mt-8 aspect-[3/2] overflow-hidden rounded-3xl bg-navy-900 shadow-luxe">
                      <CmsImage src={category.image} sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7">
                {category.procedures.length > 0 && (
                  <>
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
                          key={procedure.slug}
                          data-reveal
                          className={cn(
                            'fx-glow group flex flex-col overflow-hidden rounded-3xl',
                            onLight
                              ? 'bg-white shadow-card ring-1 ring-navy-900/5 hover:shadow-luxe'
                              : 'border border-white/10 bg-white/[0.05] hover:border-gold-400/40'
                          )}
                        >
                          <div className="relative aspect-[3/2] overflow-hidden bg-navy-900">
                            <CmsImage
                              src={procedure.image}
                              sizes="(min-width: 1280px) 330px, (min-width: 1024px) 27vw, (min-width: 640px) 50vw, 100vw"
                              className="object-cover transition duration-700 ease-out group-hover:scale-105"
                            />
                          </div>
                          <div className="flex-1 p-6">
                            <h4 className={cn('text-lg font-bold text-balance', onLight ? 'text-navy-900' : 'text-white')}>
                              {procedure.title}
                            </h4>
                            <p className={cn('mt-2 leading-relaxed whitespace-pre-line', onLight ? 'text-slate-600' : 'text-white/75')}>
                              {procedure.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Container>
          </Section>
        );
      })}

      {/* Treatment determination process (diagnostic steps) */}
      {v.process.steps.length > 0 && (
        <Section id="process" labelledBy="process-title" tone="deep">
          <Container>
            <SectionHeading id="process-title" eyebrow={v.process.eyebrow} title={v.process.title} description={v.process.description} />
            <ol className={cn('relative mt-16 grid gap-6 md:grid-cols-2', v.process.steps.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4')}>
              <span
                aria-hidden
                className="fx-draw-x absolute inset-x-[10%] top-8 hidden h-px bg-linear-to-r from-gold-400/10 via-gold-400/60 to-gold-400/10 lg:block"
              />
              {v.process.steps.map((step, i) => (
                <li key={i} data-reveal className="relative text-center">
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
      )}

      <FaqSection id="services-faq" heading={v.faqBlock} items={v.faq} />

      <CtaSection band={v.hero.band} />
    </>
  );
}
