'use client';

import {useEffect, useRef, useState} from 'react';
import {formatNumber} from '@/lib/utils';

type Props = {
  value: number;
  suffix?: string;
  durationMs?: number;
};

/**
 * Counts up from 0 when scrolled into view. The final value is rendered on the server
 * (crawlers and no-JS users see the real number), and a screen-reader-only copy keeps
 * assistive tech from announcing every intermediate frame.
 */
export function Counter({value, suffix = '+', durationMs = 2000}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let firstCallback = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (firstCallback) {
          firstCallback = false;
          // Already visible on load: keep the server-rendered value instead of flashing to 0.
          if (entry.isIntersecting) {
            observer.disconnect();
            return;
          }
          setDisplay(0);
          return;
        }
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      {threshold: 0.35}
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} dir="ltr" className="inline-block tabular-nums">
      <span aria-hidden>
        {formatNumber(display)}
        {suffix}
      </span>
      <span className="sr-only">
        {formatNumber(value)}
        {suffix}
      </span>
    </span>
  );
}
