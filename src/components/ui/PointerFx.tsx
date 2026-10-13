'use client';

import {useEffect} from 'react';

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * Feeds the pointer position to `.fx-card` / `.fx-glow` elements as `--fx-x` / `--fx-y` (0..1);
 * globals.css turns those into the spotlight, edge light, tilt and parallax. One delegated,
 * rAF-throttled listener for the whole page, and nothing at all on touch-only devices.
 */
export function PointerFx() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    let x = -1;
    let y = -1;

    const update = () => {
      frame = 0;
      if (x < 0) return;
      const card = document.elementFromPoint(x, y)?.closest<HTMLElement>('.fx-card, .fx-glow');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--fx-x', clamp((x - rect.left) / rect.width).toFixed(3));
      card.style.setProperty('--fx-y', clamp((y - rect.top) / rect.height).toFixed(3));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      x = event.clientX;
      y = event.clientY;
      schedule();
    };

    document.addEventListener('pointermove', onMove, {passive: true});
    // Content scrolls under a resting cursor: keep the light where the pointer is.
    window.addEventListener('scroll', schedule, {passive: true});
    return () => {
      document.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
