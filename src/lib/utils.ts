export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/** Formats numbers with Western digits in both locales so stats and phone numbers stay consistent. */
export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

/** Long date with Western digits (e.g. "28 سبتمبر 2026" / "28 September 2026"). */
export function formatDate(isoDate: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Cairo'
  }).format(new Date(isoDate));
}
