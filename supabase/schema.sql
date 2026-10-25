-- =====================================================================================
--  Dr. Ahmed Shoulah — CMS schema for Supabase
--
--  Run in Supabase Dashboard → SQL Editor → New query → paste → Run.
--  Idempotent: safe to run again after edits (tables use IF NOT EXISTS, policies are
--  dropped and recreated). Then run `supabase/seed.sql` once to load the current content.
--
--  Conventions
--  • Translatable text is a jsonb object: {"ar": "…", "en": "…"}.
--  • Media columns (`*_url`) hold either a Supabase Storage public URL or a site path
--    such as `/media/doctor/portrait.jpg` (the bundled default images).
--  • Security model: anyone (anon) may READ published content and INSERT a consultation
--    lead; only users listed in `admin_users` may write anything. Disable public sign-ups
--    in Authentication → Providers → Email so nobody else can create an account.
-- =====================================================================================

-- ---------- Admins & helpers ---------------------------------------------------------

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so RLS policies can call it without recursing into admin_users' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Global settings (single row, id = 1) --------------------------------------

create table if not exists public.site_settings (
  id                 smallint primary key default 1 constraint site_settings_singleton check (id = 1),
  site_name          jsonb not null default '{"ar":"","en":""}',
  logo_header_url    text,
  logo_footer_url    text,
  -- [{"value":"+201000000000","display":"+20 100 000 0000"}]
  phones             jsonb not null default '[]',
  -- International format, digits only (wa.me), e.g. 201000000000
  whatsapp_number    text  not null default '' check (whatsapp_number ~ '^[0-9]*$'),
  whatsapp_greeting  jsonb not null default '{"ar":"","en":""}',
  email              text,
  -- [{"network":"Facebook|Instagram|YouTube|TikTok|X|LinkedIn|Snapchat","url":"https://…"}]
  social_links       jsonb not null default '[]',
  -- [{"id","name":{ar,en},"address":{ar,en},"phone","map_embed_url","directions_url","lat","lng"}]
  branches           jsonb not null default '[]',
  -- [{"days":{ar,en},"time":{ar,en}}] — shown on the site
  working_hours      jsonb not null default '[]',
  -- [{"days":["Saturday",…],"opens":"17:00","closes":"22:00"}] — structured copy for Google (JSON-LD)
  opening_hours_spec jsonb not null default '[]',
  -- [{"label":{ar,en},"href":"/about","visible":true}]
  nav_links          jsonb not null default '[]',
  -- {"about":{ar,en},"copyright":{ar,en},"disclaimer":{ar,en},"quick_links":[{"label":{ar,en},"href"}]}
  footer             jsonb not null default '{}',
  updated_at         timestamptz not null default now(),
  constraint site_settings_arrays check (
    jsonb_typeof(phones) = 'array' and jsonb_typeof(social_links) = 'array' and jsonb_typeof(branches) = 'array'
    and jsonb_typeof(working_hours) = 'array' and jsonb_typeof(opening_hours_spec) = 'array'
    and jsonb_typeof(nav_links) = 'array' and jsonb_typeof(footer) = 'object'
  )
);

-- ---------- Page headers: hero, bottom call-to-action band and SEO, one row per page -----

create table if not exists public.hero_sections (
  page             text primary key
                   check (page in ('home', 'about', 'services', 'reviews', 'videos', 'articles', 'contact')),
  eyebrow          jsonb not null default '{"ar":"","en":""}',
  -- Words wrapped in *asterisks* are highlighted in gold.
  title            jsonb not null default '{"ar":"","en":""}',
  description      jsonb not null default '{"ar":"","en":""}',
  -- Background portrait; empty → the doctor's photo.
  image_url        text,
  -- [{"label":{ar,en},"href":"/contact | #booking | whatsapp | tel | https://…","style":"primary|outline|whatsapp"}]
  buttons          jsonb not null default '[]' check (jsonb_typeof(buttons) = 'array'),
  -- {"title":{ar,en},"text":{ar,en}}
  cta_band         jsonb not null default '{}' check (jsonb_typeof(cta_band) = 'object'),
  meta_title       jsonb not null default '{"ar":"","en":""}',
  meta_description jsonb not null default '{"ar":"","en":""}',
  updated_at       timestamptz not null default now()
);

