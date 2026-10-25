import {useTranslations} from 'next-intl';
import {TestimonialsSlider} from '@/components/interactive/TestimonialsSlider';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {HeadingView, ReviewView} from '@/lib/cms/views';

/** Section 7: testimonials carousel (pauses on hover/focus). Only reviews marked "show on home". */
export function ReviewsCarousel({heading, reviews}: {heading: HeadingView; reviews: ReviewView[]}) {
  const tCommon = useTranslations('Common');
  const tReviews = useTranslations('Reviews');
  const total = reviews.length;
  if (!total) return null;

  return (
    <Section id="testimonials" labelledBy="testimonials-title" tone="light">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="testimonials-title" eyebrow={heading.eyebrow} title={heading.title} align="start" onLight />
          {heading.cta && (
            <ButtonLink href="/reviews" variant="outlineDark" className="self-start md:self-auto" data-reveal="up">
              {heading.cta}
              <DirectionalArrow />
            </ButtonLink>
          )}
        </div>

        <div data-reveal="up" className="mt-12">
          <TestimonialsSlider
            reviews={reviews}
            labels={{
              region: tReviews('carouselLabel'),
              previous: tCommon('previous'),
              next: tCommon('next'),
              pause: tCommon('pauseAutoplay'),
              play: tCommon('playAutoplay'),
              ratings: reviews.map((r) => tCommon('ratingLabel', {rating: r.rating})),
              slides: reviews.map((_, i) => tCommon('slideOf', {current: i + 1, total})),
              pages: reviews.map((_, i) => tCommon('goToSlide', {number: i + 1}))
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
