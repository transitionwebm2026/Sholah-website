'use client';

import {Download, Phone, Save, Search, Trash2} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {useAdmin} from '@/components/admin/AdminShell';
import {Alert, Badge, Button, Card, EmptyState, IconButton, PageHeader, Select, Spinner, Tabs, TextArea, TextInput, useToast} from '@/components/admin/ui';
import {WhatsAppIcon} from '@/components/ui/Icons';
import {describeError, getAdminClient} from '@/lib/admin/supabase';
import type {LeadRow, LeadStatus} from '@/lib/cms/types';

const STATUSES: Array<{value: LeadStatus; label: string; tone: 'gold' | 'blue' | 'green' | 'neutral'}> = [
  {value: 'new', label: 'جديد', tone: 'gold'},
  {value: 'contacted', label: 'تم التواصل', tone: 'blue'},
  {value: 'booked', label: 'تم الحجز', tone: 'green'},
  {value: 'closed', label: 'مغلق', tone: 'neutral'}
];

const statusOf = (value: LeadStatus) => STATUSES.find((s) => s.value === value) ?? STATUSES[0];

const formatDateTime = (iso: string) => new Date(iso).toLocaleString('ar-EG-u-nu-latn', {dateStyle: 'medium', timeStyle: 'short'});

/** wa.me needs the international number without "+" or leading zeros (Egyptian 01… → 201…). */
function whatsappDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '').replace(/^00/, '');
  if (/^01\d{9}$/.test(digits)) digits = `2${digits}`;
  return digits;
}

