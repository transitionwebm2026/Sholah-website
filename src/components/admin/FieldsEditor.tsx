'use client';

import {ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Trash2} from 'lucide-react';
import {useEffect, useId, useRef, useState} from 'react';
import {CMS_ICONS, CmsIcon} from '@/components/ui/CmsIcon';
import {arOf, emptyL10n, LINK_SUGGESTIONS, WEEKDAYS, type Field} from '@/lib/admin/fields';
import type {L10n} from '@/lib/cms/types';
import {cn} from '@/lib/utils';
import {MediaInput} from './MediaInput';
import {Button, IconButton, Label, Select, TextArea, TextInput, Toggle} from './ui';

type Value = Record<string, unknown>;
/** A new value, or a function of the field's latest value (for updates that finish later, like uploads). */
type Update = unknown | ((previous: unknown) => unknown);
type SetField = (key: string, next: Update) => void;

type Props = {
  fields: Field[];
  value: Value;
  onChange: (value: Value) => void;
};

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

/** Renders a form from a field schema. Values are plain JSON, saved as-is to Supabase. */
export function FieldsEditor({fields, value, onChange}: Props) {
  // Updates merge into the latest value, not the one from the last render: an upload that
  // finishes later (or several updates in one tick) must not undo the edits made meanwhile.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const set: SetField = (key, next) => {
    const previous = latest.current ?? {};
    const resolved = typeof next === 'function' ? (next as (p: unknown) => unknown)(previous[key]) : next;
    const merged = {...previous, [key]: resolved};
    latest.current = merged;
    onChange(merged);
  };

  return (
    <div className="grid gap-5">
      {fields.map((field, i) =>
        field.type === 'heading' ? (
          <div key={`h-${i}`} className="mt-3 border-t border-white/10 pt-5 first:mt-0 first:border-0 first:pt-0">
            <h3 className="font-bold text-gold-300">{field.label}</h3>
            {field.hint && <p className="mt-1 text-xs leading-relaxed text-white/50">{field.hint}</p>}
          </div>
        ) : (
          <FieldControl key={field.key} field={field} value={value?.[field.key]} onSet={set} />
        )
      )}
    </div>
  );
}

