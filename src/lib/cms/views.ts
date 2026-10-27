/*
 * Pure, locale-aware view models built from CMS rows. Shared by the build (server) and the
 * browser (live refresh), so a page renders identically from either source. Only the active
 * locale's strings end up in a view, which keeps the static HTML and RSC payloads small.
 */
import type {Locale} from '@/i18n/routing';
import type {DatasetLoader, DatasetName, Datasets} from './data';
import {directionsHref, mapEmbedSrc} from './media';
import type {
  ArticleCardRow,
  ButtonStyle,
  Heading,
  HeroRow,
  L10n,
  PageKey,
  PhoneRow,
  RichNode,
  SectionContents,
  SectionKey,
  SectionRow,
  SocialRow,
  VideoEmbedRow,
  VideoRow
} from './types';

/* ---------- Primitives ---------- */

/** The active locale's text, falling back to the other language rather than showing nothing. */
export function tr(value: L10n | null | undefined, locale: Locale): string {
  if (!value || typeof value !== 'object') return '';
  const other: Locale = locale === 'ar' ? 'en' : 'ar';
  return (value[locale] || value[other] || '').trim();
}

const list = <T>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

export type HeadingView = {eyebrow: string; title: string; description: string; cta: string};

function heading(h: Heading | undefined, l: Locale): HeadingView {
  return {eyebrow: tr(h?.eyebrow, l), title: tr(h?.title, l), description: tr(h?.description, l), cta: tr(h?.cta, l)};
}

function section<K extends SectionKey>(rows: SectionRow[] | undefined, key: K): SectionContents[K] {
  return (list(rows).find((row) => row.key === key)?.content ?? {}) as SectionContents[K];
}

export type LinkView = {label: string; href: string};
export type ButtonView = LinkView & {style: ButtonStyle};

export type HeroView = {
  eyebrow: string;
  /** Words between *asterisks* render in gold (see GoldText). */
  title: string;
  description: string;
  image: string | null;
  buttons: ButtonView[];
  band: {eyebrow: string; title: string; text: string};
};

function hero(rows: HeroRow[] | undefined, page: PageKey, l: Locale): HeroView {
  const row = list(rows).find((r) => r.page === page);
  return {
    eyebrow: tr(row?.eyebrow, l),
    title: tr(row?.title, l),
    description: tr(row?.description, l),
    image: row?.image_url || null,
    buttons: list(row?.buttons)
      .map((b) => ({label: tr(b.label, l), href: (b.href ?? '').trim(), style: b.style ?? 'primary'}))
      .filter((b) => b.label && b.href),
    band: {eyebrow: tr(row?.cta_band?.eyebrow, l), title: tr(row?.cta_band?.title, l), text: tr(row?.cta_band?.text, l)}
  };
}

export type VideoEmbedView = {title: string; url: string; thumbnail: string | null};

function videoEmbed(v: VideoEmbedRow | undefined, l: Locale): VideoEmbedView {
  return {title: tr(v?.title, l), url: (v?.url ?? '').trim(), thumbnail: v?.thumbnail_url || null};
}

export type IconItemView = {icon: string; title: string; description: string};
export type StepView = {title: string; description: string};
export type StatView = {value: number; suffix: string; label: string; icon: string; onHome: boolean};

function stats(rows: SectionRow[] | undefined, l: Locale) {
  const content = section(rows, 'stats');
  return {
    title: tr(content.home_title, l),
    items: list(content.items).map<StatView>((s) => ({
      value: Number(s.value) || 0,
      suffix: s.suffix ?? '',
      label: tr(s.label, l),
      icon: s.icon ?? 'award',
      onHome: s.show_on_home !== false
    }))
  };
}

export type ArticleCardView = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string | null;
  published: string;
  readMinutes: number;
  featured: boolean;
};

function articleCard(row: ArticleCardRow, l: Locale): ArticleCardView {
  return {
    slug: row.slug,
    category: tr(row.category, l),
    title: tr(row.title, l),
    excerpt: tr(row.excerpt, l),
    image: row.cover_url || null,
    published: row.published_at,
    readMinutes: row.read_minutes,
    featured: row.is_featured
  };
}

export type VideoView = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  orientation: 'portrait' | 'landscape';
  duration: string;
};

