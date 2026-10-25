/*
 * Build-time CMS access (server components, generateMetadata, generateStaticParams, sitemap).
 * Never import this from a client component: it bundles the seed content.
 *
 * - Supabase configured → reads it (anon role, so exactly what visitors may see). A failing request
 *   fails the build loudly instead of silently publishing stale content.
 * - Not configured → the bundled default content (`seed.json`, the same rows as supabase/seed.sql).
 */
import type {Locale} from '@/i18n/routing';
import {datasetLoader, fetchDataset, type DatasetName, type Datasets} from './data';
import {cmsConfigured} from './rest';
import seedJson from './seed.json';
import type {
  ArticleRow,
  DoctorRow,
  FaqRow,
  HeroRow,
  ProcedureRow,
  ReviewRow,
  SectionRow,
  ServiceRow,
  SettingsRow,
  VideoRow
} from './types';
import {loadView, type ViewKey, type Views} from './views';

type Seed = {
  site_settings: SettingsRow;
  doctors_profile: DoctorRow;
  hero_sections: HeroRow[];
  page_sections: SectionRow[];
  surgeries_services: ServiceRow[];
  surgery_procedures: ProcedureRow[];
  articles: ArticleRow[];
  videos_gallery: VideoRow[];
  patient_reviews: ReviewRow[];
  faqs: FaqRow[];
};

const seed = seedJson as unknown as Seed;

const bySortOrder = <T extends {sort_order: number}>(rows: T[]) => [...rows].sort((a, b) => a.sort_order - b.sort_order);

/** The seed filtered like the RLS "public read" policies, so fallback builds match production. */
function seedDataset<N extends DatasetName>(name: N, slug?: string): Datasets[N] {
  const published = seed.articles
    .filter((a) => a.status === 'published' && new Date(a.published_at) <= new Date())
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
  const services = bySortOrder(seed.surgeries_services.filter((s) => s.is_published !== false));
  const serviceIds = new Set(services.map((s) => s.id));

  const all: {[K in DatasetName]: () => Datasets[K]} = {
    settings: () => seed.site_settings,
    doctor: () => seed.doctors_profile,
    heroes: () => seed.hero_sections,
    sections: () => seed.page_sections,
    services: () => services,
    procedures: () => bySortOrder(seed.surgery_procedures.filter((p) => p.is_published !== false && serviceIds.has(p.service_id))),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip the heavy columns, like the real query
    articles: () => published.map(({content, seo, ...card}) => card),
    article: () => published.find((a) => a.slug === slug) ?? null,
    videos: () => bySortOrder(seed.videos_gallery.filter((v) => v.is_published !== false)),
    reviews: () => bySortOrder(seed.patient_reviews.filter((r) => r.is_visible !== false)),
    faqs: () => bySortOrder(seed.faqs.filter((f) => f.is_visible !== false))
  };
  return all[name]();
}

/*
 * One `next build` renders ~30 pages per worker that share most datasets, so each dataset is
 * fetched once per process. Skipped in `next dev` so dashboard edits show on refresh.
 */
const memo = new Map<string, Promise<unknown>>();
const shouldMemo = process.env.NODE_ENV === 'production';

function fetchOnce<N extends DatasetName>(name: N, slug?: string): Promise<Datasets[N]> {
  if (!cmsConfigured) return Promise.resolve(seedDataset(name, slug));
  if (!shouldMemo) return fetchDataset(name, slug);
  const key = `${name}:${slug ?? ''}`;
  if (!memo.has(key)) memo.set(key, fetchDataset(name, slug));
  return memo.get(key) as Promise<Datasets[N]>;
}

export const loadServerDatasets = datasetLoader(fetchOnce);

/** A page's view model for the static HTML (the browser then refreshes it, see `live.ts`). */
export function getView<K extends ViewKey>(key: K, locale: Locale, slug?: string): Promise<Views[K]> {
  return loadView(key, locale, loadServerDatasets, slug);
}

export function getDataset<N extends DatasetName>(name: N, slug?: string): Promise<Datasets[N]> {
  return fetchOnce(name, slug);
}
