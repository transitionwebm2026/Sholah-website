'use client';

import {CollectionManager} from '@/components/admin/CollectionManager';
import {PageHeader} from '@/components/admin/ui';
import {arOf, emptyL10n} from '@/lib/admin/fields';
import {faqFields} from '@/lib/admin/schemas';

export default function FaqsManagerPage() {
  return (
    <>
      <PageHeader
        title="الأسئلة الشائعة"
        description="الأسئلة مقسّمة حسب الصفحة التي تظهر فيها. تُضاف تلقائيًا لنتائج جوجل كأسئلة شائعة (FAQ)."
      />
      <CollectionManager
        table="faqs"
        title="الأسئلة"
        fields={faqFields}
        filter={{
          key: 'page',
          options: [
            {value: 'home', label: 'الصفحة الرئيسية'},
            {value: 'services', label: 'صفحة الخدمات'}
          ]
        }}
        newItem={() => ({question: emptyL10n(), answer: emptyL10n(), is_visible: true})}
        itemTitle={(row) => arOf(row.question)}
        toggles={[{key: 'is_visible', label: 'ظاهر'}]}
        addLabel="إضافة سؤال"
      />
    </>
  );
}
