-- Clinic locations & weekly schedule + the doctor's current positions (2026-11-17).
-- Run once in Supabase → SQL Editor. Afterwards everything stays editable in the dashboard:
-- Global settings → «الفروع والمواعيد», Doctor profile, and Pages → «تواصل معنا».

begin;

-- 1) Locations with their visiting days and times. Replaces the branch list and clears the old
--    general hours (placeholders); the site now shows each branch's own schedule.
update public.site_settings
set branches = '[{"id":"main","name":{"ar":"عيادة مصر الجديدة","en":"Heliopolis Clinic"},"note":{"ar":"العيادة الخاصة","en":"Private clinic"},"address":{"ar":"158 شارع النزهة، أمام بنك مصر، مصر الجديدة، القاهرة","en":"158 El Nozha St., opposite Banque Misr, Heliopolis, Cairo"},"schedule":[{"days":["Saturday","Monday","Wednesday"],"opens":"18:00","closes":""}],"phone":"","map_embed_url":"https://maps.google.com/maps?cid=18292072633551991028&z=16&output=embed","directions_url":"https://maps.app.goo.gl/WeB1zZmkWecV8hT58","lat":30.1043821,"lng":31.3430925},{"id":"nasayem","name":{"ar":"مستشفى نسايم – التجمع الخامس","en":"Nasayem Hospital – Fifth Settlement"},"note":{"ar":"","en":""},"address":{"ar":"","en":""},"schedule":[{"days":["Saturday"],"opens":"20:00","closes":""},{"days":["Monday"],"opens":"14:00","closes":""}],"phone":"","map_embed_url":"","directions_url":"","lat":null,"lng":null},{"id":"nasr-city","name":{"ar":"مستشفى مدينة نصر التخصصي","en":"Nasr City Specialized Hospital"},"note":{"ar":"","en":""},"address":{"ar":"","en":""},"schedule":[{"days":["Saturday"],"opens":"16:00","closes":""},{"days":["Thursday"],"opens":"20:00","closes":""}],"phone":"","map_embed_url":"","directions_url":"","lat":null,"lng":null},{"id":"benha","name":{"ar":"مركز تيوليب – بنها","en":"Tulip Center – Benha"},"note":{"ar":"","en":""},"address":{"ar":"","en":""},"schedule":[{"days":["Sunday"],"opens":"18:00","closes":""},{"days":["Thursday"],"opens":"16:00","closes":""}],"phone":"","map_embed_url":"","directions_url":"","lat":null,"lng":null},{"id":"police","name":{"ar":"أكاديمية الشرطة بالتجمع الخامس ومستشفى الشرطة التخصصي","en":"Police Academy (Fifth Settlement) & Police Specialized Hospital"},"note":{"ar":"استشاري جراحة التجميل","en":"Consultant plastic surgeon"},"address":{"ar":"","en":""},"schedule":[{"days":[],"opens":"12:00","closes":"14:00"}],"phone":"","map_embed_url":"","directions_url":"","lat":null,"lng":null},{"id":"cleopatra","name":{"ar":"مستشفى كليوباترا الكاتب – الدقي","en":"Cleopatra El Katib Hospital – Dokki"},"note":{"ar":"طوارئ جراحة التجميل","en":"Plastic surgery emergencies"},"address":{"ar":"","en":""},"schedule":[],"phone":"","map_embed_url":"","directions_url":"","lat":null,"lng":null}]'::jsonb,
    working_hours = '[]'::jsonb,
    opening_hours_spec = '[]'::jsonb
where id = 1;

-- 2) Heading of the contact page's "where & when" section (kept if it was already edited).
insert into public.page_sections (key, content)
values ('contact.blocks', '{"schedule":{"eyebrow":{"ar":"أماكن الكشف","en":"Where to find us"},"title":{"ar":"مواعيد الكشف خلال الأسبوع","en":"Weekly clinic schedule"},"description":{"ar":"يستقبل الدكتور المرضى في العيادة الخاصة بمصر الجديدة وفي عدد من المستشفيات بالقاهرة وبنها. اختر اليوم والمكان الأنسب لك، ثم احجز موعدك مسبقًا.","en":"The doctor sees patients at the private clinic in Heliopolis and at several hospitals in Cairo and Benha. Pick the day and place that suit you, then book your visit in advance."}}}'::jsonb)
on conflict (key) do nothing;

-- 3) Doctor: current title, and the current positions in the About-page timeline. Earlier
--    timeline entries (degrees) are kept as they are; only the position entries are replaced (safe to run again).
update public.doctors_profile
set title = '{"ar":"أستاذ مساعد جراحة التجميل والإصلاح والحروق","en":"Assistant Professor of Plastic, Reconstructive & Burn Surgery"}'::jsonb,
    credentials = '{"ar":"أستاذ مساعد جراحة التجميل والإصلاح والحروق بكلية الطب – جامعة بنها، ومحاضر بجامعة بنها الأهلية بالعبور، واستشاري جراحة التجميل بأكاديمية الشرطة ومستشفى الشرطة التخصصي.","en":"Assistant Professor of Plastic, Reconstructive & Burn Surgery at the Faculty of Medicine, Benha University; lecturer at Benha National University (Obour); consultant plastic surgeon at the Police Academy and the Police Specialized Hospital."}'::jsonb,
    timeline = coalesce(
      (
        select jsonb_agg(entry order by position)
        from jsonb_array_elements(timeline) with ordinality as t(entry, position)
        where btrim(entry -> 'title' ->> 'ar') not in ('استاذ مساعد جراحة التجميل والاصلاح والحروق', 'أستاذ مساعد جراحة التجميل والإصلاح والحروق', 'استشاري جراحة التجميل', 'محاضر')
      ),
      '[]'::jsonb
    ) || '[{"year":"","title":{"ar":"أستاذ مساعد جراحة التجميل والإصلاح والحروق","en":"Assistant Professor of Plastic, Reconstructive & Burn Surgery"},"place":{"ar":"كلية الطب – جامعة بنها","en":"Faculty of Medicine, Benha University"}},{"year":"","title":{"ar":"محاضر","en":"Lecturer"},"place":{"ar":"جامعة بنها الأهلية – العبور","en":"Benha National University – Obour"}},{"year":"","title":{"ar":"استشاري جراحة التجميل","en":"Consultant Plastic Surgeon"},"place":{"ar":"أكاديمية الشرطة بالتجمع الخامس ومستشفى الشرطة التخصصي","en":"Police Academy (Fifth Settlement) & Police Specialized Hospital"}}]'::jsonb
where id = 1;

commit;
