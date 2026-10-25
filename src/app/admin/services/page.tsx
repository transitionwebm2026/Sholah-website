'use client';

import {useEffect, useState} from 'react';
import {CollectionManager} from '@/components/admin/CollectionManager';
import {SingletonEditor} from '@/components/admin/SingletonEditor';
import {TabPanels} from '@/components/admin/TabPanels';
import {Badge, PageHeader} from '@/components/admin/ui';
import {arOf, emptyL10n} from '@/lib/admin/fields';
import {procedureFields, serviceFields, servicesBlockFields, withSlug} from '@/lib/admin/schemas';
import {getAdminClient} from '@/lib/admin/supabase';

type Category = {id: string; title: {ar: string; en: string}};

export default function ServicesManagerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tick, setTick] = useState(0);

  // The procedures tab groups cards by specialty, so it needs the current list of specialties.
  useEffect(() => {
    let active = true;
    getAdminClient()
      .from('surgeries_services')
      .select('id,title')
      .order('sort_order')
      .then(({data}) => {
        if (active) setCategories((data ?? []) as Category[]);
      });
    return () => {
      active = false;
    };
  }, [tick]);

  return (
    <>
      <PageHeader
        title="الخدمات والعمليات"
        description="التخصصات الجراحية (المناظير، الفتق، الشرج والمستقيم، الغدد…)، وبطاقات العمليات داخل كل تخصص، وخطوات التشخيص في صفحة الخدمات."
      />
      <TabPanels
        tabs={[
          {
            id: 'categories',
            label: 'التخصصات',
            content: (
              <CollectionManager
                table="surgeries_services"
                title="التخصصات الجراحية"
                description="كل تخصص قسم كامل في صفحة الخدمات، ويظهر في الفوتر ونموذج الحجز."
                fields={serviceFields}
                newItem={() => ({title: emptyL10n(), summary: emptyL10n(), description: emptyL10n(), image_url: '', slug: '', is_published: true})}
                prepare={withSlug}
                onChanged={() => setTick((t) => t + 1)}
                itemTitle={(row) => arOf(row.title)}
                itemSubtitle={(row) => <span dir="ltr">#{String(row.slug)}</span>}
                itemImage={(row) => row.image_url as string}
                toggles={[{key: 'is_published', label: 'منشور'}]}
                addLabel="إضافة تخصص"
                wide
              />
            )
          },
          {
            id: 'procedures',
            label: 'العمليات (البطاقات)',
            content: categories.length ? (
              <CollectionManager
                table="surgery_procedures"
                title="بطاقات العمليات"
                description="اختر التخصص من التبويبات، ثم أضف أو رتّب عملياته."
                fields={procedureFields}
                filter={{key: 'service_id', options: categories.map((c) => ({value: c.id, label: arOf(c.title)}))}}
                newItem={() => ({title: emptyL10n(), description: emptyL10n(), image_url: '', slug: '', is_published: true})}
                prepare={withSlug}
                itemTitle={(row) => arOf(row.title)}
                itemSubtitle={(row) => (row.is_published === false ? <Badge>مخفية</Badge> : null)}
                itemImage={(row) => row.image_url as string}
                toggles={[{key: 'is_published', label: 'منشورة'}]}
                addLabel="إضافة عملية"
                wide
              />
            ) : (
              <p className="text-white/60">أضف تخصصًا أولًا.</p>
            )
          },
          {
            id: 'blocks',
            label: 'خطوات التشخيص والعناوين',
            content: (
              <SingletonEditor
                source={{table: 'page_sections', match: {key: 'services.blocks'}, column: 'content'}}
                fields={servicesBlockFields}
                title="أقسام صفحة الخدمات"
              />
            )
          }
        ]}
      />
    </>
  );
}
