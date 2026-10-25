'use client';

import {ChevronDown, CircleCheck, Clock, Lock} from 'lucide-react';
import {useLocale} from 'next-intl';
import {useId, useRef, useState, type ComponentProps, type FormEvent, type ReactNode} from 'react';
import {cmsConfigured, restInsert} from '@/lib/cms/rest';
import {cn} from '@/lib/utils';
import {WhatsAppIcon} from '../ui/Icons';

type Option = {value: string; label: string};

export type ContactFormLabels = {
  description: string;
  name: string;
  namePlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  age: string;
  requestType: string;
  service: string;
  clinic: string;
  message: string;
  messagePlaceholder: string;
  optional: string;
  submit: string;
  privacy: string;
  success: string;
  errors: {name: string; phone: string};
  whatsapp: {heading: string; footer: string};
};

type Props = {
  /** id of the visible heading that names the form (rendered by the page, above the card). */
  labelledBy: string;
  labels: ContactFormLabels;
  requestTypes: Option[];
  services: Option[];
  clinics: Option[];
  whatsappNumber: string;
  className?: string;
};

type Values = {
  name: string;
  phone: string;
  age: string;
  requestType: string;
  service: string;
  clinic: string;
  message: string;
};

type FieldErrors = Partial<Record<'name' | 'phone', string>>;

const inputClass =
  'w-full rounded-2xl border border-white/15 bg-navy-950/40 px-4 py-3.5 text-base text-white placeholder:text-white/40 transition hover:border-white/25 focus:border-gold-400 focus:outline-none focus:ring-4 focus:ring-gold-400/15 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-400/15 [&_option]:bg-navy-900 [&_option]:text-white';

/**
 * Booking form: validates input, saves the request to the dashboard (Consultation leads) and
 * opens WhatsApp with a structured message in the active language pre-filled.
 * Styled as a glass card to match the contact info cards beside it, and stretches to their height.
 */
