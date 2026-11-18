'use client';

import {SingletonEditor} from '@/components/admin/SingletonEditor';
import {TabPanels} from '@/components/admin/TabPanels';
import {PageHeader} from '@/components/admin/ui';
import {heroFields, homeSections, SEO_DESCRIPTION, seoFields} from '@/lib/admin/schemas';

export default function HomeManagerPage() {
  return (
    <>
      <PageHeader
        title="الصفحة الرئيسية"
        description="الهيرو وأزراره وصورته، النبذة والفيديو، عدّادات الإحصائيات، اختيار الخدمات المعروضة، «لماذا تختارنا» وخطوات رحلة المريض، وعناوين باقي الأقسام. شريط الحجز في آخر الصفحة له قسمه «شريط الحجز (CTA)». محتوى بطاقات الخدمات وآراء المرضى والفيديوهات والمقالات والأسئلة يُدار من أقسامها."
      />
      <TabPanels
        tabs={[
          {
            id: 'hero',
            label: 'الهيرو و SEO',
            content: (
              <div className="space-y-6">
                <SingletonEditor source={{table: 'hero_sections', match: {page: 'home'}}} fields={heroFields} title="هيرو الصفحة الرئيسية" />
                <SingletonEditor
                  source={{table: 'hero_sections', match: {page: 'home'}}}
                  fields={seoFields}
                  title="تحسين محركات البحث (SEO)"
                  description={SEO_DESCRIPTION}
                />
              </div>
            )
          },
          ...homeSections.map((section) => ({
            id: section.id,
            label: section.label,
            content: (
              <SingletonEditor source={{table: 'page_sections', match: {key: section.key}, column: 'content'}} fields={section.fields} title={section.label} />
            )
          }))
        ]}
      />
    </>
  );
}
