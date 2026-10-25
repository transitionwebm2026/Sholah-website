'use client';

import {GraduationCap} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {CmsIcon} from '@/components/ui/CmsIcon';
import {CmsImage} from '@/components/ui/CmsImage';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {StatsGrid} from '@/components/ui/StatsGrid';
import {VideoFacade} from '@/components/ui/VideoFacade';
import {Link} from '@/i18n/navigation';
import {useLiveView} from '@/lib/cms/live';
import {useNavLabel} from '@/lib/cms/site-context';
import type {AboutViewData} from '@/lib/cms/views';

export function AboutView({initial}: {initial: AboutViewData}) {
  const v = useLiveView('about', initial).data ?? initial;
  const t = useTranslations('About');
  const tCommon = useTranslations('Common');
  const navLabel = useNavLabel('about');

  return (
    <>
      <PageHero hero={v.hero} crumbs={[{name: navLabel, path: '/about'}]} />

      {/* Doctor's message */}
      {v.message.paragraphs.length > 0 && (
        <Section id="message" labelledBy="message-title" tone="deep">
          <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div data-reveal className="relative mx-auto max-w-md">
                <div aria-hidden className="fx-frame absolute -inset-4 -rotate-3 rounded-[2.75rem] border border-gold-400/30" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/10 bg-navy-900 shadow-luxe">
                  <CmsImage
                    src={v.message.photo}
                    alt={v.doctor.imageAlt}
                    sizes="(min-width: 1024px) 448px, 90vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <SectionHeading id="message-title" eyebrow={v.message.eyebrow} title={v.message.title} align="start" />
              <blockquote className="relative mt-8 space-y-5 border-s-2 border-gold-400/60 ps-6 text-lg leading-relaxed text-white/85">
                {v.message.paragraphs.map((paragraph, i) => (
                  <p key={i} data-reveal="up">
                    {paragraph}
                  </p>
                ))}
              </blockquote>
              {v.message.signature && (
                <p data-reveal="up" className="mt-8 ps-6">
                  <span className="text-gold-gradient block text-2xl font-bold">{v.message.signature}</span>
                  <span className="mt-1 block text-sm text-white/70">{v.doctor.title}</span>
                </p>
              )}
            </div>
          </Container>
        </Section>
      )}

      {/* Career & qualifications timeline */}
      {v.career.items.length > 0 && (
        <Section id="career" labelledBy="career-title" tone="brand">
          <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-60" />
          <Container>
            <SectionHeading id="career-title" eyebrow={v.career.eyebrow} title={v.career.title} />
            <ol className="relative mx-auto mt-16 max-w-4xl">
              <span
                aria-hidden
                className="fx-draw-y absolute inset-y-0 start-[1.375rem] w-px bg-linear-to-b from-gold-400/70 via-gold-400/30 to-transparent md:start-1/2"
              />
              {v.career.items.map((item, i) => (
                <li key={i} className="relative grid grid-cols-[2.75rem_1fr] gap-5 pb-10 last:pb-0 md:grid-cols-2 md:gap-14">
                  <span
                    aria-hidden
                    data-reveal="pop"
                    className="relative z-10 mt-1 grid size-11 place-items-center rounded-full border-2 border-gold-400 bg-navy-900 md:absolute md:start-1/2 md:top-6 md:mt-0 md:-translate-x-1/2 rtl:md:translate-x-1/2"
                  >
                    <GraduationCap className="size-5 text-gold-300" />
                  </span>
                  <div data-reveal className={i % 2 === 0 ? 'md:col-start-1 md:text-end' : 'md:col-start-2'}>
                    <div className="fx-glow rounded-3xl border border-white/10 bg-white/[0.05] p-6 hover:border-gold-400/40">
                      <p className="text-gold-gradient text-2xl font-bold">{item.year}</p>
                      <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                      <p className="mt-1 text-white/75">{item.place}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </Section>
      )}

      {/* Full-width introductory video */}
      {v.introVideo.title && (
        <Section id="intro-video" labelledBy="intro-video-title" tone="deep">
          <Container>
            <SectionHeading
              id="intro-video-title"
              eyebrow={v.introVideo.eyebrow}
              title={v.introVideo.title}
              description={v.introVideo.description}
            />
            <div data-reveal="zoom" className="mt-12 rounded-[2.25rem] bg-linear-to-br from-gold-400/40 via-white/5 to-navy-600/40 p-px shadow-luxe">
              <VideoFacade
                url={v.introVideo.video.url}
                poster={v.introVideo.video.thumbnail}
                title={v.introVideo.video.title || v.introVideo.title}
                sizes="(min-width: 1280px) 1216px, 100vw"
                pulse
                className="rounded-[2.2rem]"
              />
            </div>
          </Container>
        </Section>
      )}

      {/* Areas of expertise */}
      {v.expertise.items.length > 0 && (
        <Section id="expertise" labelledBy="expertise-title" tone="light">
          <Container>
            <SectionHeading id="expertise-title" eyebrow={v.expertise.eyebrow} title={v.expertise.title} onLight />
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {v.expertise.items.map((item, i) => (
                <li key={i} data-reveal>
                  <article className="fx-card group relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-card ring-1 ring-navy-900/5 hover:shadow-luxe">
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-linear-to-r from-gold-500 to-gold-300 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right"
                    />
                    <span className="fx-depth grid size-14 place-items-center rounded-2xl bg-brand text-gold-300 transition duration-500 ease-out group-hover:rotate-6">
                      <CmsIcon name={item.icon} className="size-7" strokeWidth={1.6} />
                    </span>
                    <h3 className="mt-6 text-xl font-bold text-navy-900">
                      <Link href={item.href} className="after:absolute after:inset-0 after:rounded-3xl">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-3 leading-relaxed text-slate-600">{item.description}</p>
                    <span aria-hidden className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 opacity-0 transition group-hover:opacity-100">
                      {tCommon('learnMore')}
                      <DirectionalArrow />
                    </span>
                  </article>
                </li>
              ))}
            </ul>
            {v.expertise.cta && (
              <div data-reveal="up" className="mt-14 text-center">
                <ButtonLink href="/services" variant="navy">
                  {v.expertise.cta}
                  <DirectionalArrow />
                </ButtonLink>
              </div>
            )}
          </Container>
        </Section>
      )}

      {/* Certificates & accreditations */}
      {v.certificates.items.length > 0 && (
        <Section id="certificates" labelledBy="certificates-title" tone="deep">
          <Container>
            <SectionHeading id="certificates-title" eyebrow={v.certificates.eyebrow} title={v.certificates.title} />
            <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {v.certificates.items.map((certificate, i) => (
                <li key={i} data-reveal>
                  <figure className="fx-card group h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] hover:border-gold-400/40">
                    <div className="relative aspect-[24/17] overflow-hidden bg-navy-900">
                      <CmsImage
                        src={certificate.image}
                        alt={t('certificates.imageAlt', {title: certificate.title})}
                        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                        className="fx-media object-cover"
                      />
                    </div>
                    <figcaption className="flex items-start justify-between gap-4 p-6">
                      <span>
                        <span className="block font-bold">{certificate.title}</span>
                        <span className="mt-1 block text-sm text-white/70">{certificate.issuer}</span>
                      </span>
                      {certificate.year && (
                        <span className="shrink-0 rounded-full border border-gold-400/40 px-3 py-1 text-sm font-semibold text-gold-300">
                          {certificate.year}
                        </span>
                      )}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* Achievements counters */}
      {v.achievements.items.length > 0 && (
        <Section id="achievements" labelledBy="achievements-title" tone="brand" className="py-16 sm:py-20">
          <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-70" />
          <Container>
            <SectionHeading id="achievements-title" eyebrow={v.achievements.eyebrow} title={v.achievements.title} />
            <StatsGrid items={v.achievements.items} className="mt-12" />
          </Container>
        </Section>
      )}

      <CtaSection band={v.hero.band} />
    </>
  );
}
