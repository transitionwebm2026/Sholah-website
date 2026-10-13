import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ReviewCard} from '@/components/cards/ReviewCard';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Locale} from '@/i18n/routing';
import {getReviews} from '@/lib/content';
import {buildPageMetadata} from '@/lib/seo';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return buildPageMetadata(locale, 'reviews', '/reviews');
}

export default async function ReviewsPage({params}: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations('Reviews');
  const tNav = await getTranslations('Nav');
  const tCommon = await getTranslations('Common');
  const reviews = await getReviews(locale);

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        description={t('hero.description')}
        crumbs={[{name: tNav('reviews'), path: '/reviews'}]}
      />

      <Section id="reviews-grid" labelledBy="reviews-grid-title" tone="light">
        <Container>
          <SectionHeading id="reviews-grid-title" eyebrow={t('grid.eyebrow')} title={t('grid.title')} onLight />
          <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 9).map((review) => (
              <li key={review.name} data-reveal>
                <ReviewCard review={review} ratingLabel={tCommon('ratingLabel', {rating: 5})} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaSection variant="reviews" />
    </>
  );
}