export function ContactForm({labelledBy, labels, requestTypes, services, clinics, whatsappNumber, className}: Props) {
  const locale = useLocale();
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  // Honeypot: invisible to people, often filled in by spam bots.
  const trapRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState<Values>({
    name: '',
    phone: '',
    age: '',
    requestType: requestTypes[0]?.value ?? '',
    service: '',
    clinic: clinics[0]?.value ?? '',
    message: ''
  });

  const set = (field: keyof Values) => (event: {target: {value: string}}) => {
    setValues((v) => ({...v, [field]: event.target.value}));
    if (field in errors) setErrors((e) => ({...e, [field]: undefined}));
    setSent(false);
  };

  function validate(v: Values): FieldErrors {
    const next: FieldErrors = {};
    if (v.name.trim().length < 3) next.name = labels.errors.name;
    const digits = v.phone.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) next.phone = labels.errors.phone;
    return next;
  }

  function buildMessage(v: Values) {
    const labelOf = (options: Option[], value: string) => options.find((o) => o.value === value)?.label ?? '';
    // Optional fields resolve to null when empty; '' entries are intentional blank lines.
    const lines: Array<string | null> = [
      `*${labels.whatsapp.heading}*`,
      '',
      `• ${labels.name}: ${v.name.trim()}`,
      `• ${labels.phone}: ${v.phone.trim()}`,
      v.age ? `• ${labels.age}: ${v.age}` : null,
      `• ${labels.requestType}: ${labelOf(requestTypes, v.requestType)}`,
      `• ${labels.service}: ${labelOf(services, v.service)}`,
      `• ${labels.clinic}: ${labelOf(clinics, v.clinic)}`,
      v.message.trim() ? `• ${labels.message}: ${v.message.trim()}` : null,
      '',
      `_${labels.whatsapp.footer}_`
    ];
    return lines.filter((line) => line !== null).join('\n');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    const firstInvalid = (['name', 'phone'] as const).find((f) => found[f]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    if (trapRef.current?.value) {
      setSent(true);
      return;
    }

    // Save first (async, never blocks), then open WhatsApp synchronously so pop-up blockers allow it.
    saveLead(values);
    if (whatsappNumber) {
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildMessage(values))}`;
      const win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.assign(url); // Pop-up blocked: open WhatsApp in the same tab.
    }
    setSent(true);
  }

  function saveLead(v: Values) {
    if (!cmsConfigured) return;
    const labelOf = (options: Option[], value: string) => options.find((o) => o.value === value)?.label || null;
    const age = Number.parseInt(v.age, 10);
    restInsert('consultation_leads', {
      name: v.name.trim(),
      phone: v.phone.replace(/[^\d+]/g, ''),
      age: age >= 1 && age <= 120 ? age : null,
      request_type: labelOf(requestTypes, v.requestType),
      service: v.service ? labelOf(services, v.service) : null,
      clinic: labelOf(clinics, v.clinic),
      message: v.message.trim().slice(0, 3000) || null,
      locale
    }).catch((error: unknown) => {
      // WhatsApp still carries the request; a duplicate submit within a minute is rejected on purpose.
      console.warn('[contact] lead not saved:', error);
    });
  }

  const field = (name: keyof Values) => ({
    id: `${formId}-${name}`,
    name,
    value: values[name],
    onChange: set(name)
  });

  const errorProps = (name: keyof FieldErrors) =>
    errors[name]
      ? {'aria-invalid': true as const, 'aria-describedby': `${formId}-${name}-error`}
      : {'aria-invalid': false as const};

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={labelledBy}
      data-reveal
      className={cn(
        'flex flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-white transition-colors focus-within:border-gold-400/30 sm:p-8',
        className
      )}
    >
      <input
        ref={trapRef}
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -start-[9999px] size-px opacity-0"
      />
      {/* The last row (message) takes any spare height, so the button lines up with the cards' bottom edge. */}
      <div className="grid flex-1 gap-5 sm:grid-cols-2 lg:grid-rows-[repeat(4,auto)_1fr]">
        <Field label={labels.name} htmlFor={`${formId}-name`} required error={errors.name} errorId={`${formId}-name-error`} className="sm:col-span-2">
          <input
            {...field('name')}
            {...errorProps('name')}
            type="text"
            autoComplete="name"
            required
            placeholder={labels.namePlaceholder}
            className={inputClass}
          />
        </Field>

        <Field label={labels.phone} htmlFor={`${formId}-phone`} required error={errors.phone} errorId={`${formId}-phone-error`}>
          <input
            {...field('phone')}
            {...errorProps('phone')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            required
            placeholder={labels.phonePlaceholder}
            className={cn(inputClass, 'rtl:text-right')}
          />
        </Field>

        <Field label={labels.age} htmlFor={`${formId}-age`} optional={labels.optional}>
          <input {...field('age')} type="number" inputMode="numeric" min={1} max={120} className={inputClass} />
        </Field>

        <Field label={labels.requestType} htmlFor={`${formId}-requestType`}>
          <Select {...field('requestType')} options={requestTypes} />
        </Field>

        <Field label={labels.service} htmlFor={`${formId}-service`}>
          <Select {...field('service')} options={services} />
        </Field>

        <Field label={labels.clinic} htmlFor={`${formId}-clinic`} className="sm:col-span-2">
          <Select {...field('clinic')} options={clinics} />
        </Field>

        <Field label={labels.message} htmlFor={`${formId}-message`} optional={labels.optional} className="flex flex-col sm:col-span-2">
          <textarea
            {...field('message')}
            rows={4}
            placeholder={labels.messagePlaceholder}
            className={cn(inputClass, 'min-h-32 flex-1 resize-y')}
          />
        </Field>
      </div>

      <button
        type="submit"
        className="btn-fx fx-shine mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 text-lg font-bold text-[#052e16] shadow-[0_12px_30px_-12px_rgb(37_211_102/0.8)] transition duration-300 hover:bg-[#3be07a] hover:shadow-[0_18px_36px_-12px_rgb(37_211_102/0.85)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] active:scale-[0.99] motion-safe:hover:-translate-y-0.5"
      >
        <WhatsAppIcon className="fx-wiggle size-6" />
        {labels.submit}
      </button>

      <div className="mt-4 flex flex-col gap-x-6 gap-y-2 text-sm text-white/60 sm:flex-row sm:flex-wrap">
        <p className="flex items-start gap-2">
          <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-400" />
          {labels.description}
        </p>
        <p className="flex items-start gap-2">
          <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-400" />
          {labels.privacy}
        </p>
      </div>

      <p
        role="status"
        className={cn(
          'mt-5 flex items-start gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100',
          !sent && 'sr-only'
        )}
      >
        {sent && (
          <>
            <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-emerald-300" />
            {labels.success}
          </>
        )}
      </p>
    </form>
  );
}

/** Native select without the browser chrome, so it matches the inputs' height, with a gold chevron. */
function Select({options, ...props}: {options: Option[]} & Omit<ComponentProps<'select'>, 'className' | 'children'>) {
  return (
    <div className="relative">
      <select {...props} className={cn(inputClass, 'cursor-pointer appearance-none pe-11')}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-gold-400" />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  optional,
  error,
  errorId,
  className,
  children
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: string;
  error?: string;
  errorId?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-white/85">
        {label}
        {required && (
          <span aria-hidden className="text-gold-400">
            *
          </span>
        )}
        {optional && <span className="font-normal text-white/50">({optional})</span>}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-2 text-sm font-medium text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
