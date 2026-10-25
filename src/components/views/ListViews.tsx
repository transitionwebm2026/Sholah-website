'use client';

/* The three simple collection pages: reviews, videos and the articles index. */
import {useLocale, useTranslations} from 'next-intl';
import {ArticleCard} from '@/components/cards/ArticleCard';
import {ReviewCard} from '@/components/cards/ReviewCard';
import {VideoCard} from '@/components/cards/VideoCard';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {JsonLd} from '@/components/ui/JsonLd';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Locale} from '@/i18n/routing';
import {useLiveView} from '@/lib/cms/live';
import {useNavLabel, useSite} from '@/lib/cms/site-context';
import type {ArticlesViewData, ReviewsViewData, VideosViewData} from '@/lib/cms/views';
import {articleListSchema} from '@/lib/schema';

export function ReviewsView({initial}: {initial: ReviewsViewData}) {
  const v = useLiveView('reviews', initial).data ?? initial;
  const tCommon = useTranslations('Common');
  const navLabel = useNavLabel('reviews');

  return (
    <>
      <PageHero hero={v.hero} crumbs={[{name: navLabel, path: '/reviews'}]} />

      {v.reviews.length > 0 && (
        <Section id="reviews-grid" labelledBy="reviews-grid-title" tone="light">
          <Container>
            <SectionHeading id="reviews-grid-title" eyebrow={v.grid.eyebrow} title={v.grid.title} onLight />
            <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {v.reviews.map((review) => (
                <li key={review.id} data-reveal>
                  <ReviewCard review={review} ratingLabel={tCommon('ratingLabel', {rating: review.rating})} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CtaSection band={v.hero.band} />
    </>
  );
}

export function VideosView({initial}: {initial: VideosViewData}) {
  const v = useLiveView('videos', initial).data ?? initial;
  const navLabel = useNavLabel('videos');

  return (
    <>
      <PageHero hero={v.hero} crumbs={[{name: navLabel, path: '/videos'}]} />

      {v.videos.length > 0 && (
        <Section id="video-library" labelledBy="video-library-title" tone="deep">
          <Container>
            <SectionHeading id="video-library-title" eyebrow={v.grid.eyebrow} title={v.grid.title} />
            <ul className="mx-auto mt-14 grid max-w-5xl gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {v.videos.map((video) => (
                <li key={video.id} data-reveal className={video.orientation === 'landscape' ? 'sm:col-span-2' : undefined}>
                  <VideoCard video={video} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CtaSection band={v.hero.band} />
    </>
  );
}

export function ArticlesView({initial}: {initial: ArticlesViewData}) {
  const v = useLiveView('articles', initial).data ?? initial;
  const locale = useLocale() as Locale;
  const t = useTranslations('Articles');
  const site = useSite();
  const navLabel = useNavLabel('articles');

  return (
    <>
      <PageHero hero={v.hero} crumbs={[{name: navLabel, path: '/articles'}]} />

      {v.featured && (
        <Section id="featured-article" labelledBy="featured-article-title" tone="light" className="pb-0 sm:pb-0 lg:pb-0">
          <Container>
            <h2 id="featured-article-title" className="sr-only">
              {t('featured')}
            </h2>
            <div data-reveal="zoom">
              <ArticleCard article={v.featured} variant="featured" />
            </div>
          </Container>
        </Section>
      )}

      {v.articles.length > 0 && (
        <Section id="latest-articles" labelledBy="latest-articles-title" tone="light">
          <Container>
            <SectionHeading id="latest-articles-title" eyebrow={v.grid.eyebrow} title={v.grid.title} align="start" onLight />
            <ul className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {v.articles.map((article) => (
                <li key={article.slug} data-reveal>
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CtaSection band={v.hero.band} />

      <JsonLd
        data={articleListSchema(
          locale,
          v.featured ? [v.featured, ...v.articles] : v.articles,
          {name: site.doctor.name, jobTitle: site.doctor.title},
          navLabel
        )}
      />
    </>
  );
}
