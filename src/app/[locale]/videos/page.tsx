import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {VideoCard} from '@/components/cards/VideoCard';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Locale} from '@/i18n/routing';
import {getVideos} from '@/lib/content';
import {buildPageMetadata} from '@/lib/seo';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return buildPageMetadata(locale, 'videos', '/videos');
}

export default async function VideosPage({params}: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations('Videos');
  const tNav = await getTranslations('Nav');
  const videos = await getVideos(locale);

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        description={t('hero.description')}
        crumbs={[{name: tNav('videos'), path: '/videos'}]}
      />

      <Section id="video-library" labelledBy="video-library-title" tone="deep">
        <Container>
          <SectionHeading id="video-library-title" eyebrow={t('grid.eyebrow')} title={t('grid.title')} />
          <ul className="mx-auto mt-14 grid max-w-5xl gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {videos.slice(0, 9).map((video) => (
              <li key={video.id} data-reveal>
                <VideoCard video={video} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaSection variant="videos" />
    </>
  );
}
