'use client';

import {ChevronLeft, ChevronRight} from 'lucide-react';
import {useId, useRef, useState, type KeyboardEvent} from 'react';
import type {Step} from '@/lib/types';
import {cn} from '@/lib/utils';

type Props = {
  steps: Step[];
  labels: {
    tablist: string;
    /** "Step 1", "Step 2", … */
    steps: string[];
    next: string;
    previous: string;
  };
};

/**
 * Interactive timeline implemented as an accessible tabs widget (roving tabindex,
 * RTL-aware arrow keys, Home/End). Every step's content is in the server-rendered HTML.
 */
export function PatientJourney({steps, labels}: Props) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();
  const count = steps.length;

  function select(i: number, focus = false) {
    const next = (i + count) % count;
    setActive(next);
    if (focus) tabRefs.current[next]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forward) select(active + 1, true);
    else if (event.key === backward) select(active - 1, true);
    else if (event.key === 'Home') select(0, true);
    else if (event.key === 'End') select(count - 1, true);
    else return;
    event.preventDefault();
  }

  const progress = count > 1 ? (active / (count - 1)) * 100 : 100;

  return (
    <div>
      <div className="relative">
        {/* Track + progress fill, from the centre of the first step to the centre of the last. */}
        <div aria-hidden className="absolute inset-x-[10%] top-7 h-0.5 rounded-full bg-white/15">
          <div
            className="absolute inset-y-0 start-0 rounded-full bg-linear-to-r from-gold-500 to-gold-300 transition-[width] duration-500 ease-out"
            style={{width: `${progress}%`}}
          />
        </div>

        <div role="tablist" aria-label={labels.tablist} className="relative grid" style={{gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`}}>
          {steps.map((step, i) => {
            const selected = i === active;
            const done = i < active;
            return (
              <button
                key={step.title}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`${baseId}-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${i}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={handleKeyDown}
                className="group flex flex-col items-center gap-4 rounded-2xl px-1 pb-2 text-center focus-visible:outline-offset-2"
              >
                <span
                  className={cn(
                    'grid size-14 place-items-center rounded-full border-2 text-lg font-bold tabular-nums transition duration-300',
                    selected
                      ? 'scale-110 border-gold-400 bg-gold-400 text-navy-950 shadow-gold'
                      : done
                        ? 'border-gold-400 bg-navy-900 text-gold-300'
                        : 'border-white/25 bg-navy-900 text-white/70 group-hover:border-gold-400/70'
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    'hidden text-sm leading-snug font-semibold transition-colors md:block',
                    selected ? 'text-gold-300' : 'text-white/70 group-hover:text-white'
                  )}
                >
                  {step.title}
                </span>
                <span className="sr-only md:hidden">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {steps.map((step, i) => (
        <div
          key={step.title}
          id={`${baseId}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active}
          tabIndex={0}
          className="fx-panel mt-10 rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-luxe sm:p-10"
        >
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
            <span aria-hidden className="fx-num text-gold-gradient text-7xl leading-none font-bold tabular-nums sm:text-8xl">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="text-sm font-semibold text-gold-400">{labels.steps[i]}</p>
              <h3 className="mt-2 text-2xl font-bold sm:text-3xl">{step.title}</h3>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">{step.description}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-between gap-4 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => select(i - 1)}
              disabled={i === 0}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white/80 transition hover:text-gold-300 disabled:invisible"
            >
              <ChevronLeft aria-hidden className="size-4 rtl:-scale-x-100" />
              {labels.previous}
            </button>
            <button
              type="button"
              onClick={() => select(i + 1)}
              disabled={i === count - 1}
              className="btn-fx fx-wipe inline-flex min-h-11 items-center gap-2 rounded-full border border-gold-400/40 px-5 text-sm font-semibold text-gold-300 transition duration-300 hover:border-gold-400 hover:text-navy-950 focus-visible:text-navy-950 disabled:invisible"
            >
              {labels.next}
              <ChevronRight aria-hidden className="fx-arrow size-4 rtl:-scale-x-100" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
