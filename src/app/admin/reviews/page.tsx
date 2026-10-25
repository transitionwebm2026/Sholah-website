'use client';

import {CollectionManager} from '@/components/admin/CollectionManager';
import {PageHeader} from '@/components/admin/ui';
import {arOf, emptyL10n} from '@/lib/admin/fields';
import {reviewFields} from '@/lib/admin/schemas';

export default function ReviewsManagerPage() {
  return (
    <>
      <PageHeader
        title="آراء المرضى"
        description="انشر آراء حقيقية فقط وبموافقة أصحابها. «ظاهر» يتحكم في صفحة الآراء، و«في السلايدر» في سلايدر الصفحة الرئيسية."
      />
      <CollectionManager
        table="patient_reviews"
        title="الآراء"
        fields={reviewFields}
        newItem={() => ({patient_name: emptyL10n(), procedure: emptyL10n(), review_text: emptyL10n(), rating: 5, is_visible: true, show_on_home: true})}
        prepare={(row) => ({...row, rating: Number(row.rating) || 5})}
        itemTitle={(row) => arOf(row.patient_name)}
        itemSubtitle={(row) => (
          <>
            <span className="text-gold-300">{'★'.repeat(Number(row.rating) || 5)}</span> · {arOf(row.procedure)}
          </>
        )}
        toggles={[
          {key: 'is_visible', label: 'ظاهر'},
          {key: 'show_on_home', label: 'في السلايدر'}
        ]}
        addLabel="إضافة رأي"
      />
    </>
  );
}
