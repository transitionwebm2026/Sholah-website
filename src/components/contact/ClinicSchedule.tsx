'use client';

import {CalendarCheck, Clock, MapPin, Navigation, PhoneCall} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useSyncExternalStore} from 'react';
import {Container} from '@/components/ui/Container';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {cairoWeekday, weekOverview, type SlotView, type Weekday} from '@/lib/cms/schedule';
import type {BranchView, HeadingView} from '@/lib/cms/views';
import {telHref} from '@/lib/site';
import {cn} from '@/lib/utils';

type Props = {
  branches: BranchView[];
  heading: HeadingView;
  /** Phone for branches without their own (emergency / by-arrangement "call" button). */
  phone?: string;
  /** "Book at this location": the page scrolls to the form with this branch picked. */
  onBook: (branchId: string) => void;
};

const noopSubscribe = () => () => {};

/** Cairo's weekday after hydration; null in the static HTML, which is built on another day. */
function useToday() {
  return useSyncExternalStore(noopSubscribe, cairoWeekday, () => null);
}

const anchorOf = (id: string) => `clinic-${id}`;

/**
 * "Where & when": the week at a glance (every branch's visiting times per day, today
 * highlighted), then one card per location with its address, schedule, map and actions.
 */
export function ClinicSchedule({branches, heading, phone, onBook}: Props) {
  const t = useTranslations('Contact');
  const tDays = useTranslations('Common.weekdays');
  const today = useToday();

  const week = weekOverview(branches);
  const hasWeek = week.some((d) => d.items.length > 0);
  // The main clinic (first branch) gets a wide card beside its map; the rest share a grid.
  const [first, ...rest] = branches;
  const featured = first?.mapEmbedUrl ? first : null;
  const others = featured ? rest : branches;

  const cardProps = {phone, onBook, dayLabel: (d: Weekday) => tDays(d)};

  return (
    <Section id="schedule" labelledBy="schedule-title" tone="brand">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-50" />
      <Container>
        <SectionHeading
          id="schedule-title"
          eyebrow={heading.eyebrow || t('schedule.eyebrow')}
          title={heading.title || t('schedule.title')}
          description={heading.description || t('schedule.description')}
        />

        {hasWeek && (
          <>
            <h3 className="sr-only">{t('schedule.week')}</h3>
            <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {week.map(({day, items}) => {
                const isToday = today === day;
                return (
                  <li
                    key={day}
                    data-reveal
                    aria-current={isToday ? 'date' : undefined}
                    className={cn(
                      'flex flex-col rounded-3xl border p-4 transition-colors',
                      isToday
                        ? 'border-gold-400/70 bg-gold-400/[0.09] shadow-gold'
                        : items.length
                          ? 'border-white/10 bg-white/[0.05]'
                          : 'border-white/5 bg-white/[0.02]'
                    )}
                  >
                    <p className="flex min-h-7 items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <span className={cn('font-bold', items.length ? 'text-gold-300' : 'text-white/45')}>{tDays(day)}</span>
                      {isToday && (
                        <span className="rounded-full bg-gold-400 px-2.5 py-0.5 text-xs font-bold text-navy-950">{t('schedule.today')}</span>
                      )}
                    </p>
                    {items.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {items.map(({branch, slot}) => (
                          <li key={`${branch.id}-${slot.opens}`}>
                            <a
                              href={`#${anchorOf(branch.id)}`}
                              className="group -mx-2 block rounded-2xl px-2 py-2 transition-colors hover:bg-white/[0.07] focus-visible:bg-white/[0.07]"
                            >
                              <span className="flex items-center gap-1.5 font-bold text-white">
                                <Clock aria-hidden className="size-3.5 shrink-0 text-gold-400" />
                                {slot.time}
                              </span>
                              <span className="mt-0.5 block text-sm leading-snug text-white/70 transition-colors group-hover:text-gold-200">
                                {branch.name}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-white/45">{t('schedule.noSlots')}</p>
                    )}
                  </li>
                );
              })}
            </ol>
          </>
        )}

        <h3 data-reveal="up" className="mt-20 text-center text-2xl font-bold sm:text-3xl">
          {t('schedule.places')}
        </h3>

        {featured && <BranchCard branch={featured} featured {...cardProps} />}

        {others.length > 0 && (
          // Flex-wrap rather than grid, so a short last row stays centred.
          <ul className="mt-8 flex flex-wrap justify-center gap-6">
            {others.map((branch) => (
              <li key={branch.id} className="flex w-full md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
                <BranchCard branch={branch} {...cardProps} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}

type CardProps = {
  branch: BranchView;
  featured?: boolean;
  phone?: string;
  onBook: (branchId: string) => void;
  dayLabel: (day: Weekday) => string;
};

function BranchCard({branch, featured, phone, onBook, dayLabel}: CardProps) {
  const t = useTranslations('Contact');
  const tCommon = useTranslations('Common');
  const callNumber = branch.phone || phone;
  const hasSchedule = branch.schedule.length > 0;
  // In the narrower cards both buttons share the row evenly, or each takes a full row when they wrap.
  const fit = featured ? '' : 'grow justify-center whitespace-nowrap';

  const map = branch.mapEmbedUrl && (
    <iframe
      src={branch.mapEmbedUrl}
      title={t('info.mapTitle', {clinic: branch.name})}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cn('w-full border-0', featured ? 'aspect-[4/3] lg:col-span-7 lg:aspect-auto lg:h-full lg:min-h-[26rem]' : 'aspect-[16/10]')}
    />
  );

  return (
    <article
      id={anchorOf(branch.id)}
      data-reveal
      className={cn(
        'fx-glow w-full overflow-hidden rounded-[2rem] border bg-navy-950/70 shadow-luxe transition-colors hover:border-gold-400/40',
        featured ? 'mt-8 grid border-gold-400/30 lg:grid-cols-12' : 'flex flex-col border-white/10'
      )}
    >
      {!featured && map}
      <div className={cn('flex flex-1 flex-col p-6', featured && 'sm:p-8 lg:col-span-5 lg:p-10')}>
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold-400/15 text-gold-300">
            <MapPin aria-hidden className="size-6" />
          </span>
          <div className="min-w-0">
            <h4 className={cn('leading-snug font-bold', featured ? 'text-2xl' : 'text-lg')}>{branch.name}</h4>
            {branch.note && (
              <p className="mt-2 inline-flex rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs font-semibold text-gold-200">
                {branch.note}
              </p>
            )}
          </div>
        </div>

        {branch.address && <p className="mt-5 leading-relaxed text-white/80">{branch.address}</p>}

        {hasSchedule ? (
          <ScheduleLines slots={branch.schedule} dayLabel={dayLabel} className="mt-5" />
        ) : (
          <p className="mt-5 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/80">
            <PhoneCall aria-hidden className="size-4 shrink-0 text-gold-400" />
            {t('schedule.byArrangement')}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          {hasSchedule ? (
            <a
              href="#booking"
              onClick={() => onBook(branch.id)}
              className={cn('btn-fx fx-shine inline-flex min-h-11 items-center gap-2 rounded-full bg-linear-to-r from-gold-500 to-gold-300 px-5 text-sm font-bold text-navy-950 shadow-gold transition duration-300 motion-safe:hover:-translate-y-0.5 rtl:bg-linear-to-l', fit)}
            >
              <CalendarCheck aria-hidden className="size-4" />
              {t('schedule.book')}
            </a>
          ) : (
            callNumber && (
              <a
                href={telHref(callNumber)}
                className={cn('btn-fx fx-shine inline-flex min-h-11 items-center gap-2 rounded-full bg-linear-to-r from-gold-500 to-gold-300 px-5 text-sm font-bold text-navy-950 shadow-gold transition duration-300 motion-safe:hover:-translate-y-0.5 rtl:bg-linear-to-l', fit)}
              >
                <PhoneCall aria-hidden className="size-4" />
                {tCommon('callNow')}
              </a>
            )
          )}
          {branch.directionsUrl && (
            <a
              href={branch.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('btn-fx fx-wipe inline-flex min-h-11 items-center gap-2 rounded-full border border-gold-400/40 px-5 text-sm font-semibold text-gold-300 transition duration-300 hover:border-gold-400 hover:text-navy-950 focus-visible:text-navy-950', fit)}
            >
              <Navigation aria-hidden className="fx-wiggle size-4" />
              {t('info.directions')}
            </a>
          )}
        </div>
      </div>
      {featured && map}
    </article>
  );
}

/** One row per schedule line: its days as chips (or a clock when days are not fixed) and the time. */
export function ScheduleLines({slots, dayLabel, className}: {slots: SlotView[]; dayLabel: (day: Weekday) => string; className?: string}) {
  return (
    <ul className={cn('divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] px-4', className)}>
      {slots.map((slot, i) => (
        <li key={i} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
          <span className="flex flex-wrap gap-1.5">
            {slot.days.length > 0 ? (
              slot.days.map((day) => (
                <span key={day} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                  {dayLabel(day)}
                </span>
              ))
            ) : (
              <Clock aria-hidden className="size-4 text-gold-400" />
            )}
          </span>
          <span className="font-bold text-gold-200">{slot.time}</span>
        </li>
      ))}
    </ul>
  );
}
