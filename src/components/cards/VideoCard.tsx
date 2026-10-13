import {Clock} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import type {Video} from '@/lib/types';
import {VideoFacade} from '../ui/VideoFacade';

/** Portrait (9:16) video card for short clips. */
export async function VideoCard({video, headingLevel = 'h3'}: {video: Video; headingLevel?: 'h2' | 'h3'}) {
  const t = await getTranslations('Common');
  const Heading = headingLevel;

  return (
    <article className="group">
      <div className="fx-card overflow-hidden rounded-3xl border border-white/10 shadow-luxe hover:border-gold-400/40">
        <VideoFacade
          youtubeId={video.youtubeId}
          poster={video.poster}
          title={video.title}
          playLabel={t('playVideo', {title: video.title})}
          unavailableLabel={t('videoUnavailable')}
          orientation="portrait"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
          badge={
            <span dir="ltr" className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/80 px-3 py-1 text-xs font-semibold text-white">
              <Clock aria-hidden className="size-3.5 text-gold-300" />
              {video.duration}
            </span>
          }
        />
      </div>
      <Heading className="mt-5 text-lg leading-snug font-semibold text-balance text-white">{video.title}</Heading>
    </article>
  );
}