function video(row: VideoRow, l: Locale): VideoView {
  return {
    id: row.id,
    title: tr(row.title, l),
    description: tr(row.description, l),
    url: row.video_url ?? '',
    thumbnail: row.thumbnail_url,
    orientation: row.orientation === 'landscape' ? 'landscape' : 'portrait',
    duration: row.duration ?? ''
  };
}

export type ReviewView = {id: string; name: string; procedure: string; text: string; rating: number};
export type FaqView = {question: string; answer: string};

/* ---------- Site (layout) ---------- */

export type BranchView = {
  id: string;
  name: string;
  address: string;
  phone: string;
  mapEmbedUrl: string;
  directionsUrl: string;
};

export type SiteView = {
  siteName: string;
  doctor: {name: string; shortName: string; title: string; credentials: string; imageAlt: string; photo: string | null};
  logos: {header: string | null; footer: string | null};
  phones: PhoneRow[];
  whatsapp: string;
  greeting: string;
  email: string;
  social: SocialRow[];
  branches: BranchView[];
  hours: Array<{days: string; time: string}>;
  nav: LinkView[];
  footer: {about: string; copyright: string; disclaimer: string; quickLinks: LinkView[]};
  services: Array<{slug: string; title: string; summary: string}>;
};

function buildSite(ds: Partial<Datasets>, l: Locale): SiteView {
  const s = ds.settings;
  const d = ds.doctor;
  const links = (rows: Array<{label: L10n; href: string; visible?: boolean}> | undefined) =>
    list(rows)
      .filter((r) => r.visible !== false)
      .map((r) => ({label: tr(r.label, l), href: (r.href ?? '').trim()}))
      .filter((r) => r.label && r.href);

  return {
    siteName: tr(s?.site_name, l) || tr(d?.name, l),
    doctor: {
      name: tr(d?.name, l),
      shortName: tr(d?.short_name, l),
      title: tr(d?.title, l),
      credentials: tr(d?.credentials, l),
      imageAlt: tr(d?.image_alt, l),
      photo: d?.photo_url || null
    },
    logos: {header: s?.logo_header_url || null, footer: s?.logo_footer_url || s?.logo_header_url || null},
    phones: list(s?.phones).filter((p) => p.value),
    whatsapp: (s?.whatsapp_number ?? '').replace(/\D/g, ''),
    greeting: tr(s?.whatsapp_greeting, l),
    email: s?.email ?? '',
    social: list(s?.social_links).filter((x) => x.url),
    branches: list(s?.branches).map((b) => {
      const address = tr(b.address, l);
      return {
        id: b.id,
        name: tr(b.name, l),
        address,
        phone: b.phone ?? '',
        mapEmbedUrl: mapEmbedSrc(b, l),
        directionsUrl: directionsHref({...b, address})
      };
    }),
    hours: list(s?.working_hours).map((h) => ({days: tr(h.days, l), time: tr(h.time, l)})),
    nav: links(s?.nav_links),
    footer: {
      about: tr(s?.footer?.about, l),
      copyright: tr(s?.footer?.copyright, l),
      disclaimer: tr(s?.footer?.disclaimer, l),
      quickLinks: links(s?.footer?.quick_links)
    },
    services: list(ds.services).map((c) => ({slug: c.slug, title: tr(c.title, l), summary: tr(c.summary, l)}))
  };
}

/* ---------- Pages ---------- */

