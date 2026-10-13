'use client';

import Image, {type StaticImageData} from 'next/image';
import {Play} from 'lucide-react';
import {useState, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

type Props = {
  youtubeId: string;
  poster: StaticImageData;
  title: string;
  playLabel: string;
  unavailableLabel: string;
  orientation?: 'landscape' | 'portrait';
  sizes: string;
  /** Overlay shown on the poster only (e.g. a duration badge). */
  badge?: ReactNode;
  pulse?: boolean;
  className?: string;
};

/**
 * Lightweight YouTube "facade": renders only a poster + play button, and swaps in the
 * privacy-enhanced iframe on click. Saves ~1 MB of third-party JS per video on page load.
 */
export function VideoFacade({
  youtubeId,
  poster,
  title,
  playLabel,
  unavailableLabel,
  orientation = 'landscape',
  sizes,
  badge,
  pulse,
  className
}: Props) {
  const [state, setState] = useState<'idle' | 'playing' | 'unavailable'>('idle');

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-navy-950',
        orientation === 'portrait' ? 'aspect-[9/16]' : 'aspect-video',
        className
      )}
    >
      {state === 'playing' ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setState(youtubeId ? 'playing' : 'unavailable')}
            aria-label={playLabel}
            className="group absolute inset-0 size-full cursor-pointer"
          >
            <Image
              src={poster}
              alt=""
              fill
              sizes={sizes}
              placeholder="blur"
              className="object-cover transition duration-700 ease-out group-hover:scale-105"
            />
            <span aria-hidden className="absolute inset-0 bg-linear-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
            <span aria-hidden className="absolute inset-0 grid place-items-center">
              <span className="relative grid size-16 place-items-center rounded-full bg-gold-400 text-navy-950 shadow-gold transition duration-300 group-hover:scale-110 sm:size-20">
                {pulse ? (
                  <span className="absolute inset-0 rounded-full bg-gold-400/40 motion-safe:animate-ping" />
                ) : (
                  <span className="fx-ring absolute inset-0 rounded-full bg-gold-400/60" />
                )}
                <Play className="relative size-7 translate-x-0.5 fill-current sm:size-8" />
              </span>
            </span>
          </button>
          {badge && <div className="pointer-events-none absolute top-4 start-4">{badge}</div>}
          {state === 'unavailable' && (
            <p role="status" className="absolute inset-x-4 bottom-4 rounded-xl bg-navy-950/90 px-4 py-3 text-center text-sm text-white">
              {unavailableLabel}
            </p>
          )}
        </>
      )}
    </div>
  );
}
