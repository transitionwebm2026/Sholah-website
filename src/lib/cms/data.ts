import {restSelect} from './rest';
import type {
  ArticleCardRow,
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

/** Everything a page can need, keyed by dataset name. Each page loads only its own subset. */
export type Datasets = {
  settings: SettingsRow | null;
  doctor: DoctorRow | null;
  heroes: HeroRow[];
  sections: SectionRow[];
  services: ServiceRow[];
  procedures: ProcedureRow[];
  articles: ArticleCardRow[];
  /** One full article, by slug. */
  article: ArticleRow | null;
  videos: VideoRow[];
  reviews: ReviewRow[];
  faqs: FaqRow[];
};

export type DatasetName = keyof Datasets;

export const ARTICLE_CARD_COLUMNS = 'id,slug,category,title,excerpt,cover_url,is_featured,published_at,read_minutes,updated_at';
const ORDER = 'sort_order.asc,created_at.asc';

/** Visibility filtering (drafts, hidden rows) happens in the RLS policies, not here. */
const QUERIES: Record<Exclude<DatasetName, 'article'>, {table: string; query: Record<string, string>; single?: boolean}> = {
  settings: {table: 'site_settings', query: {select: '*', id: 'eq.1'}, single: true},
  doctor: {table: 'doctors_profile', query: {select: '*', id: 'eq.1'}, single: true},
  heroes: {table: 'hero_sections', query: {select: '*'}},
  sections: {table: 'page_sections', query: {select: 'key,content'}},
  services: {table: 'surgeries_services', query: {select: 'id,slug,title,summary,description,image_url,sort_order', order: ORDER}},
  procedures: {
    table: 'surgery_procedures',
    query: {select: 'id,service_id,slug,title,description,image_url,sort_order', order: ORDER}
  },
  articles: {table: 'articles', query: {select: ARTICLE_CARD_COLUMNS, order: 'published_at.desc'}},
  videos: {table: 'videos_gallery', query: {select: '*', order: ORDER}},
  reviews: {table: 'patient_reviews', query: {select: '*', order: ORDER}},
  faqs: {table: 'faqs', query: {select: '*', order: ORDER}}
};

/** Reads one dataset from Supabase (anon role → only what the public may see). */
export async function fetchDataset<N extends DatasetName>(name: N, slug?: string): Promise<Datasets[N]> {
  if (name === 'article') {
    const rows = await restSelect<ArticleRow>('articles', {select: '*', slug: `eq.${slug ?? ''}`, limit: '1'});
    return (rows[0] ?? null) as Datasets[N];
  }
  const {table, query, single} = QUERIES[name as Exclude<DatasetName, 'article'>];
  const rows = await restSelect<unknown>(table, query);
  return (single ? (rows[0] ?? null) : rows) as Datasets[N];
}

export type DatasetLoader = (names: readonly DatasetName[], slug?: string) => Promise<Partial<Datasets>>;

/** Loads several datasets in parallel with the given single-dataset fetcher. */
export function datasetLoader(fetchOne: <N extends DatasetName>(name: N, slug?: string) => Promise<Datasets[N]>): DatasetLoader {
  return async (names, slug) => {
    const entries = await Promise.all(names.map(async (name) => [name, await fetchOne(name, slug)] as const));
    return Object.fromEntries(entries) as Partial<Datasets>;
  };
}
