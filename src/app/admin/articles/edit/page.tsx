'use client';

import {ArrowRight, ExternalLink, RotateCcw, Save, Send, Undo2} from 'lucide-react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {Suspense, useEffect, useState} from 'react';
import {FieldsEditor} from '@/components/admin/FieldsEditor';
import {useUploading} from '@/components/admin/MediaInput';
import {RichTextEditor} from '@/components/admin/RichTextEditor';
import {Alert, Badge, Button, Card, Label, PageHeader, Spinner, Tabs, TextInput, Toggle, useToast, useUnsavedWarning} from '@/components/admin/ui';
import {arOf, emptyL10n, slugify, validate} from '@/lib/admin/fields';
import {articleFields, articleSeoFields} from '@/lib/admin/schemas';
import {describeError, getAdminClient} from '@/lib/admin/supabase';
import type {ArticleRow, RichNode} from '@/lib/cms/types';

type Lang = 'ar' | 'en';
type Draft = Omit<ArticleRow, 'id' | 'cover_url'> & {id?: string; cover_url: string; status: 'draft' | 'published'};

const COLUMNS = 'id,slug,category,title,excerpt,content,cover_url,is_featured,status,published_at,read_minutes,seo,updated_at';
const WORDS_PER_MINUTE = 200;

function newArticle(): Draft {
  return {
    slug: '',
    category: emptyL10n(),
    title: emptyL10n(),
    excerpt: emptyL10n(),
    content: {ar: null, en: null},
    cover_url: '',
    is_featured: false,
    status: 'draft',
    published_at: new Date().toISOString(),
    read_minutes: 4,
    seo: {}
  };
}

function plainText(node: RichNode | null | undefined): string {
  if (!node) return '';
  if (node.text) return node.text;
  return (node.content ?? []).map(plainText).join(' ');
}

const wordCount = (doc: RichNode | null | undefined) => plainText(doc).split(/\s+/).filter(Boolean).length;

/** Reading time of the longer language version, in whole minutes (1–120, as the column allows). */
const readMinutes = (content: Draft['content']) =>
  Math.min(120, Math.max(1, Math.round(Math.max(wordCount(content.ar), wordCount(content.en)) / WORDS_PER_MINUTE)));

/** `<input type="datetime-local">` works in local time without a zone. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const isFuture = (iso: string) => new Date(iso).getTime() > Date.now();

export default function ArticleEditorPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EditorRoute />
    </Suspense>
  );
}

/** `?id=…` edits an article, no id starts a new one. A new id (after the first save) reloads the saved row. */
function EditorRoute() {
  const id = useSearchParams().get('id');
  return <ArticleEditor key={id ?? 'new'} id={id} />;
}

