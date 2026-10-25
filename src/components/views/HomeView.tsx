'use client';

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
import {useLiveView} from '@/lib/cms/live';
import type {HomeViewData} from '@/lib/cms/views';

export function HomeView({initial}: {initial: HomeViewData}) {
  const v = useLiveView('home', initial).data ?? initial;

  return (
    <>
      <HomeHero hero={v.hero} />
      <AboutPreview about={v.about} />
      <StatsBand stats={v.stats} />
      <MajorSurgeries surgeries={v.surgeries} />
      <WhyChoose why={v.why} />
      <JourneySection journey={v.journey} />
      <ReviewsCarousel heading={v.reviewsBlock} reviews={v.reviews} />
      <FeaturedVideos heading={v.videosBlock} videos={v.videos} />
      <LatestArticles heading={v.articlesBlock} articles={v.articles} />
      <FaqSection id="faq" heading={v.faqBlock} items={v.faq} />
      <CtaSection band={v.hero.band} />
    </>
  );
}
