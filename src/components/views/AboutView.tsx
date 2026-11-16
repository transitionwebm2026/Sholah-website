'use client';

import {GraduationCap} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {ExpertiseHub} from '@/components/about/ExpertiseHub';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {CmsImage} from '@/components/ui/CmsImage';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {StatsGrid} from '@/components/ui/StatsGrid';
import {VideoFacade} from '@/components/ui/VideoFacade';
import {useLiveView} from '@/lib/cms/live';
import {useNavLabel} from '@/lib/cms/site-context';
import type {AboutViewData} from '@/lib/cms/views';

export function AboutView({initial}: {initial: AboutViewData}) {
  const v = useLiveView('about', initial).data ?? initial;
  const t = useTranslations('About');
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
            <ExpertiseHub items={v.expertise.items} photo={v.message.photo} caption={v.doctor.name} />
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
            {/* Up to four per row (two on tablets); a short last row is centred, never left hanging.
                From tablets up the cards are staggered: every second one sits lower (padding, not a
                transform, so it doesn't fight the reveal animation and all cards keep the same height). */}
            <ul className="mx-auto mt-14 flex max-w-6xl flex-wrap justify-center gap-6">
              {v.certificates.items.map((certificate, i) => (
                <li
                  key={i}
                  data-reveal
                  className={`w-full max-w-sm sm:w-[calc((100%-1.5rem)/2)] sm:max-w-none lg:w-[calc((100%-4.5rem)/4)] ${
                    i % 2 === 1 ? 'sm:pt-14' : 'sm:pb-14'
                  }`}
                >
                  <figure className="fx-card group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] hover:border-gold-400/40">
                    {/* The scans are portrait documents: a portrait mat shows the whole page, header first. */}
                    <div className="p-3 pb-0">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/90 ring-1 ring-white/10">
                        <CmsImage
                          src={certificate.image}
                          alt={t('certificates.imageAlt', {title: certificate.title})}
                          sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 384px"
                          className="fx-media object-cover object-top"
                        />
                      </div>
                    </div>
                    <figcaption className="flex flex-1 flex-col items-center px-5 pt-5 pb-6 text-center">
                      {certificate.year && <span className="text-gold-gradient text-lg font-bold">{certificate.year}</span>}
                      <span className="mt-1 block leading-snug font-bold text-balance">{certificate.title}</span>
                      {certificate.issuer && (
                        <span className="mt-auto block pt-4">
                          <span aria-hidden className="mx-auto mb-3 block h-px w-10 bg-gold-400/50" />
                          <span className="block text-sm text-white/70">{certificate.issuer}</span>
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
