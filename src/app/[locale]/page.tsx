import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {AboutPreview} from '@/components/home/AboutPreview';
import {FeaturedVideos} from '@/components/home/FeaturedVideos';
import {HomeHero} from '@/components/home/HomeHero';
import {JourneySection} from '@/components/home/JourneySection';
import {LatestArticles} from '@/components/home/LatestArticles';
import {MajorSurgeries} from '@/components/home/MajorSurgeries';
import {ReviewsCarousel} from '@/components/home/ReviewsCarousel';
import {StatsBand} from '@/components/home/StatsBand';
import {WhyChoose} from '@/components/home/WhyChoose';
import {FaqSection} from '@/components/sections/FaqSection';
import {CtaSection} from '@/components/ui/CtaSection';
import type {Locale} from '@/i18n/routing';
import {getFaq} from '@/lib/content';
import {buildPageMetadata} from '@/lib/seo';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return buildPageMetadata(locale, 'home');
}

export default async function HomePage({params}: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations('Home.faq');
  const faq = await getFaq(locale, 'home');

  return (
    <>
      <HomeHero />
      <AboutPreview />
      <StatsBand />
      <MajorSurgeries />
      <WhyChoose />
      <JourneySection />
      <ReviewsCarousel />
      <FeaturedVideos />
      <LatestArticles />
      <FaqSection id="faq" eyebrow={t('eyebrow')} title={t('title')} description={t('description')} items={faq} />
      <CtaSection />
    </>
  );
}