/** Excel opens UTF-8 CSV with Arabic correctly only with a byte-order mark. */
function downloadCsv(rows: LeadRow[]) {
  const header = ['التاريخ', 'الاسم', 'الهاتف', 'السن', 'نوع الطلب', 'الخدمة', 'العيادة', 'الرسالة', 'اللغة', 'الحالة', 'ملاحظات'];
  const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [formatDateTime(r.created_at), r.name, r.phone, r.age, r.request_type, r.service, r.clinic, r.message, r.locale, statusOf(r.status).label, r.admin_notes]
      .map(cell)
      .join(',')
  );
  const blob = new Blob(['﻿', [header.map(cell).join(','), ...lines].join('\r\n')], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `consultation-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function LeadsPage() {
  const toast = useToast();
  const {refreshLeads} = useAdmin();
  const [rows, setRows] = useState<LeadRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<LeadStatus | 'all'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    getAdminClient()
      .from('consultation_leads')
      .select('*')
      .order('created_at', {ascending: false})
      .limit(1000)
      .then(({data, error: loadError}) => {
        if (!active) return;
        if (loadError) setError(describeError(loadError));
        else setRows((data ?? []) as LeadRow[]);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const result: Record<string, number> = {all: rows?.length ?? 0};
    for (const s of STATUSES) result[s.value] = rows?.filter((r) => r.status === s.value).length ?? 0;
    return result;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return (rows ?? []).filter(
      (r) =>
        (tab === 'all' || r.status === tab) &&
        (!q ||
          [r.name, r.service, r.request_type, r.clinic, r.message].some((s) => s?.toLowerCase().includes(q)) ||
          (qDigits.length >= 3 && r.phone.replace(/\D/g, '').includes(qDigits)))
    );
  }, [rows, tab, query]);

  async function update(row: LeadRow, changes: Partial<Pick<LeadRow, 'status' | 'admin_notes'>>): Promise<boolean> {
    const {error: saveError} = await getAdminClient().from('consultation_leads').update(changes).eq('id', row.id);
    if (saveError) {
      toast(describeError(saveError), 'error');
      return false;
    }
    setRows((list) => (list ?? []).map((r) => (r.id === row.id ? {...r, ...changes} : r)));
    if (changes.status) refreshLeads();
    return true;
  }

  async function remove(row: LeadRow) {
    if (!window.confirm(`حذف طلب «${row.name}» نهائيًا؟`)) return;
    const {error: deleteError} = await getAdminClient().from('consultation_leads').delete().eq('id', row.id);
    if (deleteError) {
      toast(describeError(deleteError), 'error');
      return;
    }
    setRows((list) => (list ?? []).filter((r) => r.id !== row.id));
    refreshLeads();
    toast('تم حذف الطلب');
  }

  return (
    <>
      <PageHeader
        title="طلبات الاستشارة"
        description="كل طلب يُرسل من نموذج الحجز يُحفظ هنا (بالإضافة لرسالة واتساب). غيّر حالة الطلب بعد التواصل مع المريض، وأضف ملاحظاتك."
        actions={
          <Button onClick={() => downloadCsv(visible)} disabled={!visible.length}>
            <Download aria-hidden className="size-4" />
            تصدير Excel (CSV)
          </Button>
        }
      />

      <Card>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 [&>div]:mb-0">
            <Tabs
              tabs={[{id: 'all', label: `الكل (${counts.all})`}, ...STATUSES.map((s) => ({id: s.value, label: `${s.label} (${counts[s.value]})`}))]}
              active={tab}
              onChange={(id) => setTab(id as typeof tab)}
            />
          </div>
          <div className="relative w-full sm:w-64">
            <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <TextInput type="search" aria-label="بحث في الطلبات" placeholder="بحث بالاسم أو الرقم…" value={query} onChange={(e) => setQuery(e.target.value)} className="ps-9" />
          </div>
        </div>

        {error ? (
          <Alert tone="error">{error}</Alert>
        ) : !rows ? (
          <Spinner />
        ) : visible.length === 0 ? (
          <EmptyState>{rows.length ? 'لا توجد طلبات مطابقة.' : 'لا توجد طلبات بعد. تصل الطلبات هنا من نموذج الحجز في صفحة التواصل.'}</EmptyState>
        ) : (
          <ul className="space-y-3">
            {visible.map((row) => (
              <LeadItem key={row.id} row={row} onUpdate={(changes) => update(row, changes)} onRemove={() => void remove(row)} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function LeadItem({
  row,
  onUpdate,
  onRemove
}: {
  row: LeadRow;
  onUpdate: (changes: Partial<Pick<LeadRow, 'status' | 'admin_notes'>>) => Promise<boolean>;
  onRemove: () => void;
}) {
  const [notes, setNotes] = useState(row.admin_notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const status = statusOf(row.status);
  const wa = whatsappDigits(row.phone);
  const details = [
    row.request_type && {label: 'نوع الطلب', value: row.request_type},
    row.service && {label: 'الخدمة', value: row.service},
    row.clinic && {label: 'العيادة', value: row.clinic},
    row.age && {label: 'السن', value: String(row.age)},
    row.locale && {label: 'لغة الموقع', value: row.locale === 'en' ? 'English' : 'عربي'}
  ].filter(Boolean) as Array<{label: string; value: string}>;

  return (
    <li className={`rounded-xl border p-4 ${row.status === 'new' ? 'border-gold-400/40 bg-gold-400/[0.04]' : 'border-white/10 bg-navy-950/40'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold">{row.name}</span>
            <Badge tone={status.tone}>{status.label}</Badge>
          </p>
          <time dateTime={row.created_at} className="text-xs text-white/50">
            {formatDateTime(row.created_at)}
          </time>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${row.phone}`}
            dir="ltr"
            className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm font-semibold hover:border-gold-400/60 hover:text-gold-200"
          >
            <Phone aria-hidden className="size-4" />
            {row.phone}
          </a>
          {wa.length >= 8 && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#25D366] px-3 text-sm font-semibold text-[#052e16] hover:bg-[#3be07a]"
            >
              <WhatsAppIcon className="size-4" />
              واتساب
            </a>
          )}
        </div>
      </div>

      {details.length > 0 && (
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {details.map((d) => (
            <div key={d.label} className="flex gap-1.5">
              <dt className="text-white/50">{d.label}:</dt>
              <dd className="font-semibold text-white/85">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {row.message && <p className="mt-3 rounded-lg bg-white/[0.04] px-3 py-2 text-sm leading-relaxed whitespace-pre-line text-white/80">{row.message}</p>}

      <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-start">
        <Select aria-label="حالة الطلب" value={row.status} onChange={(e) => void onUpdate({status: e.target.value as LeadStatus})}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <TextArea
            aria-label="ملاحظات داخلية"
            placeholder="ملاحظات داخلية (لا يراها المريض)…"
            rows={1}
            maxLength={3000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-11"
          />
          {notes !== (row.admin_notes ?? '') && (
            <Button
              variant="primary"
              loading={savingNotes}
              onClick={async () => {
                const value = notes.trim();
                setSavingNotes(true);
                if (await onUpdate({admin_notes: value || null})) setNotes(value);
                setSavingNotes(false);
              }}
            >
              <Save aria-hidden className="size-4" />
              حفظ
            </Button>
          )}
        </div>
        <IconButton label="حذف الطلب" onClick={onRemove} className="hover:bg-red-500/20 hover:text-red-200">
          <Trash2 aria-hidden className="size-4" />
        </IconButton>
      </div>
    </li>
  );
}
