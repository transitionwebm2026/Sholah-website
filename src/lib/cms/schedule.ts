/*
 * Branch visiting hours: parsing, locale-aware formatting and the weekly overview. Pure and
 * deterministic (no Intl), so the build and the browser render the exact same text.
 */
import type {Locale} from '@/i18n/routing';
import type {ScheduleRow} from './types';

/** Schema.org day names in the Egyptian week order (Saturday first). */
export const WEEK = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export type Weekday = (typeof WEEK)[number];

const isWeekday = (day: unknown): day is Weekday => WEEK.includes(day as Weekday);

/** One schedule line: its days in week order, "HH:MM" start (for sorting) and the display time. */
export type SlotView = {days: Weekday[]; opens: string; time: string};

function clock(value: string | undefined): {h: number; m: number} | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec((value ?? '').trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h < 24 && m < 60 ? {h, m} : null;
}

/** Arabic time-of-day words, as Egyptians say them: ٢ ظهرًا، ٤ عصرًا، ٨ مساءً. */
function period(h: number, l: Locale) {
  if (l === 'en') return h < 12 ? 'AM' : 'PM';
  if (h < 12) return 'صباحًا';
  if (h < 15) return 'ظهرًا';
  if (h < 18) return 'عصرًا';
  return 'مساءً';
}

const hhmm = ({h, m}: {h: number; m: number}) => `${h % 12 || 12}:${String(m).padStart(2, '0')}`;

/** "6:00 مساءً", "12:00 – 2:00 ظهرًا", "4:00 PM – 8:00 PM"; '' when `opens` is not a valid time. */
export function formatTime(opens: string | undefined, closes: string | undefined, l: Locale): string {
  const from = clock(opens);
  if (!from) return '';
  const to = clock(closes);
  if (!to) return `${hhmm(from)} ${period(from.h, l)}`;
  const samePeriod = period(from.h, l) === period(to.h, l);
  return samePeriod
    ? `${hhmm(from)} – ${hhmm(to)} ${period(to.h, l)}`
    : `${hhmm(from)} ${period(from.h, l)} – ${hhmm(to)} ${period(to.h, l)}`;
}

export function slots(rows: ScheduleRow[] | null | undefined, l: Locale): SlotView[] {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const from = clock(row?.opens);
      const days = Array.isArray(row?.days) ? row.days.filter(isWeekday) : [];
      return {
        days: WEEK.filter((d) => days.includes(d)),
        opens: from ? `${String(from.h).padStart(2, '0')}:${String(from.m).padStart(2, '0')}` : '',
        time: formatTime(row?.opens, row?.closes, l)
      };
    })
    .filter((s) => s.time);
}

/** Every dated slot of every branch, grouped by weekday and sorted by start time. */
export function weekOverview<B extends {schedule: SlotView[]}>(branches: B[]) {
  return WEEK.map((day) => ({
    day,
    items: branches
      .flatMap((branch) => branch.schedule.filter((s) => s.days.includes(day)).map((slot) => ({branch, slot})))
      .sort((a, b) => a.slot.opens.localeCompare(b.slot.opens))
  }));
}

/** "السبت والاثنين والأربعاء" / "Saturday, Monday & Wednesday". */
export function joinDays(labels: string[], l: Locale): string {
  if (l === 'ar') return labels.join(' و');
  return labels.length < 2 ? labels.join('') : `${labels.slice(0, -1).join(', ')} & ${labels.at(-1)}`;
}

/** Today in Cairo, whatever the visitor's own time zone. Browser only (it differs from build time). */
export function cairoWeekday(): Weekday | null {
  try {
    const day = new Intl.DateTimeFormat('en-US', {weekday: 'long', timeZone: 'Africa/Cairo'}).format(new Date());
    return isWeekday(day) ? day : null;
  } catch {
    return null;
  }
}