function FieldControl({field, value, onSet}: {field: Exclude<Field, {type: 'heading'}>; value: unknown; onSet: SetField}) {
  const id = useId();
  const set = (next: Update) => onSet(field.key, next);
  const required = 'required' in field && field.required;

  switch (field.type) {
    case 'text':
      return (
        <div>
          <Label htmlFor={id} hint={field.hint} required={required}>
            {field.label}
          </Label>
          <TextInput
            id={id}
            dir={field.dir}
            placeholder={field.placeholder}
            value={(value as string) ?? ''}
            onChange={(e) => set(e.target.value)}
          />
        </div>
      );

    case 'textarea':
      return (
        <div>
          <Label htmlFor={id} hint={field.hint}>
            {field.label}
          </Label>
          <TextArea id={id} dir={field.dir} rows={field.rows ?? 4} value={(value as string) ?? ''} onChange={(e) => set(e.target.value)} />
        </div>
      );

    case 'l10n':
      return (
        <L10nInput
          id={id}
          label={field.label}
          hint={field.hint}
          required={required}
          multiline={field.multiline}
          rows={field.rows}
          value={value as L10n | undefined}
          onChange={set}
        />
      );

    case 'number':
      return (
        <div>
          <Label htmlFor={id} hint={field.hint}>
            {field.label}
          </Label>
          <TextInput
            id={id}
            type="number"
            dir="ltr"
            min={field.min}
            max={field.max}
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => set(e.target.value === '' ? null : Number(e.target.value))}
            className="max-w-48"
          />
        </div>
      );

    case 'toggle':
      return (
        <div>
          <Toggle checked={Boolean(value)} onChange={set} label={field.label} />
          {field.hint && <p className="mt-1 ms-14 text-xs text-white/50">{field.hint}</p>}
        </div>
      );

    case 'select':
      return (
        <div>
          <Label htmlFor={id} hint={field.hint}>
            {field.label}
          </Label>
          <Select id={id} value={(value as string) ?? ''} onChange={(e) => set(e.target.value)} className="max-w-sm">
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      );

    case 'icon':
      return (
        <div>
          <Label hint={field.hint}>{field.label}</Label>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={field.label}>
            {Object.entries(CMS_ICONS).map(([name, {label}]) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={value === name}
                title={label}
                aria-label={label}
                onClick={() => set(name)}
                className={cn(
                  'grid size-10 place-items-center rounded-lg border transition',
                  value === name ? 'border-gold-400 bg-gold-400 text-navy-950' : 'border-white/10 text-white/70 hover:border-gold-400/50 hover:text-white'
                )}
              >
                <CmsIcon name={name} className="size-5" />
              </button>
            ))}
          </div>
        </div>
      );

    case 'link':
      return (
        <div>
          <Label htmlFor={id} hint={field.hint ?? 'مسار داخلي مثل /services أو رابط كامل https://… أو whatsapp أو tel'}>
            {field.label}
          </Label>
          <TextInput id={id} dir="ltr" list={`${id}-list`} value={(value as string) ?? ''} onChange={(e) => set(e.target.value.trim())} />
          <datalist id={`${id}-list`}>
            {LINK_SUGGESTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </datalist>
        </div>
      );

    case 'image':
      return (
        <div>
          <Label htmlFor={id} hint={field.hint} required={required}>
            {field.label}
          </Label>
          <MediaInput
            id={id}
            kind="image"
            folder={field.folder}
            maxWidth={field.maxWidth}
            aspect={field.aspect}
            value={(value as string) ?? ''}
            onChange={set}
          />
        </div>
      );

    case 'video':
      return (
        <div>
          <Label htmlFor={id} hint={field.hint} required={required}>
            {field.label}
          </Label>
          <MediaInput
            id={id}
            kind="video"
            folder={field.folder}
            value={(value as string) ?? ''}
            onChange={set}
            onVideoMeta={
              field.durationKey || field.orientationKey
                ? (meta) => {
                    // Fill the sibling fields from the file itself (one update, so nothing is lost).
                    if (field.durationKey) onSet(field.durationKey, meta.duration);
                    if (field.orientationKey) onSet(field.orientationKey, meta.orientation);
                  }
                : undefined
            }
          />
        </div>
      );

    case 'weekdays': {
      const days = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <Label hint={field.hint}>{field.label}</Label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((d) => {
              const on = days.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set(on ? days.filter((x) => x !== d.value) : WEEKDAYS.map((w) => w.value).filter((w) => w === d.value || days.includes(w)))}
                  className={cn(
                    'min-h-9 rounded-lg border px-3 text-sm transition',
                    on ? 'border-gold-400 bg-gold-400 font-semibold text-navy-950' : 'border-white/15 text-white/70 hover:border-gold-400/50'
                  )}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    case 'l10nList': {
      const items = asArray<L10n>(value);
      return (
        <ArrayShell
          label={field.label}
          hint={field.hint}
          count={items.length}
          addLabel={field.addLabel ?? 'إضافة'}
          onAdd={() => set((prev: unknown) => [...asArray<L10n>(prev), emptyL10n()])}
        >
          {items.map((item, i) => (
            <ItemFrame
              key={i}
              index={i}
              count={items.length}
              title={arOf(item) || `عنصر ${i + 1}`}
              onMove={(to) => set((prev: unknown) => move(asArray<L10n>(prev), i, to))}
              onRemove={() => set((prev: unknown) => asArray<L10n>(prev).filter((_, j) => j !== i))}
              defaultOpen
            >
              <L10nInput
                label={`${field.label} ${i + 1}`}
                hideLabel
                multiline={field.multiline}
                value={item}
                onChange={(v) => set((prev: unknown) => asArray<L10n>(prev).map((x, j) => (j === i ? v : x)))}
              />
            </ItemFrame>
          ))}
        </ArrayShell>
      );
    }

    case 'list': {
      const items = asArray<Value>(value);
      return (
        <ArrayShell
          label={field.label}
          hint={field.hint}
          count={items.length}
          addLabel={field.addLabel ?? 'إضافة'}
          onAdd={() => set((prev: unknown) => [...asArray<Value>(prev), field.newItem()])}
        >
          {items.map((item, i) => (
            <ItemFrame
              key={i}
              index={i}
              count={items.length}
              title={field.itemTitle?.(item, i) || `عنصر ${i + 1}`}
              onMove={(to) => set((prev: unknown) => move(asArray<Value>(prev), i, to))}
              onRemove={() => set((prev: unknown) => asArray<Value>(prev).filter((_, j) => j !== i))}
              onDuplicate={() =>
                set((prev: unknown) => {
                  const list = asArray<Value>(prev);
                  return [...list.slice(0, i + 1), structuredClone(list[i]), ...list.slice(i + 1)];
                })
              }
              defaultOpen={!field.itemTitle?.(item, i)}
            >
              <FieldsEditor
                fields={field.fields}
                value={item}
                onChange={(v) => set((prev: unknown) => asArray<Value>(prev).map((x, j) => (j === i ? v : x)))}
              />
            </ItemFrame>
          ))}
        </ArrayShell>
      );
    }

    case 'group':
      return (
        <fieldset className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <legend className="px-2 text-sm font-bold text-gold-300">{field.label}</legend>
          {field.hint && <p className="mb-4 text-xs text-white/50">{field.hint}</p>}
          <FieldsEditor fields={field.fields} value={(value as Value) ?? {}} onChange={set} />
        </fieldset>
      );

    default:
      return null;
  }
}

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Arabic + English inputs side by side (stacked on phones). */
export function L10nInput({
  id,
  label,
  hint,
  required,
  multiline,
  rows,
  hideLabel,
  value,
  onChange
}: {
  id?: string;
  label: string;
  hint?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  hideLabel?: boolean;
  value: L10n | undefined;
  onChange: (value: L10n) => void;
}) {
  const auto = useId();
  const base = id ?? auto;
  const v = value ?? emptyL10n();
  const Input = multiline ? TextArea : TextInput;

  return (
    <div>
      {!hideLabel && (
        <Label htmlFor={`${base}-ar`} hint={hint} required={required}>
          {label}
        </Label>
      )}
      <div className="grid gap-2 md:grid-cols-2">
        {(['ar', 'en'] as const).map((lang) => (
          <div key={lang} className="relative">
            <span className="pointer-events-none absolute top-2 end-2 z-10 rounded bg-white/10 px-1.5 text-[0.65rem] font-bold text-white/60">
              {lang === 'ar' ? 'عربي' : 'EN'}
            </span>
            <Input
              id={`${base}-${lang}`}
              aria-label={`${label} (${lang === 'ar' ? 'عربي' : 'English'})`}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              lang={lang}
              rows={multiline ? (rows ?? 3) : undefined}
              value={v[lang] ?? ''}
              onChange={(e) => onChange({...v, [lang]: e.target.value})}
              className={cn('pe-12', lang === 'en' && 'font-[system-ui]')}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrayShell({
  label,
  hint,
  count,
  addLabel,
  onAdd,
  children
}: {
  label: string;
  hint?: string;
  count: number;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <Label hint={hint}>
          {label} <span className="font-normal text-white/40">({count})</span>
        </Label>
      </div>
      <div className="space-y-2">{children}</div>
      <Button size="sm" variant="secondary" onClick={onAdd} className="mt-2">
        <Plus aria-hidden className="size-4" />
        {addLabel}
      </Button>
    </div>
  );
}

function ItemFrame({
  index,
  count,
  title,
  onMove,
  onRemove,
  onDuplicate,
  defaultOpen,
  children
}: {
  index: number;
  count: number;
  title: string;
  onMove: (to: number) => void;
  onRemove: () => void;
  onDuplicate?: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className="rounded-xl border border-white/10 bg-navy-950/40">
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-h-9 flex-1 items-center gap-2 rounded-lg px-2 text-start text-sm font-semibold hover:bg-white/5"
        >
          <ChevronDown aria-hidden className={cn('size-4 shrink-0 text-gold-400 transition', !open && '-rotate-90 rtl:rotate-90')} />
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs">{index + 1}</span>
          <span className="truncate">{title}</span>
        </button>
        <IconButton label="تحريك لأعلى" disabled={index === 0} onClick={() => onMove(index - 1)}>
          <ArrowUp aria-hidden className="size-4" />
        </IconButton>
        <IconButton label="تحريك لأسفل" disabled={index === count - 1} onClick={() => onMove(index + 1)}>
          <ArrowDown aria-hidden className="size-4" />
        </IconButton>
        {onDuplicate && (
          <IconButton label="تكرار" onClick={onDuplicate}>
            <Copy aria-hidden className="size-4" />
          </IconButton>
        )}
        <IconButton
          label="حذف"
          onClick={() => {
            if (window.confirm('حذف هذا العنصر؟')) onRemove();
          }}
          className="hover:bg-red-500/20 hover:text-red-200"
        >
          <Trash2 aria-hidden className="size-4" />
        </IconButton>
      </div>
      {open && <div className="border-t border-white/10 p-4">{children}</div>}
    </div>
  );
}
