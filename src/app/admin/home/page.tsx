'use client';

import {SingletonEditor} from '@/components/admin/SingletonEditor';
import {TabPanels} from '@/components/admin/TabPanels';
import {PageHeader} from '@/components/admin/ui';
import {heroFields, homeSections} from '@/lib/admin/schemas';

export default function HomeManagerPage() {
  return (
    <>
      <PageHeader
        title="الصفحة الرئيسية"
        description="الهيرو وأزراره وصورته، النبذة والفيديو، عدّادات الإحصائيات، العمليات المميزة، «لماذا تختارنا» وخطوات رحلة المريض. آراء المرضى والفيديوهات والمقالات والأسئلة تُدار من أقسامها."
      />
      <TabPanels
        tabs={[
          {
            id: 'hero',
            label: 'الهيرو و SEO',
            content: <SingletonEditor source={{table: 'hero_sections', match: {page: 'home'}}} fields={heroFields} title="هيرو الصفحة الرئيسية" />
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
