import type {Metadata} from 'next';
import Image from 'next/image';
import {Ambulance, Clock, GraduationCap, ScanLine, ShieldPlus, Stethoscope} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {StatsGrid} from '@/components/ui/StatsGrid';
import {VideoFacade} from '@/components/ui/VideoFacade';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {certificateImages, featureVideos, media} from '@/lib/content';
import {buildPageMetadata} from '@/lib/seo';

type Props = {params: Promise<{locale: string}>};

type CareerItem = {year: string; title: string; place: string};
type Expertise = {id: string; title: string; description: string};
type Certificate = {title: string; issuer: string; year: string};

const expertiseIcons: Record<string, typeof Stethoscope> = {
  laparoscopy: ScanLine,
  hernia: ShieldPlus,
  anorectal: Stethoscope,
  endocrine: GraduationCap,
  emergency: Ambulance,
  daycase: Clock
};

const expertiseTargets: Record<string, string> = {
  laparoscopy: '/services#laparoscopic',
  hernia: '/services#hernia',
  anorectal: '/services#anorectal',
  endocrine: '/services#endocrine',
  emergency: '/services#laparoscopic',
  daycase: '/services'
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return buildPageMetadata(locale, 'about', '/about');
}

export default async function AboutPage({params}: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations('About');
  const tNav = await getTranslations('Nav');
  const tCommon = await getTranslations('Common');
  const tDoctor = await getTranslations('Doctor');

  const paragraphs = t.raw('message.paragraphs') as string[];
  const career = t.raw('career.items') as CareerItem[];
  const expertise = t.raw('expertise.items') as Expertise[];
  const certificates = t.raw('certificates.items') as Certificate[];

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        description={t('hero.description')}
        crumbs={[{name: tNav('about'), path: '/about'}]}
      />

      {/* Doctor's message */}
      <Section id="message" labelledBy="message-title" tone="deep">
        <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div data-reveal className="relative mx-auto max-w-md">
              <div aria-hidden className="fx-frame absolute -inset-4 -rotate-3 rounded-[2.75rem] border border-gold-400/30" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-luxe">
                <Image
                  src={media.doctorMessage}
                  alt={tDoctor('imageAlt')}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 448px, 90vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeading id="message-title" eyebrow={t('message.eyebrow')} title={t('message.title')} align="start" />
            <blockquote className="relative mt-8 space-y-5 border-s-2 border-gold-400/60 ps-6 text-lg leading-relaxed text-white/85">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} data-reveal="up">
                  {paragraph}
                </p>
              ))}
            </blockquote>
            <p data-reveal="up" className="mt-8 ps-6">
              <span className="text-gold-gradient block text-2xl font-bold">{t('message.signature')}</span>
              <span className="mt-1 block text-sm text-white/70">{tDoctor('title')}</span>
            </p>
          </div>
        </Container>
      </Section>

      {/* Career & qualifications timeline */}
      <Section id="career" labelledBy="career-title" tone="brand">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-60" />
        <Container>
          <SectionHeading id="career-title" eyebrow={t('career.eyebrow')} title={t('career.title')} />
          <ol className="relative mx-auto mt-16 max-w-4xl">
            <span aria-hidden className="fx-draw-y absolute inset-y-0 start-[1.375rem] w-px bg-linear-to-b from-gold-400/70 via-gold-400/30 to-transparent md:start-1/2" />
            {career.map((item, i) => (
              <li
                key={item.year}
                className="relative grid grid-cols-[2.75rem_1fr] gap-5 pb-10 last:pb-0 md:grid-cols-2 md:gap-14"
              >
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

      {/* Full-width introductory video */}
      <Section id="intro-video" labelledBy="intro-video-title" tone="deep">
        <Container>
          <SectionHeading
            id="intro-video-title"
            eyebrow={t('introVideo.eyebrow')}
            title={t('introVideo.title')}
            description={t('introVideo.description')}
          />
          <div data-reveal="zoom" className="mt-12 rounded-[2.25rem] bg-linear-to-br from-gold-400/40 via-white/5 to-navy-600/40 p-px shadow-luxe">
            <VideoFacade
              youtubeId={featureVideos.aboutIntro.youtubeId}
              poster={featureVideos.aboutIntro.poster}
              title={t('introVideo.videoTitle')}
              playLabel={tCommon('playVideo', {title: t('introVideo.videoTitle')})}
              unavailableLabel={tCommon('videoUnavailable')}
              sizes="(min-width: 1280px) 1216px, 100vw"
              pulse
              className="rounded-[2.2rem]"
            />
          </div>
        </Container>
      </Section>

      {/* Areas of expertise */}
      <Section id="expertise" labelledBy="expertise-title" tone="light">
        <Container>
          <SectionHeading id="expertise-title" eyebrow={t('expertise.eyebrow')} title={t('expertise.title')} onLight />
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {expertise.map((item) => {
              const Icon = expertiseIcons[item.id] ?? Stethoscope;
              return (
                <li key={item.id} data-reveal>
                  <article className="fx-card group relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-card ring-1 ring-navy-900/5 hover:shadow-luxe">
                    <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left rtl:origin-right scale-x-0 bg-linear-to-r from-gold-500 to-gold-300 transition-transform duration-500 group-hover:scale-x-100" />
                    <span className="fx-depth grid size-14 place-items-center rounded-2xl bg-brand text-gold-300 transition duration-500 ease-out group-hover:rotate-6">
                      <Icon aria-hidden className="size-7" strokeWidth={1.6} />
                    </span>
                    <h3 className="mt-6 text-xl font-bold text-navy-900">
                      <Link href={expertiseTargets[item.id] ?? '/services'} className="after:absolute after:inset-0 after:rounded-3xl">
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
              );
            })}
          </ul>
          <div data-reveal="up" className="mt-14 text-center">
            <ButtonLink href="/services" variant="navy">
              {t('expertise.cta')}
              <DirectionalArrow />
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Certificates & accreditations */}
      <Section id="certificates" labelledBy="certificates-title" tone="deep">
        <Container>
          <SectionHeading id="certificates-title" eyebrow={t('certificates.eyebrow')} title={t('certificates.title')} />
          <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate, i) => (
              <li key={certificate.title} data-reveal>
                <figure className="fx-card group h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] hover:border-gold-400/40">
                  <div className="relative aspect-[24/17] overflow-hidden">
                    <Image
                      src={certificateImages[i % certificateImages.length]}
                      alt={t('certificates.imageAlt', {title: certificate.title})}
                      fill
                      placeholder="blur"
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                      className="fx-media object-cover"
                    />
                  </div>
                  <figcaption className="flex items-start justify-between gap-4 p-6">
                    <span>
                      <span className="block font-bold">{certificate.title}</span>
                      <span className="mt-1 block text-sm text-white/70">{certificate.issuer}</span>
                    </span>
                    <span className="shrink-0 rounded-full border border-gold-400/40 px-3 py-1 text-sm font-semibold text-gold-300">
                      {certificate.year}
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Achievements counters */}
      <Section id="achievements" labelledBy="achievements-title" tone="brand" className="py-16 sm:py-20">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-70" />
        <Container>
          <SectionHeading id="achievements-title" eyebrow={t('achievements.eyebrow')} title={t('achievements.title')} />
          <StatsGrid keys={['patients', 'surgeries', 'years', 'publications']} className="mt-12" />
        </Container>
      </Section>

      <CtaSection variant="about" />
    </>
  );
}
