import {VideoCard} from '@/components/cards/VideoCard';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {HeadingView, VideoView} from '@/lib/cms/views';

/** Section 8: the videos marked "featured" in the dashboard (first three if none are). */
export function FeaturedVideos({heading, videos}: {heading: HeadingView; videos: VideoView[]}) {
  if (!videos.length) return null;

  return (
    <Section id="videos" labelledBy="videos-title" tone="deep">
      <Container>
        <SectionHeading id="videos-title" eyebrow={heading.eyebrow} title={heading.title} />
        <ul className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <li key={video.id} data-reveal className={video.orientation === 'landscape' ? 'sm:col-span-2' : undefined}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
        {heading.cta && (
          <div data-reveal="up" className="mt-14 text-center">
            <ButtonLink href="/videos" variant="outline">
              {heading.cta}
              <DirectionalArrow />
            </ButtonLink>
          </div>
        )}
      </Container>
    </Section>
  );
}
