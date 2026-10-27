/*
 * Declarative form schemas for the dashboard. Every editor (settings, home page, doctor,
 * services, videos, reviews…) is a list of fields rendered by <FieldsEditor>, so adding a
 * field to the site means adding one line here and one in the view model.
 */
import type {L10n} from '@/lib/cms/types';

type Base = {key: string; label: string; hint?: string};

export type Field =
  | (Base & {type: 'text'; required?: boolean; dir?: 'ltr' | 'rtl'; placeholder?: string; pattern?: RegExp; patternMessage?: string})
  | (Base & {type: 'textarea'; rows?: number; dir?: 'ltr' | 'rtl'})
  /** Arabic + English inputs side by side. `required` means Arabic is required. */
  | (Base & {type: 'l10n'; required?: boolean; multiline?: boolean; rows?: number})
  | (Base & {type: 'number'; min?: number; max?: number})
  | (Base & {type: 'toggle'})
  | (Base & {type: 'select'; options: Array<{value: string; label: string}>})
  | (Base & {type: 'icon'})
  /** A site path, an anchor, `whatsapp`, `tel` or a URL. */
  | (Base & {type: 'link'})
  | (Base & {type: 'image'; folder: string; maxWidth?: number; required?: boolean; aspect?: string})
  /** Uploaded video file or a pasted YouTube / .mp4 link. Can fill sibling duration/orientation fields. */
  | (Base & {type: 'video'; folder: string; durationKey?: string; orientationKey?: string; required?: boolean})
  | (Base & {type: 'weekdays'})
  /** Slugs of specialties from `surgeries_services`, kept in their Services-page order. */
  | (Base & {type: 'services'})
  /** A list of translatable strings (paragraphs, bullet points). */
  | (Base & {type: 'l10nList'; multiline?: boolean; addLabel?: string})
  /** A list of objects (steps, links, cards…), each edited with `fields`. */
  | (Base & {
      type: 'list';
      fields: Field[];
      newItem: () => Record<string, unknown>;
      itemTitle?: (item: Record<string, unknown>, index: number) => string;
      addLabel?: string;
    })
  /** A nested object edited inline. */
  | (Base & {type: 'group'; fields: Field[]})
  /** Visual separator inside a form. */
  | {type: 'heading'; key?: undefined; label: string; hint?: string};

export const emptyL10n = (): L10n => ({ar: '', en: ''});

/** Arabic text of a localized value (falls back to English) for list titles. */
export function arOf(value: unknown): string {
  const v = value as Partial<L10n> | undefined;
  return (v?.ar || v?.en || '').trim();
}

function isEmpty(value: unknown, type: Field['type']) {
  if (type === 'l10n') return !arOf(value);
  return value === undefined || value === null || String(value).trim() === '';
}

/** Lists the labels of missing required fields and invalid values, recursing into groups and lists. */
export function validate(fields: Field[], value: Record<string, unknown>, trail = ''): string[] {
  const problems: string[] = [];
  for (const field of fields) {
    if (field.type === 'heading') continue;
    const v = value?.[field.key];
    const name = trail ? `${trail} ← ${field.label}` : field.label;
    if ('required' in field && field.required && isEmpty(v, field.type)) problems.push(`«${name}» مطلوب`);
    if (field.type === 'text' && field.pattern && typeof v === 'string' && v && !field.pattern.test(v)) {
      problems.push(field.patternMessage ?? `«${name}» غير صالح`);
    }
    if (field.type === 'group') problems.push(...validate(field.fields, (v ?? {}) as Record<string, unknown>, name));
    if (field.type === 'list' && Array.isArray(v)) {
      v.forEach((item, i) => problems.push(...validate(field.fields, item as Record<string, unknown>, `${name} ${i + 1}`)));
    }
  }
  return problems;
}

export const WEEKDAYS = [
  {value: 'Saturday', label: 'السبت'},
  {value: 'Sunday', label: 'الأحد'},
  {value: 'Monday', label: 'الاثنين'},
  {value: 'Tuesday', label: 'الثلاثاء'},
  {value: 'Wednesday', label: 'الأربعاء'},
  {value: 'Thursday', label: 'الخميس'},
  {value: 'Friday', label: 'الجمعة'}
];

/** Suggestions for link fields. */
export const LINK_SUGGESTIONS = [
  {value: '/', label: 'الرئيسية'},
  {value: '/about', label: 'عن الدكتور'},
  {value: '/services', label: 'الخدمات'},
  {value: '/reviews', label: 'آراء المرضى'},
  {value: '/videos', label: 'الفيديوهات'},
  {value: '/articles', label: 'المقالات'},
  {value: '/contact', label: 'تواصل / حجز'},
  {value: '#booking', label: 'نموذج الحجز (في صفحة التواصل)'},
  {value: 'whatsapp', label: 'واتساب (الرقم من الإعدادات)'},
  {value: 'tel', label: 'اتصال (أول رقم في الإعدادات)'}
];

/** URL-safe slug from (usually English) text. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
