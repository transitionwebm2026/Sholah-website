import {BadgeCheck} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {VideoFacade} from '@/components/ui/VideoFacade';
import {featureVideos} from '@/lib/content';

/** Section 2: landscape video (start side, right in Arabic) + biography (end side). */
export async function AboutPreview() {
  const t = await getTranslations('Home.about');
  const tCommon = await getTranslations('Common');
  const paragraphs = t.raw('paragraphs') as string[];
  const points = t.raw('points') as string[];

  return (
    <Section id="about" labelledBy="about-title" tone="deep">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div data-reveal>
          <div className="rounded-[2.25rem] bg-linear-to-br from-gold-400/40 via-white/5 to-navy-600/40 p-px shadow-luxe">
            <VideoFacade
              youtubeId={featureVideos.homeAbout.youtubeId}
              poster={featureVideos.homeAbout.poster}
              title={t('videoTitle')}
              playLabel={tCommon('playVideo', {title: t('videoTitle')})}
              unavailableLabel={tCommon('videoUnavailable')}
              sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
              pulse
              className="rounded-[2.2rem]"
            />
          </div>
        </div>

        <div>
          <SectionHeading id="about-title" eyebrow={t('eyebrow')} title={t('title')} align="start" />
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-white/80">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} data-reveal="up">
                {paragraph}
              </p>
            ))}
          </div>
          <ul className="mt-8 space-y-3">
            {points.map((point) => (
              <li key={point} data-reveal="up" className="flex items-center gap-3 font-medium">
                <BadgeCheck aria-hidden className="size-5 shrink-0 text-gold-400" />
                {point}
              </li>
            ))}
          </ul>
          <ButtonLink href="/about" variant="outline" className="mt-10" data-reveal="up">
            {t('cta')}
            <DirectionalArrow />
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
