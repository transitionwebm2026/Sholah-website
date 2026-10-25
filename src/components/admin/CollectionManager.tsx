'use client';

import {ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2} from 'lucide-react';
import {useEffect, useMemo, useState, type ReactNode} from 'react';
import {validate, type Field} from '@/lib/admin/fields';
import {describeError, getAdminClient} from '@/lib/admin/supabase';
import {cn} from '@/lib/utils';
import {FieldsEditor} from './FieldsEditor';
import {useUploading} from './MediaInput';
import {Alert, Button, Card, Dialog, EmptyState, IconButton, Spinner, Tabs, Toggle, useToast} from './ui';

type Row = Record<string, unknown> & {id: string; sort_order?: number};

export type CollectionProps = {
  table: string;
  title: string;
  description?: ReactNode;
  fields: Field[];
  newItem: () => Record<string, unknown>;
  itemTitle: (row: Row) => string;
  itemSubtitle?: (row: Row) => ReactNode;
  itemImage?: (row: Row) => string | null | undefined;
  /** Boolean columns switchable straight from the list (visibility, featured…). */
  toggles?: Array<{key: string; label: string}>;
  /** Splits the list into tabs by a column value (FAQ page, procedure's specialty…). */
  filter?: {key: string; options: Array<{value: string; label: string}>};
  addLabel?: string;
  /** Wider edit dialog for long forms. */
  wide?: boolean;
  /** Derives columns before saving (slug from title, video source from URL…). */
  prepare?: (row: Record<string, unknown>) => Record<string, unknown>;
  /** Called after a row was saved or deleted. */
  onChanged?: () => void;
};

const META = ['created_at', 'updated_at'];
const strip = (row: Record<string, unknown>) => Object.fromEntries(Object.entries(row).filter(([k]) => !META.includes(k)));

