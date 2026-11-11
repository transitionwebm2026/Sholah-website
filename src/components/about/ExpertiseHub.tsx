'use client';

import {useTranslations} from 'next-intl';
import {useEffect, useState} from 'react';
import {CmsImage} from '@/components/ui/CmsImage';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Link} from '@/i18n/navigation';
import type {AboutViewData} from '@/lib/cms/views';
import {cn} from '@/lib/utils';

type Item = AboutViewData['expertise']['items'][number];
type Side = 'start' | 'end';

const pad = (n: number) => String(n).padStart(2, '0');
const CYCLE_MS = 3200;

/**
 * The specialties of /services arranged around the doctor: his photo in a ringed circle at the
 * centre, half of the cards on each side. The circle cycles through the specialties' pictures and
 * lights up the matching card; pointing at (or tabbing to) a card holds it on that one. Each card
 * opens its section on the Services page. Below `xl` the circle sits above the cards.
 */
export function ExpertiseHub({items, photo, caption}: {items: Item[]; photo: string | null; caption: string}) {
  const t = useTranslations('About');
  const [hovered, setHovered] = useState<number | null>(null);
  // 0 = the doctor, 1…n = the specialties.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (hovered !== null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setTick((x) => (x + 1) % (items.length + 1)), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [hovered, items.length]);

  const shown = hovered !== null ? hovered + 1 : tick;
  const layers = [{src: photo ?? items[0]?.image ?? null, top: true}, ...items.map((item) => ({src: item.image, top: false}))];
  const label = shown > 0 ? items[shown - 1]?.title : caption;
  const half = Math.ceil(items.length / 2);

  const card = (item: Item, i: number, side: Side) => {
    const on = shown === i + 1;
    return (
      <li
        key={item.slug}
        data-reveal
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setHovered(i);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setHovered(null);
        }}
        onFocus={() => setHovered(i)}
        onBlur={() => setHovered(null)}
      >
        <article
          className={cn(
            'fx-card group relative flex h-full flex-col rounded-3xl bg-white p-7 shadow-card ring-1 hover:shadow-luxe',
            on ? 'ring-gold-400/70' : 'ring-navy-900/5'
          )}
        >
          <span
            aria-hidden
            className={cn(
              'absolute end-6 top-5 text-6xl leading-none font-bold tabular-nums transition-colors duration-500',
              on ? 'text-gold-400/60' : 'text-navy-900/[0.07]'
            )}
          >
            {pad(i + 1)}
          </span>
          <span
            aria-hidden
            className={cn('block h-1 rounded-full bg-linear-to-r from-gold-500 to-gold-300 transition-[width] duration-500', on ? 'w-16' : 'w-10')}
          />
          <h3 className="mt-5 pe-16 text-xl leading-snug font-bold text-balance text-navy-900">
            <Link href={item.href} className="after:absolute after:inset-0 after:rounded-3xl">
              {item.title}
            </Link>
          </h3>
          {item.summary && <p className="mt-3 flex-1 leading-relaxed text-slate-600">{item.summary}</p>}
          <span aria-hidden className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold-700">
            {t('expertise.explore')}
            <DirectionalArrow />
          </span>
          {/* Anchor on the edge facing the circle (wide screens). */}
          <span
            aria-hidden
            className={cn(
              'absolute top-1/2 hidden size-3.5 -translate-y-1/2 rounded-full ring-4 ring-ivory transition duration-500 xl:block',
              side === 'start' ? '-end-[0.4375rem]' : '-start-[0.4375rem]',
              on ? 'scale-125 bg-gold-400 shadow-gold' : 'bg-navy-900/15'
            )}
          />
        </article>
      </li>
    );
  };

  return (
    <div className="mt-16 grid items-center gap-6 sm:grid-cols-2 xl:grid-cols-[1fr_auto_1fr] xl:gap-14">
      <ul className="grid gap-6 xl:gap-8">{items.slice(0, half).map((item, k) => card(item, k, 'start'))}</ul>

      <div
        aria-hidden
        data-reveal="zoom"
        className="relative order-first mx-auto mb-8 grid size-72 place-items-center sm:col-span-2 sm:size-80 xl:order-none xl:col-span-1 xl:mb-0 xl:size-96"
      >
        <span className="absolute inset-[8%] rounded-full bg-gold-400/25 blur-3xl" />
        <span className="absolute inset-0 rounded-full border border-dashed border-gold-500/50 motion-safe:animate-[spin_60s_linear_infinite]" />
        <span className="absolute inset-[7%] rounded-full border border-navy-900/10 motion-safe:animate-[spin_18s_linear_infinite_reverse]">
          <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-gold-400 shadow-gold" />
          <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-navy-700" />
        </span>

        <div className="relative size-[76%] overflow-hidden rounded-full bg-navy-900 shadow-luxe ring-8 ring-white">
          {layers.map((layer, k) => (
            <div
              key={k}
              className={cn(
                'absolute inset-0 transition duration-700 ease-out motion-reduce:transition-none',
                shown === k ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
              )}
            >
              <CmsImage src={layer.src} sizes="(min-width: 1280px) 292px, (min-width: 640px) 244px, 219px" className={cn('object-cover', layer.top && 'object-top')} />
            </div>
          ))}
        </div>

        {label && (
          <span className="absolute inset-x-0 -bottom-5 mx-auto w-fit max-w-[92%] rounded-full bg-navy-900 px-5 py-2 text-center text-sm font-semibold text-gold-200 shadow-card">
            <span key={label} className="block motion-safe:animate-[fx-reveal_0.6s_cubic-bezier(0.16,1,0.3,1)]">
              {label}
            </span>
          </span>
        )}
      </div>

      <ul className="grid gap-6 xl:gap-8">{items.slice(half).map((item, k) => card(item, half + k, 'end'))}</ul>
    </div>
  );
}