-- ---------- Free-form page blocks (home sections, stats, section headings) ---------------
-- Keys used by the site: home.about, home.surgeries, home.why, home.journey, home.blocks, stats,
-- services.blocks, reviews.blocks, videos.blocks, articles.blocks.

create table if not exists public.page_sections (
  key        text primary key check (key ~ '^[a-z]+(\.[a-z_]+)?$'),
  content    jsonb not null default '{}' check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);

-- ---------- Doctor profile (single row, id = 1) ---------------------------------------

create table if not exists public.doctors_profile (
  id                smallint primary key default 1 constraint doctors_profile_singleton check (id = 1),
  name              jsonb not null default '{"ar":"","en":""}',
  short_name        jsonb not null default '{"ar":"","en":""}',
  title             jsonb not null default '{"ar":"","en":""}',
  credentials       jsonb not null default '{"ar":"","en":""}',
  image_alt         jsonb not null default '{"ar":"","en":""}',
  photo_url         text,
  message_photo_url text,
  -- {"eyebrow","title","paragraphs":[{ar,en}],"signature"}
  message           jsonb not null default '{}',
  -- [{"year":"2014","title":{ar,en},"place":{ar,en}}]
  timeline          jsonb not null default '[]',
  -- [{"title":{ar,en},"issuer":{ar,en},"year":"2014","image_url"}]
  certificates      jsonb not null default '[]',
  -- [{"icon","title":{ar,en},"description":{ar,en},"href":"/services#hernia"}]
  expertise         jsonb not null default '[]',
  -- {"title":{ar,en},"url":"<YouTube link or uploaded file>","thumbnail_url"}
  intro_video       jsonb not null default '{}',
  -- Section headings on the About page: {"career":{eyebrow,title},"intro_video":{…},"expertise":{…,"cta"},"certificates":{…},"achievements":{…}}
  headings          jsonb not null default '{}',
  updated_at        timestamptz not null default now(),
  constraint doctors_profile_arrays check (
    jsonb_typeof(timeline) = 'array' and jsonb_typeof(certificates) = 'array' and jsonb_typeof(expertise) = 'array'
  )
);

-- ---------- Services: categories → procedures (detail cards) ---------------------------

