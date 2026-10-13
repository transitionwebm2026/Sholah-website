import {getLocale, getTranslations} from 'next-intl/server';
import {VideoCard} from '@/components/cards/VideoCard';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Locale} from '@/i18n/routing';
import {getVideos} from '@/lib/content';

/** Section 8: three portrait video cards. */
export async function FeaturedVideos() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('Home.videos');
  const videos = (await getVideos(locale)).slice(0, 3);

  return (
    <Section id="videos" labelledBy="videos-title" tone="deep">
      <Container>
        <SectionHeading id="videos-title" eyebrow={t('eyebrow')} title={t('title')} />
        <ul className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <li key={video.id} data-reveal>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
        <div data-reveal="up" className="mt-14 text-center">
          <ButtonLink href="/videos" variant="outline">
            {t('cta')}
            <DirectionalArrow />
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
