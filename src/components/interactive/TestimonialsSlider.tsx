'use client';

import {ChevronLeft, ChevronRight, Pause, Play} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {Review} from '@/lib/types';
import {cn} from '@/lib/utils';
import {ReviewCard} from '../cards/ReviewCard';

type Props = {
  reviews: Review[];
  labels: {
    region: string;
    previous: string;
    next: string;
    pause: string;
    play: string;
    rating: string;
    /** "1 of 9", … one per slide. */
    slides: string[];
    /** "Go to slide 1", … one per possible page. */
    pages: string[];
  };
  intervalMs?: number;
};

const isRtl = (el: HTMLElement) => getComputedStyle(el).direction === 'rtl';

/**
 * Native scroll-snap carousel: swipe on touch devices for free, autoplay that pauses on
 * hover, keyboard focus, hidden tabs and reduced-motion, plus an explicit pause button (WCAG 2.2.2).
 * Works in both RTL and LTR (RTL uses negative scrollLeft).
 */
export function TestimonialsSlider({reviews, labels, intervalMs = 5500}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const slideCount = reviews.length;
  const pageCount = Math.max(1, Math.ceil(slideCount / perView));
  const currentPage = Math.min(Math.round(index / perView), pageCount - 1);

  /** scrollLeft that aligns slide `i` with the track's start edge (LTR: left, RTL: right). */
  const offsetFor = useCallback((i: number) => {
    const track = trackRef.current;
    const slide = track?.children[i] as HTMLElement | undefined;
    if (!track || !slide) return 0;
    return isRtl(track) ? slide.offsetLeft + slide.offsetWidth - track.clientWidth : slide.offsetLeft;
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(i, slideCount - 1));
      track.scrollTo({left: offsetFor(clamped), behavior: reducedMotion ? 'auto' : 'smooth'});
    },
    [offsetFor, reducedMotion, slideCount]
  );

  const isAtEnd = useCallback(() => {
    const track = trackRef.current;
    if (!track) return false;
    return Math.abs(track.scrollLeft) >= track.scrollWidth - track.clientWidth - 4;
  }, []);

  // Track the visible slide and how many slides fit per view.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      if (first) setPerView(Math.max(1, Math.round(track.clientWidth / first.offsetWidth)));
    };

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (isAtEnd()) {
          setIndex(slideCount - 1);
          return;
        }
        let closest = 0;
        let best = Infinity;
        for (let i = 0; i < slideCount; i++) {
          const distance = Math.abs(offsetFor(i) - track.scrollLeft);
          if (distance < best) {
            best = distance;
            closest = i;
          }
        }
        setIndex(closest);
      });
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);
    track.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      resizeObserver.disconnect();
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [isAtEnd, offsetFor, slideCount]);

  // Respect reduced-motion: no autoplay, no smooth scrolling.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(query.matches);
      if (query.matches) setPlaying(false);
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Autoplay: advance one page at a time, wrap to the start at the end.
  useEffect(() => {
    if (!playing || interacting) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      goTo(isAtEnd() ? 0 : index + perView);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [playing, interacting, index, perView, intervalMs, goTo, isAtEnd]);

  const navButton =
    'btn-fx fx-wipe grid size-12 place-items-center rounded-full border border-navy-900/15 bg-white text-navy-900 shadow-card transition duration-300 [--fx-fill:var(--color-navy-900)] enabled:hover:border-navy-900 enabled:hover:text-gold-300 focus-visible:border-navy-900 focus-visible:text-gold-300 disabled:opacity-40';

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.region}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteracting(false);
      }}
    >
      <div
        ref={trackRef}
        aria-live={playing && !interacting ? 'off' : 'polite'}
        className="no-scrollbar relative -my-6 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain py-6"
      >
        {reviews.map((review, i) => (
          <div
            key={review.name}
            role="group"
            aria-roledescription="slide"
            aria-label={labels.slides[i]}
            className="shrink-0 basis-full snap-start md:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)]"
          >
            <ReviewCard review={review} ratingLabel={labels.rating} />
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          {Array.from({length: pageCount}, (_, page) => (
            <button
              key={page}
              type="button"
              onClick={() => goTo(page * perView)}
              aria-label={labels.pages[page]}
              aria-current={page === currentPage ? 'true' : undefined}
              className="group grid size-6 place-items-center"
            >
              <span
                className={cn(
                  'block h-2 rounded-full transition-all duration-300',
                  page === currentPage ? 'w-7 bg-gold-600' : 'w-2 bg-navy-900/25 group-hover:bg-navy-900/50'
                )}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? labels.pause : labels.play}
            className={navButton}
          >
            {playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
          </button>
          <button type="button" onClick={() => goTo(index - perView)} disabled={index === 0} aria-label={labels.previous} className={navButton}>
            <ChevronLeft aria-hidden className="size-5 rtl:-scale-x-100" />
          </button>
          <button type="button" onClick={() => goTo(index + perView)} disabled={index >= slideCount - 1} aria-label={labels.next} className={navButton}>
            <ChevronRight aria-hidden className="size-5 rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    </section>
  );
}