create table if not exists public.surgeries_services (
  id           uuid primary key default gen_random_uuid(),
  -- Also the anchor on /services (#laparoscopic).
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title        jsonb not null default '{"ar":"","en":""}',
  summary      jsonb not null default '{"ar":"","en":""}',
  description  jsonb not null default '{"ar":"","en":""}',
  image_url    text,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.surgery_procedures (
  id           uuid primary key default gen_random_uuid(),
  service_id   uuid not null references public.surgeries_services (id) on delete cascade,
  slug         text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title        jsonb not null default '{"ar":"","en":""}',
  description  jsonb not null default '{"ar":"","en":""}',
  image_url    text,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (service_id, slug)
);

create index if not exists surgery_procedures_service_idx on public.surgery_procedures (service_id, sort_order);

-- ---------- Articles ------------------------------------------------------------------

create table if not exists public.articles (
  id           uuid primary key default gen_random_uuid(),
  -- "view" is reserved for the client-side page that shows articles added after the last build.
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug <> 'view'),
  category     jsonb not null default '{"ar":"","en":""}',
  title        jsonb not null default '{"ar":"","en":""}',
  excerpt      jsonb not null default '{"ar":"","en":""}',
  -- Rich text as editor (Tiptap/ProseMirror) JSON documents: {"ar": {"type":"doc",…}, "en": {…}}
  content      jsonb not null default '{"ar":null,"en":null}',
  cover_url    text,
  is_featured  boolean not null default false,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz not null default now(),
  read_minutes smallint not null default 4 check (read_minutes between 1 and 120),
  -- {"title":{ar,en},"description":{ar,en}} — empty → title / excerpt
  seo          jsonb not null default '{}' check (jsonb_typeof(seo) = 'object'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists articles_published_idx on public.articles (status, published_at desc);

-- ---------- Videos ----------------------------------------------------------------------

create table if not exists public.videos_gallery (
  id            uuid primary key default gen_random_uuid(),
  title         jsonb not null default '{"ar":"","en":""}',
  description   jsonb not null default '{"ar":"","en":""}',
  -- upload: file in the `videos` bucket · youtube: any YouTube link · external: direct .mp4/.webm link
  source        text not null default 'upload' check (source in ('upload', 'youtube', 'external')),
  -- Empty → the card shows "available soon".
  video_url     text not null default '',
  thumbnail_url text not null check (thumbnail_url <> ''),
  orientation   text not null default 'portrait' check (orientation in ('portrait', 'landscape')),
  duration      text,
  is_featured   boolean not null default false,
  is_published  boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- Patient reviews -----------------------------------------------------------

create table if not exists public.patient_reviews (
  id           uuid primary key default gen_random_uuid(),
  patient_name jsonb not null default '{"ar":"","en":""}',
  procedure    jsonb not null default '{"ar":"","en":""}',
  review_text  jsonb not null default '{"ar":"","en":""}',
  rating       smallint not null default 5 check (rating between 1 and 5),
  is_visible   boolean not null default true,
  show_on_home boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- FAQs ------------------------------------------------------------------------

create table if not exists public.faqs (
  id         uuid primary key default gen_random_uuid(),
  page       text not null default 'home' check (page in ('home', 'services')),
  question   jsonb not null default '{"ar":"","en":""}',
  answer     jsonb not null default '{"ar":"","en":""}',
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_page_idx on public.faqs (page, sort_order);

-- ---------- Consultation leads (contact form) ------------------------------------------

create table if not exists public.consultation_leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(btrim(name)) between 2 and 120),
  phone        text not null check (phone ~ '^[0-9+()\s-]{6,30}$'),
  age          smallint check (age between 1 and 120),
  request_type text check (char_length(request_type) <= 80),
  service      text check (char_length(service) <= 200),
  clinic       text check (char_length(clinic) <= 200),
  message      text check (char_length(message) <= 3000),
  locale       text check (locale in ('ar', 'en')),
  status       text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed')),
  admin_notes  text check (char_length(admin_notes) <= 3000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists consultation_leads_created_idx on public.consultation_leads (created_at desc);

-- Drops exact double-submits (same phone within a minute) and caps floods at 60 leads per 10 minutes.
create or replace function public.guard_consultation_lead()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.consultation_leads
    where phone = new.phone and created_at > now() - interval '1 minute'
  ) then
    raise exception 'duplicate lead' using errcode = 'P0001';
  end if;
  if (select count(*) from public.consultation_leads where created_at > now() - interval '10 minutes') >= 60 then
    raise exception 'too many leads, try again later' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists consultation_leads_guard on public.consultation_leads;
create trigger consultation_leads_guard
  before insert on public.consultation_leads
  for each row execute function public.guard_consultation_lead();

-- ---------- updated_at triggers -------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'site_settings', 'hero_sections', 'page_sections', 'doctors_profile', 'surgeries_services',
    'surgery_procedures', 'articles', 'videos_gallery', 'patient_reviews', 'faqs', 'consultation_leads'
  ] loop
    execute format('drop trigger if exists %I on public.%I', t || '_touch', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.touch_updated_at()',
      t || '_touch', t
    );
  end loop;
end;
$$;

-- ---------- Privileges (RLS below decides which rows) ----------------------------------

grant usage on schema public to anon, authenticated;

grant select on
  public.site_settings, public.hero_sections, public.page_sections, public.doctors_profile,
  public.surgeries_services, public.surgery_procedures, public.articles, public.videos_gallery,
  public.patient_reviews, public.faqs
to anon, authenticated;

grant insert on public.consultation_leads to anon, authenticated;

grant select, insert, update, delete on
  public.site_settings, public.hero_sections, public.page_sections, public.doctors_profile,
  public.surgeries_services, public.surgery_procedures, public.articles, public.videos_gallery,
  public.patient_reviews, public.faqs, public.consultation_leads
to authenticated;

grant select on public.admin_users to authenticated;

-- ---------- Row Level Security --------------------------------------------------------

alter table public.admin_users        enable row level security;
alter table public.site_settings      enable row level security;
alter table public.hero_sections      enable row level security;
alter table public.page_sections      enable row level security;
alter table public.doctors_profile    enable row level security;
alter table public.surgeries_services enable row level security;
alter table public.surgery_procedures enable row level security;
alter table public.articles           enable row level security;
alter table public.videos_gallery     enable row level security;
alter table public.patient_reviews    enable row level security;
alter table public.faqs               enable row level security;
alter table public.consultation_leads enable row level security;

-- Admins can see who else is an admin. Adding/removing admins is done in the SQL editor only.
drop policy if exists "admins read admin list" on public.admin_users;
create policy "admins read admin list" on public.admin_users
  for select to authenticated using ((select public.is_admin()));

-- Public read: everything a visitor may see. Several SELECT policies are OR-ed, so the
-- "admin full access" policy below also lets admins see drafts and hidden rows.
do $$
declare
  t text;
  visible text;
begin
  for t, visible in
    select * from (values
      ('site_settings',      'true'),
      ('hero_sections',      'true'),
      ('page_sections',      'true'),
      ('doctors_profile',    'true'),
      ('surgeries_services', 'is_published'),
      ('surgery_procedures', 'is_published and exists (select 1 from public.surgeries_services s where s.id = service_id and s.is_published)'),
      ('articles',           'status = ''published'' and published_at <= now()'),
      ('videos_gallery',     'is_published'),
      ('patient_reviews',    'is_visible'),
      ('faqs',               'is_visible')
    ) as v(t, visible)
  loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (%s)', t, visible);
  end loop;

  foreach t in array array[
    'site_settings', 'hero_sections', 'page_sections', 'doctors_profile', 'surgeries_services',
    'surgery_procedures', 'articles', 'videos_gallery', 'patient_reviews', 'faqs', 'consultation_leads'
  ] loop
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format(
      'create policy "admin full access" on public.%I for all to authenticated
         using ((select public.is_admin())) with check ((select public.is_admin()))',
      t
    );
  end loop;
end;
$$;

-- Visitors may only create brand-new leads; they can never read, edit or triage them.
drop policy if exists "visitors submit leads" on public.consultation_leads;
create policy "visitors submit leads" on public.consultation_leads
  for insert to anon, authenticated
  with check (status = 'new' and admin_notes is null);

-- ---------- Storage: public buckets, admin-only writes ---------------------------------
-- Free plan: the project-wide upload limit is 50 MB per file. On Pro you can raise
-- `file_size_limit` for `videos` (and the global limit in Storage settings).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('images', 'images', true, 10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']),
  ('videos', 'videos', true, 52428800,
    array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cms media: admins read"   on storage.objects;
drop policy if exists "cms media: admins upload" on storage.objects;
drop policy if exists "cms media: admins update" on storage.objects;
drop policy if exists "cms media: admins delete" on storage.objects;

-- Public files are served by URL without any policy; this one only enables listing for admins.
create policy "cms media: admins read" on storage.objects
  for select to authenticated
  using (bucket_id in ('images', 'videos') and (select public.is_admin()));

create policy "cms media: admins upload" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('images', 'videos') and (select public.is_admin()));

create policy "cms media: admins update" on storage.objects
  for update to authenticated
  using (bucket_id in ('images', 'videos') and (select public.is_admin()))
  with check (bucket_id in ('images', 'videos') and (select public.is_admin()));

create policy "cms media: admins delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('images', 'videos') and (select public.is_admin()));

-- =====================================================================================
--  Make yourself an admin (after creating the user in Authentication → Users → Add user):
--
--    insert into public.admin_users (user_id)
--    select id from auth.users where email = 'doctor@example.com'
--    on conflict do nothing;
-- =====================================================================================
