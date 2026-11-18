'use client';

import {SingletonEditor} from '@/components/admin/SingletonEditor';
import {TabPanels} from '@/components/admin/TabPanels';
import {Alert, PageHeader} from '@/components/admin/ui';
import {contactBlockFields, gridBlockFields, heroFields, SEO_DESCRIPTION, seoFields} from '@/lib/admin/schemas';
import type {Field} from '@/lib/admin/fields';
import type {PageKey} from '@/lib/cms/types';

type PageTab = {page: Exclude<PageKey, 'home'>; label: string; blocks?: {key: string; fields: Field[]; title: string}};

const listBlock = (key: string) => ({key, fields: gridBlockFields, title: 'عنوان القائمة في الصفحة'});

const PAGES: PageTab[] = [
  {page: 'about', label: 'عن الدكتور'},
  {page: 'services', label: 'الخدمات'},
  {page: 'reviews', label: 'آراء المرضى', blocks: listBlock('reviews.blocks')},
  {page: 'videos', label: 'الفيديوهات', blocks: listBlock('videos.blocks')},
  {page: 'articles', label: 'المقالات', blocks: listBlock('articles.blocks')},
  {page: 'contact', label: 'تواصل معنا', blocks: {key: 'contact.blocks', fields: contactBlockFields, title: 'قسم أماكن ومواعيد الكشف'}}
];

export default function PagesManagerPage() {
  return (
    <>
      <PageHeader
        title="رؤوس الصفحات و SEO"
        description="لكل صفحة: الهيرو (العنوان والوصف والصورة والأزرار) وعنوان ووصف جوجل. هيرو الصفحة الرئيسية في «الصفحة الرئيسية»، وشريط الحجز في آخر كل صفحة في «شريط الحجز (CTA)»."
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
              <SingletonEditor source={{table: 'hero_sections', match: {page}}} fields={heroFields} title={`هيرو صفحة «${label}»`} />
              {blocks && (
                <SingletonEditor source={{table: 'page_sections', match: {key: blocks.key}, column: 'content'}} fields={blocks.fields} title={blocks.title} />
              )}
              <SingletonEditor source={{table: 'hero_sections', match: {page}}} fields={seoFields} title="تحسين محركات البحث (SEO)" description={SEO_DESCRIPTION} />
            </div>
          )
        }))}
      />
    </>
  );
}