function buildHome(ds: Partial<Datasets>, l: Locale) {
  const about = section(ds.sections, 'home.about');
  const surgeries = section(ds.sections, 'home.surgeries');
  const why = section(ds.sections, 'home.why');
  const journey = section(ds.sections, 'home.journey');
  const blocks = section(ds.sections, 'home.blocks');
  const videos = list(ds.videos);
  const featuredVideos = videos.filter((v) => v.is_featured);
  // Specialties picked in the dashboard (in their Services-page order); none picked → the first three.
  const services = list(ds.services);
  const picked = services.filter((s) => list(surgeries.services).includes(s.slug));
  const homeServices = picked.length ? picked : services.slice(0, 3);

  return {
    hero: hero(ds.heroes, 'home', l),
    about: {
      ...heading(about, l),
      paragraphs: list(about.paragraphs).map((p) => tr(p, l)).filter(Boolean),
      points: list(about.points).map((p) => tr(p, l)).filter(Boolean),
      video: videoEmbed(about.video, l)
    },
    stats: stats(ds.sections, l),
    surgeries: {
      ...heading(surgeries, l),
      // Specialties of the Services page, each linking to its own section there.
      items: homeServices.map((s) => ({
        slug: s.slug,
        title: tr(s.title, l),
        description: tr(s.summary, l),
        image: s.image_url || null,
        href: `/services#${s.slug}`
      }))
    },
    why: {
      ...heading(why, l),
      items: list(why.items).map((i) => ({icon: i.icon ?? '', title: tr(i.title, l), description: tr(i.description, l)}))
    },
    journey: {
      ...heading(journey, l),
      steps: list(journey.steps).map((s) => ({title: tr(s.title, l), description: tr(s.description, l)}))
    },
    reviewsBlock: heading(blocks.reviews, l),
    reviews: list(ds.reviews)
      .filter((r) => r.show_on_home)
      .map((r) => review(r, l)),
    videosBlock: heading(blocks.videos, l),
    videos: (featuredVideos.length ? featuredVideos.slice(0, 6) : videos.slice(0, 3)).map((v) => video(v, l)),
    articlesBlock: heading(blocks.articles, l),
    articles: list(ds.articles)
      .slice(0, 3)
      .map((a) => articleCard(a, l)),
    faqBlock: heading(blocks.faq, l),
    faq: faqs(ds, 'home', l)
  };
}

function review(r: NonNullable<Datasets['reviews']>[number], l: Locale): ReviewView {
  return {
    id: r.id,
    name: tr(r.patient_name, l),
    procedure: tr(r.procedure, l),
    text: tr(r.review_text, l),
    rating: Math.min(Math.max(Math.round(r.rating) || 5, 1), 5)
  };
}

function faqs(ds: Partial<Datasets>, page: 'home' | 'services', l: Locale): FaqView[] {
  return list(ds.faqs)
    .filter((f) => f.page === page)
    .map((f) => ({question: tr(f.question, l), answer: tr(f.answer, l)}))
    .filter((f) => f.question && f.answer);
}

function buildAbout(ds: Partial<Datasets>, l: Locale) {
  const d = ds.doctor;
  const h = d?.headings ?? {};
  return {
    hero: hero(ds.heroes, 'about', l),
    doctor: {name: tr(d?.name, l), title: tr(d?.title, l), imageAlt: tr(d?.image_alt, l)},
    message: {
      eyebrow: tr(d?.message?.eyebrow, l),
      title: tr(d?.message?.title, l),
      paragraphs: list(d?.message?.paragraphs).map((p) => tr(p, l)).filter(Boolean),
      signature: tr(d?.message?.signature, l),
      photo: d?.message_photo_url || d?.photo_url || null
    },
    career: {
      ...heading(h.career, l),
      items: list(d?.timeline).map((t) => ({year: t.year ?? '', title: tr(t.title, l), place: tr(t.place, l)}))
    },
    introVideo: {...heading(h.intro_video, l), video: videoEmbed(d?.intro_video, l)},
    expertise: {
      ...heading(h.expertise, l),
      items: list(d?.expertise).map((e) => ({
        icon: e.icon ?? '',
        title: tr(e.title, l),
        description: tr(e.description, l),
        href: e.href || '/services'
      }))
    },
    certificates: {
      ...heading(h.certificates, l),
      items: list(d?.certificates).map((c) => ({
        title: tr(c.title, l),
        issuer: tr(c.issuer, l),
        year: c.year ?? '',
        image: c.image_url || null
      }))
    },
    achievements: {...heading(h.achievements, l), items: stats(ds.sections, l).items}
  };
}

function buildServices(ds: Partial<Datasets>, l: Locale) {
  const blocks = section(ds.sections, 'services.blocks');
  const procedures = list(ds.procedures);
  return {
    hero: hero(ds.heroes, 'services', l),
    fields: heading(blocks.fields, l),
    categories: list(ds.services).map((c) => ({
      slug: c.slug,
      title: tr(c.title, l),
      summary: tr(c.summary, l),
      description: tr(c.description, l),
      image: c.image_url || null,
      procedures: procedures
        .filter((p) => p.service_id === c.id)
        .map((p) => ({
          slug: p.slug,
          title: tr(p.title, l),
          description: tr(p.description, l),
          // A procedure without its own photo shows its specialty's image.
          image: p.image_url || c.image_url || null
        }))
    })),
    process: {
      ...heading(blocks.process, l),
      steps: list(blocks.process?.steps).map((s) => ({title: tr(s.title, l), description: tr(s.description, l)}))
    },
    faqBlock: heading(blocks.faq, l),
    faq: faqs(ds, 'services', l)
  };
}

