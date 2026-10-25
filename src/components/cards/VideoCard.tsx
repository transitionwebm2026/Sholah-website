import {Clock} from 'lucide-react';
import type {VideoView} from '@/lib/cms/views';
import {VideoFacade} from '../ui/VideoFacade';

/**
 * Video card: portrait (9:16) for shorts, landscape (16:9) for long-form, as set per video in the
 * dashboard. Grids give landscape cards two columns (`sm:col-span-2` on their grid item).
 */
export function VideoCard({video, headingLevel = 'h3'}: {video: VideoView; headingLevel?: 'h2' | 'h3'}) {
  const Heading = headingLevel;

  return (
    <article className="group">
      <div className="fx-card overflow-hidden rounded-3xl border border-white/10 shadow-luxe hover:border-gold-400/40">
        <VideoFacade
          url={video.url}
          poster={video.thumbnail}
          title={video.title}
          orientation={video.orientation}
          sizes={
            video.orientation === 'portrait'
              ? '(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw'
              : '(min-width: 1024px) 780px, 100vw'
          }
          badge={
            video.duration ? (
              <span dir="ltr" className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/80 px-3 py-1 text-xs font-semibold text-white">
                <Clock aria-hidden className="size-3.5 text-gold-300" />
                {video.duration}
              </span>
            ) : undefined
          }
        />
      </div>
      <Heading className="mt-5 text-lg leading-snug font-semibold text-balance text-white">{video.title}</Heading>
      {video.description && <p className="mt-2 text-sm leading-relaxed text-white/70">{video.description}</p>}
    </article>
  );
}
