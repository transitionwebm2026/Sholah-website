'use client';

import {LoaderCircle, X} from 'lucide-react';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react';
import {cn} from '@/lib/utils';

/* ---------- Buttons ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-gold-400 text-navy-950 hover:bg-gold-300 shadow-gold',
  secondary: 'border border-white/15 bg-white/5 text-white hover:border-gold-400/60 hover:text-gold-200',
  ghost: 'text-white/75 hover:bg-white/5 hover:text-white',
  danger: 'border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20'
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: {variant?: ButtonVariant; size?: 'sm' | 'md'; loading?: boolean} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'min-h-9 px-3 text-sm' : 'min-h-11 px-4 text-sm',
        buttonVariants[variant],
        className
      )}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function IconButton({label, className, children, ...props}: {label: string} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------- Layout ---------- */

export function Card({title, description, actions, className, children}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={cn('rounded-2xl border border-white/10 bg-navy-900/60 p-5 sm:p-6', className)}>
      {(title || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-relaxed text-white/60">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({title, description, actions}: {title: string; description?: ReactNode; actions?: ReactNode}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Spinner({label = 'جارٍ التحميل…', className}: {label?: string; className?: string}) {
  return (
    <p role="status" className={cn('flex items-center justify-center gap-3 py-16 text-white/60', className)}>
      <LoaderCircle aria-hidden className="size-5 animate-spin text-gold-400" />
      {label}
    </p>
  );
}

export function Badge({tone = 'neutral', children}: {tone?: 'neutral' | 'gold' | 'green' | 'red' | 'blue'; children: ReactNode}) {
  const tones = {
    neutral: 'bg-white/10 text-white/75',
    gold: 'bg-gold-400/15 text-gold-200',
    green: 'bg-emerald-400/15 text-emerald-200',
    red: 'bg-red-400/15 text-red-200',
    blue: 'bg-sky-400/15 text-sky-200'
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone])}>{children}</span>;
}

export function EmptyState({children}: {children: ReactNode}) {
  return <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-white/55">{children}</div>;
}

export function Alert({tone = 'info', children}: {tone?: 'info' | 'error' | 'success'; children: ReactNode}) {
  const tones = {
    info: 'border-sky-400/25 bg-sky-400/10 text-sky-100',
    error: 'border-red-400/30 bg-red-500/10 text-red-100',
    success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-xl border px-4 py-3 text-sm leading-relaxed', tones[tone])}>
      {children}
    </div>
  );
}

/* ---------- Form controls ---------- */

export const inputClass =
  'w-full rounded-xl border border-white/15 bg-navy-950/70 px-3.5 py-2.5 text-[0.95rem] text-white placeholder:text-white/35 transition hover:border-white/25 focus:border-gold-400 focus:outline-none focus:ring-4 focus:ring-gold-400/15 disabled:opacity-60';

export function Label({htmlFor, children, hint, required}: {htmlFor?: string; children: ReactNode; hint?: ReactNode; required?: boolean}) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-white/85">
        {children}
        {required && <span className="ms-1 text-gold-400">*</span>}
      </label>
      {hint && <p className="mt-0.5 text-xs leading-relaxed text-white/50">{hint}</p>}
    </div>
  );
}

export function TextInput({className, ...props}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function TextArea({className, ...props}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, 'min-h-24 resize-y leading-relaxed', className)} {...props} />;
}

export function Select({className, children, ...props}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClass, 'cursor-pointer [&_option]:bg-navy-900', className)} {...props}>
      {children}
    </select>
  );
}

export function Toggle({checked, onChange, label, disabled}: {checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean}) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-3 select-none', disabled && 'pointer-events-none opacity-50')}>
      <span className="relative inline-flex">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-white/15 transition peer-checked:bg-gold-400 peer-focus-visible:ring-4 peer-focus-visible:ring-gold-400/30" />
        <span className="absolute top-0.5 start-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
      <span className="text-sm text-white/85">{label}</span>
    </label>
  );
}

/* ---------- Tabs ---------- */

export function Tabs({tabs, active, onChange}: {tabs: Array<{id: string; label: string}>; active: string; onChange: (id: string) => void}) {
  return (
    <div role="tablist" className="no-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-navy-950/60 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === active}
          onClick={() => onChange(tab.id)}
          className={cn(
            'min-h-10 shrink-0 rounded-xl px-4 text-sm font-semibold transition',
            tab.id === active ? 'bg-gold-400 text-navy-950' : 'text-white/70 hover:bg-white/5 hover:text-white'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Dialog ---------- */

export function Dialog({open, onClose, title, children, footer, wide}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={cn(
        'm-auto max-h-[92dvh] w-[calc(100%-1.5rem)] overflow-hidden rounded-2xl border border-white/10 bg-navy-900 p-0 text-white shadow-luxe backdrop:bg-navy-950/80',
        wide ? 'max-w-4xl' : 'max-w-2xl'
      )}
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            <IconButton label="إغلاق" onClick={onClose}>
              <X aria-hidden className="size-5" />
            </IconButton>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 px-5 py-4">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

/* ---------- Toasts ---------- */

type Toast = {id: number; tone: 'success' | 'error' | 'info'; message: string};
type ToastApi = (message: string, tone?: Toast['tone']) => void;

const ToastContext = createContext<ToastApi>(() => {});

export function ToastProvider({children}: {children: ReactNode}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback<ToastApi>((message, tone = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, {id, tone, message}]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), tone === 'error' ? 7000 : 3500);
  }, []);

  return (
    <ToastContext value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <p
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto max-w-lg rounded-xl px-4 py-3 text-sm font-semibold shadow-luxe',
              toast.tone === 'success' && 'bg-emerald-500 text-emerald-950',
              toast.tone === 'error' && 'bg-red-500 text-white',
              toast.tone === 'info' && 'bg-sky-400 text-sky-950'
            )}
          >
            {toast.message}
          </p>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  return use(ToastContext);
}

/** Warns before closing the tab with unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
