'use client';

import {ExternalLink, Pencil, Plus, Search, Trash2} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import {Alert, Badge, Card, EmptyState, IconButton, PageHeader, Spinner, Tabs, TextInput, Toggle, useToast} from '@/components/admin/ui';
import {arOf} from '@/lib/admin/fields';
import {describeError, getAdminClient} from '@/lib/admin/supabase';
import type {ArticleCardRow} from '@/lib/cms/types';

type Row = ArticleCardRow & {status: 'draft' | 'published'};

const COLUMNS = 'id,slug,category,title,excerpt,cover_url,is_featured,status,published_at,read_minutes,updated_at';

/** Published with a future date: saved as published, but hidden from visitors until then. */
const isScheduled = (row: Row) => row.status === 'published' && new Date(row.published_at).getTime() > Date.now();

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ar-EG-u-nu-latn', {dateStyle: 'medium'});

export default function ArticlesManagerPage() {
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'published' | 'draft'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    getAdminClient()
      .from('articles')
      .select(COLUMNS)
      .order('published_at', {ascending: false})
      .then(({data, error: loadError}) => {
        if (!active) return;
        if (loadError) setError(describeError(loadError));
        else setRows((data ?? []) as Row[]);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(
    () => ({
      all: rows?.length ?? 0,
      published: rows?.filter((r) => r.status === 'published').length ?? 0,
      draft: rows?.filter((r) => r.status === 'draft').length ?? 0
    }),
    [rows]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter(
      (r) =>
        (tab === 'all' || r.status === tab) &&
        (!q || [r.title.ar, r.title.en, r.category.ar, r.category.en, r.slug].some((s) => s?.toLowerCase().includes(q)))
    );
  }, [rows, tab, query]);

  async function toggleFeatured(row: Row, value: boolean) {
    setRows((list) => (list ?? []).map((r) => (r.id === row.id ? {...r, is_featured: value} : r)));
    const {error: saveError} = await getAdminClient().from('articles').update({is_featured: value}).eq('id', row.id);
    if (saveError) {
      toast(describeError(saveError), 'error');
      setRows((list) => (list ?? []).map((r) => (r.id === row.id ? {...r, is_featured: !value} : r)));
    }
  }

  async function remove(row: Row) {
    if (!window.confirm(`حذف مقال «${arOf(row.title) || row.slug}» نهائيًا؟ لا يمكن التراجع.`)) return;
    const {error: deleteError} = await getAdminClient().from('articles').delete().eq('id', row.id);
    if (deleteError) {
      toast(describeError(deleteError), 'error');
      return;
    }
    setRows((list) => (list ?? []).filter((r) => r.id !== row.id));
    toast('تم حذف المقال');
  }

  return (
    <>
      <PageHeader
        title="المقالات"
        description="اكتب المقال بالعربي والإنجليزي، أضف صورة الغلاف وبيانات جوجل، واحفظه كمسودة أو انشره مباشرة. المقال «المميز» يظهر في أعلى صفحة المقالات."
        actions={
          <Link
            href="/admin/articles/edit/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold-400 px-4 text-sm font-semibold text-navy-950 shadow-gold transition hover:bg-gold-300"
          >
            <Plus aria-hidden className="size-4" />
            مقال جديد
          </Link>
        }
      />

      <Card>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 [&>div]:mb-0">
            <Tabs
              tabs={[
                {id: 'all', label: `الكل (${counts.all})`},
                {id: 'published', label: `منشورة (${counts.published})`},
                {id: 'draft', label: `مسودات (${counts.draft})`}
              ]}
              active={tab}
              onChange={(id) => setTab(id as typeof tab)}
            />
          </div>
          <div className="relative w-full sm:w-64">
            <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <TextInput type="search" aria-label="بحث في المقالات" placeholder="بحث بالعنوان أو التصنيف…" value={query} onChange={(e) => setQuery(e.target.value)} className="ps-9" />
          </div>
        </div>

        {error ? (
          <Alert tone="error">{error}</Alert>
        ) : !rows ? (
          <Spinner />
        ) : visible.length === 0 ? (
          <EmptyState>{rows.length ? 'لا توجد مقالات مطابقة.' : 'لا توجد مقالات بعد. اضغط «مقال جديد».'}</EmptyState>
        ) : (
          <ul className="space-y-2">
            {visible.map((row) => {
              const edit = `/admin/articles/edit/?id=${row.id}`;
              return (
                <li key={row.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-navy-950/40 p-3 sm:flex-nowrap">
                  <span className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg bg-navy-800">
                    {row.cover_url && (
                      // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                      <img src={row.cover_url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                    )}
                  </span>
                  <Link href={edit} className="min-w-0 flex-1">
                    <span className="block truncate font-semibold hover:text-gold-300">{arOf(row.title) || '— بدون عنوان —'}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-white/55">
                      {row.status === 'draft' ? (
                        <Badge>مسودة</Badge>
                      ) : isScheduled(row) ? (
                        <Badge tone="blue">مجدول</Badge>
                      ) : (
                        <Badge tone="green">منشور</Badge>
                      )}
                      {arOf(row.category) && <Badge tone="gold">{arOf(row.category)}</Badge>}
                      <time dateTime={row.published_at}>{formatDate(row.published_at)}</time>
                      <span>· {row.read_minutes} د قراءة</span>
                    </span>
                  </Link>
                  <Toggle label="مميز" checked={row.is_featured} onChange={(v) => void toggleFeatured(row, v)} />
                  <div className="flex shrink-0 items-center">
                    {row.status === 'published' && !isScheduled(row) && (
                      <a
                        href={`/ar/articles/view/?slug=${encodeURIComponent(row.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="عرض على الموقع"
                        title="عرض على الموقع"
                        className="grid size-9 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        <ExternalLink aria-hidden className="size-4" />
                      </a>
                    )}
                    <Link
                      href={edit}
                      aria-label="تعديل"
                      title="تعديل"
                      className="grid size-9 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      <Pencil aria-hidden className="size-4" />
                    </Link>
                    <IconButton label="حذف" onClick={() => void remove(row)} className="hover:bg-red-500/20 hover:text-red-200">
                      <Trash2 aria-hidden className="size-4" />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
