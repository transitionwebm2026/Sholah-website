'use client';

import {Clapperboard, Home, Inbox, Newspaper, Plus, Settings, Star} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useAdmin} from '@/components/admin/AdminShell';
import {Alert, Badge, Card, PageHeader, Spinner} from '@/components/admin/ui';
import {describeError, getAdminClient} from '@/lib/admin/supabase';
import type {LeadRow} from '@/lib/cms/types';

type Counts = {published: number; drafts: number; videos: number; reviews: number; newLeads: number; leads: number};

export default function DashboardPage() {
  const {session} = useAdmin();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [latest, setLatest] = useState<LeadRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const client = getAdminClient();
    const count = (table: string, filter?: [string, string]) => {
      let query = client.from(table).select('id', {count: 'exact', head: true});
      if (filter) query = query.eq(filter[0], filter[1]);
      return query;
    };
    Promise.all([
      count('articles', ['status', 'published']),
      count('articles', ['status', 'draft']),
      count('videos_gallery'),
      count('patient_reviews'),
      count('consultation_leads', ['status', 'new']),
      count('consultation_leads'),
      client.from('consultation_leads').select('*').order('created_at', {ascending: false}).limit(5)
    ]).then((results) => {
      if (!active) return;
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        setError(describeError(failed.error));
        return;
      }
      const [published, drafts, videos, reviews, newLeads, leads, recent] = results;
      setCounts({
        published: published.count ?? 0,
        drafts: drafts.count ?? 0,
        videos: videos.count ?? 0,
        reviews: reviews.count ?? 0,
        newLeads: newLeads.count ?? 0,
        leads: leads.count ?? 0
      });
      setLatest((recent.data ?? []) as LeadRow[]);
    });
    return () => {
      active = false;
    };
  }, []);

  const tiles = counts && [
    {href: '/admin/leads/', label: 'طلبات جديدة', value: counts.newLeads, sub: `من ${counts.leads} طلب`, icon: Inbox, highlight: counts.newLeads > 0},
    {href: '/admin/articles/', label: 'مقالات منشورة', value: counts.published, sub: counts.drafts ? `${counts.drafts} مسودة` : 'لا مسودات', icon: Newspaper},
    {href: '/admin/videos/', label: 'فيديوهات', value: counts.videos, sub: 'في المكتبة', icon: Clapperboard},
    {href: '/admin/reviews/', label: 'آراء المرضى', value: counts.reviews, sub: 'إجمالي', icon: Star}
  ];

  return (
    <>
      <PageHeader title="أهلًا بك 👋" description={<span dir="ltr">{session.user.email}</span>} />

      {error && (
        <div className="mb-6">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {!tiles && !error ? (
        <Spinner />
      ) : (
        tiles && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className={`group rounded-2xl border p-5 transition hover:-translate-y-0.5 ${tile.highlight ? 'border-gold-400/60 bg-gold-400/10' : 'border-white/10 bg-navy-900/60 hover:border-gold-400/40'}`}
              >
                <tile.icon aria-hidden className="size-6 text-gold-400" />
                <p className="mt-4 text-3xl font-bold tabular-nums">{tile.value}</p>
                <p className="mt-1 font-semibold">{tile.label}</p>
                <p className="text-xs text-white/50">{tile.sub}</p>
              </Link>
            ))}
          </div>
        )
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card
          title="أحدث طلبات الاستشارة"
          className="lg:col-span-3"
          actions={
            <Link href="/admin/leads/" className="text-sm font-semibold text-gold-300 hover:text-gold-200">
              عرض الكل
            </Link>
          }
        >
          {latest.length === 0 ? (
            <p className="text-sm text-white/55">لا توجد طلبات بعد. تصل الطلبات هنا من نموذج الحجز في صفحة التواصل.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {latest.map((lead) => (
                <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span>
                    <span className="font-semibold">{lead.name}</span>
                    <span dir="ltr" className="ms-2 text-sm text-white/60">
                      {lead.phone}
                    </span>
                    <span className="block text-xs text-white/50">{[lead.request_type, lead.service].filter(Boolean).join(' · ')}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {lead.status === 'new' && <Badge tone="gold">جديد</Badge>}
                    <time className="text-xs text-white/50" dateTime={lead.created_at}>
                      {new Date(lead.created_at).toLocaleString('ar-EG-u-nu-latn', {dateStyle: 'medium', timeStyle: 'short'})}
                    </time>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="اختصارات" className="lg:col-span-2">
          <div className="grid gap-2">
            {[
              {href: '/admin/articles/edit/', label: 'كتابة مقال جديد', icon: Plus},
              {href: '/admin/videos/', label: 'رفع فيديو', icon: Clapperboard},
              {href: '/admin/home/', label: 'تعديل الصفحة الرئيسية', icon: Home},
              {href: '/admin/settings/', label: 'الأرقام والعناوين والشعار', icon: Settings}
            ].map((item) => (
              <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 px-3 text-sm font-semibold hover:border-gold-400/50 hover:text-gold-200">
                <item.icon aria-hidden className="size-4 text-gold-400" />
                {item.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="متى تظهر التعديلات على الموقع؟">
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-white/75">
            <li>
              <strong className="text-white">فورًا بعد الحفظ:</strong> كل النصوص والصور والفيديوهات والآراء والأسئلة والإعدادات والمقالات الجديدة — يكفي أن يحدّث الزائر الصفحة.
            </li>
            <li>
              <strong className="text-white">بعد إعادة بناء الموقع ورفعه:</strong> عناوين ووصف الصفحات في جوجل (SEO)، خريطة الموقع، والروابط المختصرة للمقالات الجديدة. حتى ذلك الحين تعمل المقالات الجديدة على رابط مؤقت تلقائيًا.
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