function buildReviews(ds: Partial<Datasets>, l: Locale) {
  return {
    hero: hero(ds.heroes, 'reviews', l),
    grid: heading(section(ds.sections, 'reviews.blocks').grid, l),
    reviews: list(ds.reviews).map((r) => review(r, l))
  };
}

function buildVideos(ds: Partial<Datasets>, l: Locale) {
  return {
    hero: hero(ds.heroes, 'videos', l),
    grid: heading(section(ds.sections, 'videos.blocks').grid, l),
    videos: list(ds.videos).map((v) => video(v, l))
  };
}

function buildArticles(ds: Partial<Datasets>, l: Locale) {
  const cards = list(ds.articles).map((a) => articleCard(a, l));
  const featured = cards.find((a) => a.featured) ?? cards[0] ?? null;
  return {
    hero: hero(ds.heroes, 'articles', l),
    grid: heading(section(ds.sections, 'articles.blocks').grid, l),
    featured,
    articles: cards.filter((a) => a !== featured)
  };
}

export type ArticleDetail = ArticleCardView & {
  updated: string;
  content: RichNode | null;
  seoTitle: string;
  seoDescription: string;
};

function buildArticle(ds: Partial<Datasets>, l: Locale) {
  const row = ds.article;
  const article: ArticleDetail | null = row
    ? {
        ...articleCard(row, l),
        updated: row.updated_at ?? row.published_at,
        content: row.content?.[l] ?? row.content?.[l === 'ar' ? 'en' : 'ar'] ?? null,
        seoTitle: tr(row.seo?.title, l),
        seoDescription: tr(row.seo?.description, l)
      }
    : null;
  return {
    hero: hero(ds.heroes, 'articles', l),
    article,
    related: list(ds.articles)
      .filter((a) => a.slug !== row?.slug)
      .slice(0, 3)
      .map((a) => articleCard(a, l))
  };
}

function buildContact(ds: Partial<Datasets>, l: Locale) {
  return {hero: hero(ds.heroes, 'contact', l)};
}

/* ---------- Registry ---------- */

const builders = {
  layout: buildSite,
  home: buildHome,
  about: buildAbout,
  services: buildServices,
  reviews: buildReviews,
  videos: buildVideos,
  articles: buildArticles,
  article: buildArticle,
  contact: buildContact
};

export type ViewKey = keyof typeof builders;
export type Views = {[K in ViewKey]: ReturnType<(typeof builders)[K]>};

export type HomeViewData = Views['home'];
export type AboutViewData = Views['about'];
export type ServicesViewData = Views['services'];
export type ReviewsViewData = Views['reviews'];
export type VideosViewData = Views['videos'];
export type ArticlesViewData = Views['articles'];
export type ArticleViewData = Views['article'];
export type ContactViewData = Views['contact'];

/** Which datasets each view reads. */
export const VIEW_DATASETS: {[K in ViewKey]: readonly DatasetName[]} = {
  layout: ['settings', 'doctor', 'services'],
  home: ['heroes', 'sections', 'services', 'reviews', 'videos', 'articles', 'faqs'],
  about: ['heroes', 'doctor', 'sections'],
  services: ['heroes', 'sections', 'services', 'procedures', 'faqs'],
  reviews: ['heroes', 'sections', 'reviews'],
  videos: ['heroes', 'sections', 'videos'],
  articles: ['heroes', 'sections', 'articles'],
  article: ['heroes', 'articles', 'article'],
  contact: ['heroes']
};

export function buildView<K extends ViewKey>(key: K, datasets: Partial<Datasets>, locale: Locale): Views[K] {
  return builders[key](datasets, locale) as Views[K];
}

export async function loadView<K extends ViewKey>(key: K, locale: Locale, load: DatasetLoader, slug?: string): Promise<Views[K]> {
  return buildView(key, await load(VIEW_DATASETS[key], slug), locale);
}
