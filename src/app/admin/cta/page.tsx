'use client';

import {SingletonEditor} from '@/components/admin/SingletonEditor';
import {TabPanels} from '@/components/admin/TabPanels';
import {Alert, PageHeader} from '@/components/admin/ui';
import {ctaBandFields} from '@/lib/admin/schemas';
import type {PageKey} from '@/lib/cms/types';

/** The booking band at the bottom of every page: the `cta_band` column of each hero_sections row. */
const PAGES: Array<{page: PageKey; label: string; note?: string}> = [
  {page: 'home', label: 'الرئيسية'},
  {page: 'about', label: 'عن الدكتور'},
  {page: 'services', label: 'الخدمات'},
  {page: 'reviews', label: 'آراء المرضى'},
  {page: 'videos', label: 'الفيديوهات'},
  {page: 'articles', label: 'المقالات', note: 'نفس الشريط يظهر أسفل صفحة المقالات وأسفل كل مقال.'},
  {page: 'contact', label: 'تواصل معنا', note: 'بدون أزرار = «اتصل الآن» + واتساب بدل «تواصل معنا»، لأن الزائر في صفحة التواصل بالفعل.'}
];

export default function CtaManagerPage() {
  return (
    <>
      <PageHeader
        title="شريط الحجز (CTA)"
        description="الشريط الكحلي في آخر كل صفحة قبل الفوتر: العنوان الصغير والعنوان والنص والأزرار. اختر الصفحة من التبويبات."
      />
      <div className="mb-6">
        <Alert>يظهر التعديل على الموقع فورًا بعد الحفظ. امسح العنوان لإخفاء الشريط من صفحة معيّنة.</Alert>
      </div>
      <TabPanels
        tabs={PAGES.map(({page, label, note}) => ({
          id: page,
          label,
          content: (
            <SingletonEditor
              source={{table: 'hero_sections', match: {page}, column: 'cta_band'}}
              fields={ctaBandFields}
              title={`شريط الحجز أسفل صفحة «${label}»`}
              description={note}
            />
          )
        }))}
      />
    </>
  );
}
