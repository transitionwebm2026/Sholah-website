import type {StaticImageData} from 'next/image';
import {getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import type {
  Article,
  ArticleContent,
  Branch,
  FaqItem,
  OpeningHours,
  Review,
  ServiceCategory,
  ServiceCategoryContent,
  ServiceId,
  Video,
  VideoContent
} from './types';

import doctorPortrait from '@/assets/images/doctor/portrait.jpg';
import doctorMessage from '@/assets/images/doctor/message.jpg';
import serviceLaparoscopic from '@/assets/images/services/laparoscopic.jpg';
import serviceHernia from '@/assets/images/services/hernia.jpg';
import serviceAnorectal from '@/assets/images/services/anorectal.jpg';
import serviceEndocrine from '@/assets/images/services/endocrine.jpg';
import procCholecystectomy from '@/assets/images/procedures/cholecystectomy.jpg';
import procAppendectomy from '@/assets/images/procedures/appendectomy.jpg';
import procAntiReflux from '@/assets/images/procedures/anti-reflux.jpg';
import procDiagnosticLaparoscopy from '@/assets/images/procedures/diagnostic-laparoscopy.jpg';
import procInguinalHernia from '@/assets/images/procedures/inguinal-hernia.jpg';
import procUmbilicalHernia from '@/assets/images/procedures/umbilical-hernia.jpg';
import procIncisionalHernia from '@/assets/images/procedures/incisional-hernia.jpg';
import procDiastasisRecti from '@/assets/images/procedures/diastasis-recti.jpg';
import procHemorrhoidsLaser from '@/assets/images/procedures/hemorrhoids-laser.jpg';
import procAnalFissure from '@/assets/images/procedures/anal-fissure.jpg';
import procAnalFistula from '@/assets/images/procedures/anal-fistula.jpg';
import procPilonidalSinus from '@/assets/images/procedures/pilonidal-sinus.jpg';
import procTotalThyroidectomy from '@/assets/images/procedures/total-thyroidectomy.jpg';
import procHemithyroidectomy from '@/assets/images/procedures/hemithyroidectomy.jpg';
import procParathyroidectomy from '@/assets/images/procedures/parathyroidectomy.jpg';
import procAdrenalectomy from '@/assets/images/procedures/adrenalectomy.jpg';
import article1 from '@/assets/images/articles/article-1.jpg';
import article2 from '@/assets/images/articles/article-2.jpg';
import article3 from '@/assets/images/articles/article-3.jpg';
import article4 from '@/assets/images/articles/article-4.jpg';
import article5 from '@/assets/images/articles/article-5.jpg';
import article6 from '@/assets/images/articles/article-6.jpg';
import article7 from '@/assets/images/articles/article-7.jpg';
import videoAbout from '@/assets/images/videos/about.jpg';
import videoIntro from '@/assets/images/videos/intro.jpg';
import short1 from '@/assets/images/videos/short-1.jpg';
import short2 from '@/assets/images/videos/short-2.jpg';
import short3 from '@/assets/images/videos/short-3.jpg';
import short4 from '@/assets/images/videos/short-4.jpg';
import short5 from '@/assets/images/videos/short-5.jpg';
import short6 from '@/assets/images/videos/short-6.jpg';
import short7 from '@/assets/images/videos/short-7.jpg';
import short8 from '@/assets/images/videos/short-8.jpg';
import short9 from '@/assets/images/videos/short-9.jpg';
import certificate1 from '@/assets/images/certificates/certificate-1.jpg';
import certificate2 from '@/assets/images/certificates/certificate-2.jpg';
import certificate3 from '@/assets/images/certificates/certificate-3.jpg';
import certificate4 from '@/assets/images/certificates/certificate-4.jpg';
import certificate5 from '@/assets/images/certificates/certificate-5.jpg';
import certificate6 from '@/assets/images/certificates/certificate-6.jpg';

/*
 * Media and other non-translatable metadata. Static imports give next/image intrinsic
 * dimensions and an automatic blurDataURL, so `placeholder="blur"` works everywhere.
 * To use real photos, overwrite the files in `src/assets/images` keeping the same names.
 */

export const media = {
  doctorPortrait,
  doctorMessage
};

export const serviceImages: Record<ServiceId, StaticImageData> = {
  laparoscopic: serviceLaparoscopic,
  hernia: serviceHernia,
  anorectal: serviceAnorectal,
  endocrine: serviceEndocrine
};

/** Keyed by the procedure `id` in `Services.categories[].procedures` (identical in both locales). */
const procedureImages: Record<string, StaticImageData> = {
  cholecystectomy: procCholecystectomy,
  appendectomy: procAppendectomy,
  'anti-reflux': procAntiReflux,
  'diagnostic-laparoscopy': procDiagnosticLaparoscopy,
  'inguinal-hernia': procInguinalHernia,
  'umbilical-hernia': procUmbilicalHernia,
  'incisional-hernia': procIncisionalHernia,
  'diastasis-recti': procDiastasisRecti,
  'hemorrhoids-laser': procHemorrhoidsLaser,
  'anal-fissure': procAnalFissure,
  'anal-fistula': procAnalFistula,
  'pilonidal-sinus': procPilonidalSinus,
  'total-thyroidectomy': procTotalThyroidectomy,
  hemithyroidectomy: procHemithyroidectomy,
  parathyroidectomy: procParathyroidectomy,
  adrenalectomy: procAdrenalectomy
};

export const certificateImages = [
  certificate1,
  certificate2,
  certificate3,
  certificate4,
  certificate5,
  certificate6
];

/** Keyed by the `slug` used in `Articles.items` (identical in both locales). */
const articleMeta: Record<string, {image: StaticImageData; published: string; readMinutes: number}> = {
  'laparoscopic-gallbladder-removal-guide': {image: article1, published: '2026-09-28', readMinutes: 6},
  'inguinal-hernia-when-to-operate': {image: article2, published: '2026-09-14', readMinutes: 5},
  'hemorrhoids-modern-treatment': {image: article3, published: '2026-08-31', readMinutes: 5},
  'thyroid-nodules-explained': {image: article4, published: '2026-08-17', readMinutes: 5},
  'preparing-for-surgery-checklist': {image: article5, published: '2026-08-03', readMinutes: 4},
  'appendicitis-warning-signs': {image: article6, published: '2026-07-20', readMinutes: 4},
  'recovery-after-abdominal-surgery': {image: article7, published: '2026-07-06', readMinutes: 5}
};

export const ARTICLE_SLUGS = Object.keys(articleMeta);

export function getArticlePublished(slug: string) {
  return articleMeta[slug].published;
}

/**
 * YouTube video IDs (the part after `v=` or `/shorts/`).
 * Leave an ID empty until the video is published; the player then shows a "coming soon" notice.
 */
const videoMeta: Record<string, {youtubeId: string; poster: StaticImageData; duration: string}> = {
  v1: {youtubeId: '', poster: short1, duration: '1:24'},
  v2: {youtubeId: '', poster: short2, duration: '2:05'},
  v3: {youtubeId: '', poster: short3, duration: '1:12'},
  v4: {youtubeId: '', poster: short4, duration: '1:48'},
  v5: {youtubeId: '', poster: short5, duration: '1:36'},
  v6: {youtubeId: '', poster: short6, duration: '2:10'},
  v7: {youtubeId: '', poster: short7, duration: '1:20'},
  v8: {youtubeId: '', poster: short8, duration: '1:55'},
  v9: {youtubeId: '', poster: short9, duration: '1:42'}
};

export const featureVideos = {
  /** Landscape video beside the bio on the home page. */
  homeAbout: {youtubeId: '', poster: videoAbout},
  /** Full-width introductory video on the About page. */
  aboutIntro: {youtubeId: '', poster: videoIntro}
};

/* ---------- Locale-aware loaders (server only) ---------- */

export async function getArticles(locale: Locale): Promise<Article[]> {
  const t = await getTranslations({locale, namespace: 'Articles'});
  return (t.raw('items') as ArticleContent[])
    .filter((item) => item.slug in articleMeta)
    .map((item) => ({...item, ...articleMeta[item.slug]}))
    .sort((a, b) => b.published.localeCompare(a.published));
}

export async function getVideos(locale: Locale): Promise<Video[]> {
  const t = await getTranslations({locale, namespace: 'Videos'});
  return (t.raw('items') as VideoContent[])
    .filter((item) => item.id in videoMeta)
    .map((item) => ({...item, ...videoMeta[item.id]}));
}

export async function getReviews(locale: Locale): Promise<Review[]> {
  const t = await getTranslations({locale, namespace: 'Reviews'});
  return t.raw('items') as Review[];
}

export async function getServiceCategories(locale: Locale): Promise<ServiceCategory[]> {
  const t = await getTranslations({locale, namespace: 'Services'});
  return (t.raw('categories') as ServiceCategoryContent[]).map((category) => ({
    ...category,
    // A procedure without its own photo (e.g. a newly added one) shows its specialty's image.
    procedures: category.procedures.map((p) => ({...p, image: procedureImages[p.id] ?? serviceImages[category.id]}))
  }));
}

export async function getClinicInfo(locale: Locale) {
  const t = await getTranslations({locale, namespace: 'Clinic'});
  return {
    branches: t.raw('branches') as Branch[],
    hours: t.raw('hours') as OpeningHours[],
    country: t('country')
  };
}

export async function getFaq(locale: Locale, scope: 'home' | 'services'): Promise<FaqItem[]> {
  if (scope === 'home') {
    const t = await getTranslations({locale, namespace: 'Home'});
    return t.raw('faq.items') as FaqItem[];
  }
  const t = await getTranslations({locale, namespace: 'Services'});
  return t.raw('faq.items') as FaqItem[];
}

export function formatBranchAddress(branch: Branch, country: string, locale: Locale) {
  return [branch.street, branch.area, branch.city, country].join(locale === 'ar' ? '، ' : ', ');
}
