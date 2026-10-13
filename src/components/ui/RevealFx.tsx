'use client';

import {useEffect} from 'react';

const SELECTOR = '[data-reveal]';
const STAGGER_MS = 110;
const MAX_STAGGER = 5;

/**
 * Where an element arrives from. Explicit presets (`data-reveal="up" | "zoom" | "pop"`) win;
 * otherwise it is measured against the nearest wider ancestor (its grid/row): the start third
 * slides in from the left, the end third from the right, the middle rises from below. So a
 * 3-column row reads left / up / right, 2 columns left / right, and one column always rises.
 */
function directionOf(el: HTMLElement) {
  // A bare `data-reveal` in JSX renders as "true": that means auto.
  const preset = el.dataset.reveal;
  if (preset && preset !== 'true') return preset;

  const box = el.getBoundingClientRect();
  let left = 0;
  let width = window.innerWidth;
  for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
    const rect = parent.getBoundingClientRect();
    if (rect.width > box.width * 1.3) {
      left = rect.left;
      width = rect.width;
      break;
    }
  }

  const center = (box.left + box.width / 2 - left) / width;
  return center < 0.36 ? 'left' : center > 0.64 ? 'right' : 'up';
}

/**
 * Scroll reveal for `[data-reveal]` elements (styles in globals.css). Only elements that start
 * below the fold are hidden, and only once JS runs, so server HTML, crawlers and no-JS visitors
 * always see everything. Elements arriving together are staggered in reading order. Watches the
 * DOM so client-side navigations get the same treatment.
 */
export function RevealFx() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

        // Measure everything first, then write, to avoid layout thrashing.
        const directions = arriving.map(directionOf);
        arriving.forEach((el, i) => {
          io.unobserve(el);
          el.dataset.revealDir = directions[i];
          el.style.setProperty('--reveal-delay', `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`);
          el.dataset.revealState = 'in';
        });
      },
      {rootMargin: '0px 0px -8% 0px'}
    );

    const register = (root: Element | Document) => {
      const found = [...root.querySelectorAll<HTMLElement>(SELECTOR)];
      if (root instanceof HTMLElement && root.matches(SELECTOR)) found.unshift(root);
      const fresh = found.filter((el) => !el.dataset.revealState);
      const tops = fresh.map((el) => el.getBoundingClientRect().top);

      fresh.forEach((el, i) => {
        // Already on screen (or scrolled past): leave it exactly as rendered, no flash.
        if (tops[i] < window.innerHeight) {
          el.dataset.revealState = 'done';
          return;
        }
        el.dataset.revealState = 'pending';
        io.observe(el);
      });
    };

    register(document);

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) register(node);
        });
      }
    });
    mo.observe(document.body, {childList: true, subtree: true});

    return () => {
      io.disconnect();
      mo.disconnect();
      // Never leave anything hidden without an observer to bring it back (remounts, Strict Mode).
      document.querySelectorAll<HTMLElement>('[data-reveal-state="pending"]').forEach((el) => {
        delete el.dataset.revealState;
      });
    };
  }, []);

  return null;
}