/** Generic list manager: add / edit (dialog) / delete / reorder / quick toggles for one table. */
export function CollectionManager({
  table,
  title,
  description,
  fields,
  newItem,
  itemTitle,
  itemSubtitle,
  itemImage,
  toggles = [],
  filter,
  addLabel = 'إضافة جديد',
  wide,
  prepare,
  onChanged
}: CollectionProps) {
  const toast = useToast();
  const uploading = useUploading();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState(filter?.options[0]?.value ?? '');
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminClient()
      .from(table)
      .select('*')
      .order('sort_order', {ascending: true})
      .order('created_at', {ascending: true})
      .then(({data, error: loadError}) => {
        if (!active) return;
        if (loadError) setError(describeError(loadError));
        else setRows((data ?? []) as Row[]);
      });
    return () => {
      active = false;
    };
  }, [table, reloadKey]);

  // Keep the selected tab valid when the options change (e.g. a specialty was deleted).
  const filterValue = filter && !filter.options.some((o) => o.value === activeFilter) ? (filter.options[0]?.value ?? '') : activeFilter;
  const visible = useMemo(
    () => (rows ?? []).filter((row) => !filter || String(row[filter.key] ?? '') === filterValue),
    [rows, filter, filterValue]
  );

  function openNew() {
    const maxOrder = Math.max(-1, ...(rows ?? []).map((r) => Number(r.sort_order ?? 0)));
    setProblems([]);
    setEditing({...newItem(), sort_order: maxOrder + 1, ...(filter ? {[filter.key]: filterValue} : {})});
  }

  async function save() {
    if (!editing) return;
    const found = validate(fields, editing);
    setProblems(found);
    if (found.length) return;
    setSaving(true);
    const client = getAdminClient();
    const payload = strip(prepare ? prepare(editing) : editing);
    const isNew = !payload.id;
    const query = isNew
      ? client.from(table).insert(payload).select().single()
      : client.from(table).update(payload).eq('id', payload.id as string).select().single();
    const {data, error: saveError} = await query;
    setSaving(false);
    if (saveError) {
      toast(describeError(saveError), 'error');
      return;
    }
    const saved = data as Row;
    setRows((list) => (isNew ? [...(list ?? []), saved] : (list ?? []).map((r) => (r.id === saved.id ? saved : r))));
    setEditing(null);
    onChanged?.();
    toast(isNew ? 'تمت الإضافة — ظاهرة على الموقع الآن' : 'تم الحفظ — التعديل ظاهر على الموقع الآن');
  }

  async function remove(row: Row) {
    if (!window.confirm(`حذف «${itemTitle(row) || 'هذا العنصر'}» نهائيًا؟`)) return;
    const {error: deleteError} = await getAdminClient().from(table).delete().eq('id', row.id);
    if (deleteError) {
      toast(describeError(deleteError), 'error');
      return;
    }
    setRows((list) => (list ?? []).filter((r) => r.id !== row.id));
    onChanged?.();
    toast('تم الحذف');
  }

  async function toggle(row: Row, key: string, value: boolean) {
    setRows((list) => (list ?? []).map((r) => (r.id === row.id ? {...r, [key]: value} : r)));
    const {error: toggleError} = await getAdminClient().from(table).update({[key]: value}).eq('id', row.id);
    if (toggleError) {
      toast(describeError(toggleError), 'error');
      setRows((list) => (list ?? []).map((r) => (r.id === row.id ? {...r, [key]: !value} : r)));
    }
  }

  /** Moves within the visible (filtered) list, then renumbers sort_order for the rows that changed. */
  async function moveRow(index: number, to: number) {
    if (to < 0 || to >= visible.length) return;
    const ordered = [...visible];
    const [item] = ordered.splice(index, 1);
    ordered.splice(to, 0, item);
    const orders = visible.map((r) => Number(r.sort_order ?? 0)).sort((a, b) => a - b);
    // Distinct, increasing slots even if several rows shared a sort_order.
    const slots = orders.map((o, i) => Math.max(o, i === 0 ? o : orders[i - 1] + 1));
    const changed = ordered.map((row, i) => ({row, order: slots[i]})).filter(({row, order}) => row.sort_order !== order);

    setRows((list) =>
      (list ?? [])
        .map((r) => {
          const hit = changed.find((c) => c.row.id === r.id);
          return hit ? {...r, sort_order: hit.order} : r;
        })
        .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    );
    const results = await Promise.all(
      changed.map(({row, order}) => getAdminClient().from(table).update({sort_order: order}).eq('id', row.id))
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      toast(describeError(failed.error), 'error');
      setReloadKey((k) => k + 1);
    }
  }

  return (
    <Card
      title={title}
      description={description}
      actions={
        <Button variant="primary" onClick={openNew} disabled={!rows || (filter && !filter.options.length)}>
          <Plus aria-hidden className="size-4" />
          {addLabel}
        </Button>
      }
    >
      {filter && filter.options.length > 1 && <Tabs tabs={filter.options.map((o) => ({id: o.value, label: o.label}))} active={filterValue} onChange={setActiveFilter} />}

      {error ? (
        <Alert tone="error">{error}</Alert>
      ) : !rows ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <EmptyState>لا توجد عناصر بعد. اضغط «{addLabel}».</EmptyState>
      ) : (
        <ul className="space-y-2">
          {visible.map((row, i) => {
            const image = itemImage?.(row);
            return (
              <li key={row.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-navy-950/40 p-3 sm:flex-nowrap">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white/70">{i + 1}</span>
                {itemImage && (
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-navy-800">
                    {image && (
                      // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                      <img src={image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                    )}
                  </span>
                )}
                <button type="button" onClick={() => setEditing({...row})} className="min-w-0 flex-1 text-start">
                  <span className="block truncate font-semibold hover:text-gold-300">{itemTitle(row) || '— بدون عنوان —'}</span>
                  {itemSubtitle && <span className="mt-0.5 block truncate text-xs text-white/55">{itemSubtitle(row)}</span>}
                </button>
                {toggles.length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {toggles.map((t) => (
                      <Toggle key={t.key} label={t.label} checked={Boolean(row[t.key])} onChange={(v) => void toggle(row, t.key, v)} />
                    ))}
                  </div>
                )}
                <div className="flex shrink-0 items-center">
                  <IconButton label="تحريك لأعلى" disabled={i === 0} onClick={() => void moveRow(i, i - 1)}>
                    <ArrowUp aria-hidden className="size-4" />
                  </IconButton>
                  <IconButton label="تحريك لأسفل" disabled={i === visible.length - 1} onClick={() => void moveRow(i, i + 1)}>
                    <ArrowDown aria-hidden className="size-4" />
                  </IconButton>
                  <IconButton label="تعديل" onClick={() => setEditing({...row})}>
                    <Pencil aria-hidden className="size-4" />
                  </IconButton>
                  <IconButton label="حذف" onClick={() => void remove(row)} className="hover:bg-red-500/20 hover:text-red-200">
                    <Trash2 aria-hidden className="size-4" />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => {
          if (!saving) setEditing(null);
        }}
        title={editing?.id ? `تعديل: ${itemTitle(editing as Row) || ''}` : addLabel}
        wide={wide}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={save} loading={saving} disabled={uploading}>
              <Save aria-hidden className="size-4" />
              {uploading ? 'انتظر انتهاء الرفع…' : 'حفظ'}
            </Button>
          </>
        }
      >
        {editing && (
          <div className={cn('grid gap-5')}>
            <FieldsEditor fields={fields} value={editing} onChange={setEditing} />
            {problems.length > 0 && (
              <Alert tone="error">
                <ul className="list-inside list-disc space-y-0.5">
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Alert>
            )}
          </div>
        )}
      </Dialog>
    </Card>
  );
}
