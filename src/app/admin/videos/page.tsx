'use client';

import {CollectionManager} from '@/components/admin/CollectionManager';
import {Badge, PageHeader} from '@/components/admin/ui';
import {arOf, emptyL10n} from '@/lib/admin/fields';
import {videoFields, withVideoSource} from '@/lib/admin/schemas';
import {youtubeId} from '@/lib/cms/media';

export default function VideosManagerPage() {
  return (
    <>
      <PageHeader
        title="الفيديوهات"
        description="ارفع الفيديو من جهازك أو الصق رابط يوتيوب، ثم ارفع صورة الغلاف (إلزامية). رتّب الفيديوهات بالأسهم، واختر ما يظهر في الصفحة الرئيسية."
      />
      <CollectionManager
        table="videos_gallery"
        title="مكتبة الفيديو"
        fields={videoFields}
        newItem={() => ({
          title: emptyL10n(),
          description: emptyL10n(),
          video_url: '',
          thumbnail_url: '',
          orientation: 'portrait',
          duration: '',
          is_featured: false,
          is_published: true
        })}
        prepare={withVideoSource}
        itemTitle={(row) => arOf(row.title)}
        itemSubtitle={(row) => (
          <span className="flex flex-wrap gap-1.5">
            <Badge tone={row.video_url ? 'blue' : 'neutral'}>
              {!row.video_url ? 'بدون فيديو (قريبًا)' : youtubeId(String(row.video_url)) ? 'يوتيوب' : 'ملف مرفوع'}
            </Badge>
            <Badge>{row.orientation === 'landscape' ? 'أفقي' : 'عمودي'}</Badge>
            {row.duration ? <Badge>{String(row.duration)}</Badge> : null}
          </span>
        )}
        itemImage={(row) => row.thumbnail_url as string}
        toggles={[
          {key: 'is_published', label: 'منشور'},
          {key: 'is_featured', label: 'في الرئيسية'}
        ]}
        addLabel="إضافة فيديو"
        wide
      />
    </>
  );
}
