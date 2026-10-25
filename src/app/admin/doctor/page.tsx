'use client';

import {SingletonEditor} from '@/components/admin/SingletonEditor';
import {TabPanels} from '@/components/admin/TabPanels';
import {PageHeader} from '@/components/admin/ui';
import {doctorTabs} from '@/lib/admin/schemas';

export default function DoctorPage() {
  return (
    <>
      <PageHeader
        title="ملف الطبيب"
        description="الاسم والصور، رسالة الطبيب، المسيرة المهنية، الشهادات (مع صورها)، مجالات الخبرة والفيديو التعريفي — محتوى صفحة «عن الدكتور»."
      />
      <TabPanels
        tabs={doctorTabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
          content: <SingletonEditor source={{table: 'doctors_profile', match: {id: 1}}} fields={tab.fields} title={tab.label} />
        }))}
      />
    </>
  );
}
