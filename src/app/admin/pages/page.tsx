'use client';

import {SingletonEditor} from '@/components/admin/SingletonEditor';
import {TabPanels} from '@/components/admin/TabPanels';
import {Alert, PageHeader} from '@/components/admin/ui';
import {gridBlockFields, heroFields} from '@/lib/admin/schemas';
import type {PageKey} from '@/lib/cms/types';

const PAGES: Array<{page: Exclude<PageKey, 'home'>; label: string; blocks?: string}> = [
  {page: 'about', label: 'عن الدكتور'},
  {page: 'services', label: 'الخدمات'},
  {page: 'reviews', label: 'آراء المرضى', blocks: 'reviews.blocks'},
  {page: 'videos', label: 'الفيديوهات', blocks: 'videos.blocks'},
  {page: 'articles', label: 'المقالات', blocks: 'articles.blocks'},
  {page: 'contact', label: 'تواصل معنا'}
];

export default function PagesManagerPage() {
  return (
    <>
      <PageHeader
        title="رؤوس الصفحات و SEO"
        description="لكل صفحة: الهيرو (العنوان والوصف والصورة والأزرار)، شريط «احجز الآن» في أسفلها، وعنوان ووصف جوجل. هيرو الصفحة الرئيسية في «الصفحة الرئيسية»."
      />
      <div className="mb-6">
        <Alert>
          يظهر أي تعديل في محتوى الصفحات فورًا بعد الحفظ. أما عنوان ووصف جوجل (SEO) فيُكتب داخل ملفات الموقع، فيظهر لمحركات البحث بعد إعادة بناء الموقع ورفعه.
        </Alert>
      </div>
      <TabPanels
        tabs={PAGES.map(({page, label, blocks}) => ({
          id: page,
          label,
          content: (
            <div className="space-y-6">
              <SingletonEditor source={{table: 'hero_sections', match: {page}}} fields={heroFields} title={`صفحة «${label}»`} />
              {blocks && (
                <SingletonEditor source={{table: 'page_sections', match: {key: blocks}, column: 'content'}} fields={gridBlockFields} title="عنوان القائمة في الصفحة" />
              )}
            </div>
          )
        }))}
      />
    </>
  );
}