function ArticleEditor({id}: {id: string | null}) {
  const router = useRouter();
  const toast = useToast();
  const uploading = useUploading();
  const [initial] = useState<Draft | null>(() => (id ? null : newArticle()));
  const [article, setArticle] = useState<Draft | null>(initial);
  const [saved, setSaved] = useState(initial ? JSON.stringify(initial) : '');
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<Lang>('ar');
  // The rich-text editors read their content only when created: bumped to show reverted text.
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getAdminClient()
      .from('articles')
      .select(COLUMNS)
      .eq('id', id)
      .maybeSingle()
      .then(({data, error: loadError}) => {
        if (!active) return;
        if (loadError) return setError(describeError(loadError));
        if (!data) return setError('المقال غير موجود — ربما تم حذفه.');
        const row = data as unknown as Draft;
        const draft: Draft = {...row, cover_url: row.cover_url ?? '', seo: row.seo ?? {}, content: row.content ?? {ar: null, en: null}};
        setArticle(draft);
        setSaved(JSON.stringify(draft));
      });
    return () => {
      active = false;
    };
  }, [id]);

  const dirty = article !== null && JSON.stringify(article) !== saved;
  useUnsavedWarning(dirty);

  if (error) {
    return (
      <div className="space-y-4">
        <Alert tone="error">{error}</Alert>
        <BackLink />
      </div>
    );
  }
  if (!article) return <Spinner />;

  const wasPublished = (JSON.parse(saved) as Draft).status === 'published';
  const scheduled = article.status === 'published' && isFuture(article.published_at);
  const minutes = readMinutes(article.content);

  async function save(status: Draft['status']) {
    if (!article) return;
    const next: Draft = {...article, status};
    // Publishing a draft dates it now, unless a future date was chosen to schedule it.
    if (status === 'published' && !wasPublished && !isFuture(next.published_at)) next.published_at = new Date().toISOString();

    const slug = next.slug.trim() || slugify(next.title.en) || `article-${Date.now().toString(36)}`;
    const found = validate(articleFields, {...next, slug});
    if (slug === 'view') found.push('المعرّف «view» محجوز، اختر غيره.');
    if (status === 'published' && !wordCount(next.content.ar) && !wordCount(next.content.en)) found.push('اكتب نص المقال قبل النشر.');
    setProblems(found);
    if (found.length) {
      toast('راجع الملاحظات أسفل الصفحة', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      slug,
      title: next.title,
      category: next.category,
      excerpt: next.excerpt,
      content: next.content,
      cover_url: next.cover_url || null,
      is_featured: next.is_featured,
      status,
      published_at: next.published_at,
      read_minutes: readMinutes(next.content),
      seo: next.seo
    };
    const client = getAdminClient();
    const {data, error: saveError} = next.id
      ? await client.from('articles').update(payload).eq('id', next.id).select(COLUMNS).single()
      : await client.from('articles').insert(payload).select(COLUMNS).single();
    setSaving(false);
    if (saveError) {
      toast(describeError(saveError), 'error');
      return;
    }

    const row = data as unknown as Draft;
    const stored: Draft = {...row, cover_url: row.cover_url ?? '', seo: row.seo ?? {}};
    setArticle(stored);
    setSaved(JSON.stringify(stored));
    toast(
      status === 'draft'
        ? 'تم حفظ المسودة (غير ظاهرة للزوار)'
        : isFuture(stored.published_at)
          ? 'تمت الجدولة — يظهر المقال تلقائيًا في موعده'
          : 'تم النشر — المقال ظاهر على الموقع الآن'
    );
    if (!next.id) router.replace(`/admin/articles/edit/?id=${row.id}`);
  }

  return (
    <>
      <PageHeader
        title={article.id ? arOf(article.title) || 'تعديل مقال' : 'مقال جديد'}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {article.status === 'draft' ? <Badge>مسودة</Badge> : scheduled ? <Badge tone="blue">مجدول</Badge> : <Badge tone="green">منشور</Badge>}
            {dirty && <span>لديك تغييرات غير محفوظة</span>}
          </span>
        }
        actions={<BackLink />}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-6">
          <Card title="العنوان والغلاف">
            <FieldsEditor fields={articleFields} value={article} onChange={(v) => setArticle(v as Draft)} />
          </Card>

          <Card title="نص المقال" description="العناوين والقوائم والصور والروابط تظهر للزائر بنفس الشكل الذي تراه هنا.">
            <Tabs
              tabs={(['ar', 'en'] as const).map((l) => ({
                id: l,
                label: `${l === 'ar' ? 'العربية' : 'English'}${wordCount(article.content[l]) ? '' : ' (فارغ)'}`
              }))}
              active={lang}
              onChange={(l) => setLang(l as Lang)}
            />
            {/* Both editors stay mounted, so each keeps its own undo history while switching. */}
            {(['ar', 'en'] as const).map((l) => (
              <div key={`${l}-${revision}`} hidden={lang !== l}>
                <RichTextEditor
                  dir={l === 'ar' ? 'rtl' : 'ltr'}
                  label={`نص المقال (${l === 'ar' ? 'عربي' : 'English'})`}
                  value={article.content[l]}
                  onChange={(doc) => setArticle((a) => (a ? {...a, content: {...a.content, [l]: doc}} : a))}
                />
              </div>
            ))}
            <p className="mt-3 text-xs text-white/50">
              {wordCount(article.content[lang])} كلمة · مدة القراءة المحسوبة: {minutes} {minutes > 10 ? 'دقيقة' : 'دقائق'}. النسخة غير المكتوبة تعرض النص العربي.
            </p>
          </Card>

          <Card title="تحسين محركات البحث (SEO)" description="يظهر في نتائج جوجل ومشاركات واتساب/فيسبوك. يُطبَّق بعد إعادة بناء الموقع ورفعه.">
            <FieldsEditor fields={articleSeoFields} value={article.seo} onChange={(seo) => setArticle((a) => (a ? {...a, seo: seo as Draft['seo']} : a))} />
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20">
          <Card title="النشر">
            <div className="grid gap-5">
              <div>
                <Label htmlFor="published-at" hint="تاريخ مستقبلي = جدولة: يظهر المقال تلقائيًا في موعده.">
                  تاريخ النشر
                </Label>
                <TextInput
                  id="published-at"
                  type="datetime-local"
                  dir="ltr"
                  value={toLocalInput(article.published_at)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) setArticle((a) => (a ? {...a, published_at: new Date(value).toISOString()} : a));
                  }}
                />
              </div>
              <Toggle label="مقال مميز (أعلى صفحة المقالات)" checked={article.is_featured} onChange={(v) => setArticle((a) => (a ? {...a, is_featured: v} : a))} />
              {article.id && article.status === 'published' && !scheduled && !dirty && (
                <a
                  href={`/ar/articles/view/?slug=${encodeURIComponent(article.slug)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gold-300 hover:text-gold-200"
                >
                  <ExternalLink aria-hidden className="size-4" />
                  عرض المقال على الموقع
                </a>
              )}
            </div>
          </Card>
        </aside>
      </div>

      {problems.length > 0 && (
        <div className="mt-6">
          <Alert tone="error">
            <ul className="list-inside list-disc space-y-0.5">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      <div className="sticky bottom-0 z-20 mt-6 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-navy-950/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <span className="text-sm text-white/60">
          {uploading ? 'جارٍ رفع ملف…' : dirty ? 'لديك تغييرات غير محفوظة' : article.id ? 'كل التغييرات محفوظة' : 'مقال جديد لم يُحفظ بعد'}
        </span>
        <div className="flex flex-wrap gap-2">
          {dirty && article.id && (
            <Button
              variant="ghost"
              onClick={() => {
                if (!window.confirm('تجاهل كل التغييرات غير المحفوظة؟')) return;
                setArticle(JSON.parse(saved) as Draft);
                setProblems([]);
                setRevision((r) => r + 1);
              }}
            >
              <RotateCcw aria-hidden className="size-4" />
              تراجع
            </Button>
          )}
          {wasPublished ? (
            <>
              <Button variant="ghost" onClick={() => void save('draft')} disabled={saving || uploading}>
                <Undo2 aria-hidden className="size-4" />
                إخفاء (تحويل لمسودة)
              </Button>
              <Button variant="primary" onClick={() => void save('published')} loading={saving} disabled={uploading}>
                <Save aria-hidden className="size-4" />
                حفظ التغييرات
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => void save('draft')} loading={saving} disabled={uploading}>
                <Save aria-hidden className="size-4" />
                حفظ كمسودة
              </Button>
              <Button variant="primary" onClick={() => void save('published')} disabled={saving || uploading}>
                <Send aria-hidden className="size-4 rtl:-scale-x-100" />
                {isFuture(article.published_at) ? 'جدولة النشر' : 'نشر الآن'}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function BackLink() {
  return (
    <Link href="/admin/articles/" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white/75 hover:bg-white/5 hover:text-white">
      <ArrowRight aria-hidden className="size-4 ltr:-scale-x-100" />
      كل المقالات
    </Link>
  );
}
