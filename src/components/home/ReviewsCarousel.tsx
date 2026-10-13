import {getLocale, getTranslations} from 'next-intl/server';
import {TestimonialsSlider} from '@/components/interactive/TestimonialsSlider';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Locale} from '@/i18n/routing';
import {getReviews} from '@/lib/content';

/** Section 7: testimonials carousel (pauses on hover/focus). */
export async function ReviewsCarousel() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('Home.reviews');
  const tCommon = await getTranslations('Common');
  const tReviews = await getTranslations('Reviews');
  const reviews = await getReviews(locale);
  const total = reviews.length;

  return (
    <Section id="testimonials" labelledBy="testimonials-title" tone="light">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="testimonials-title" eyebrow={t('eyebrow')} title={t('title')} align="start" onLight />
          <ButtonLink href="/reviews" variant="outlineDark" className="self-start md:self-auto" data-reveal="up">
            {t('cta')}
            <DirectionalArrow />
          </ButtonLink>
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
              rating: tCommon('ratingLabel', {rating: 5}),
              slides: reviews.map((_, i) => tCommon('slideOf', {current: i + 1, total})),
              pages: reviews.map((_, i) => tCommon('goToSlide', {number: i + 1}))
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
