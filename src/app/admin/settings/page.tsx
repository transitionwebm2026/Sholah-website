'use client';

import {SingletonEditor} from '@/components/admin/SingletonEditor';
import {TabPanels} from '@/components/admin/TabPanels';
import {PageHeader} from '@/components/admin/ui';
import {settingsTabs} from '@/lib/admin/schemas';

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="الإعدادات العامة"
        description="الشعار، أرقام التواصل وواتساب، الفروع وخرائط جوجل، مواعيد العمل، روابط النافبار ومحتوى الفوتر. تظهر التعديلات في كل صفحات الموقع."
      />
      <TabPanels
        tabs={settingsTabs.map((tab) => ({
          id: tab.id,
          label: tab.label,
          content: <SingletonEditor source={{table: 'site_settings', match: {id: 1}}} fields={tab.fields} title={tab.label} />
        }))}
      />
    </>
  );
}
