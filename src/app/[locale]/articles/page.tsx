import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ArticleCard} from '@/components/cards/ArticleCard';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {JsonLd} from '@/components/ui/JsonLd';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Locale} from '@/i18n/routing';
import {getArticles} from '@/lib/content';
import {articleListSchema} from '@/lib/schema';
import {buildPageMetadata} from '@/lib/seo';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return buildPageMetadata(locale, 'articles', '/articles');
}

export default async function ArticlesPage({params}: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations('Articles');
  const tNav = await getTranslations('Nav');
  const tDoctor = await getTranslations('Doctor');
  const tMeta = await getTranslations('Metadata.pages');
  const [featured, ...rest] = await getArticles(locale);
  const grid = rest.slice(0, 6);

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        description={t('hero.description')}
        crumbs={[{name: tNav('articles'), path: '/articles'}]}
      />

      <Section id="featured-article" labelledBy="featured-article-title" tone="light" className="pb-0 sm:pb-0 lg:pb-0">
        <Container>
          <h2 id="featured-article-title" className="sr-only">
            {t('featured')}
          </h2>
          <div data-reveal="zoom">
            <ArticleCard article={featured} variant="featured" />
          </div>
        </Container>
      </Section>

      <Section id="latest-articles" labelledBy="latest-articles-title" tone="light">
        <Container>
          <SectionHeading id="latest-articles-title" eyebrow={t('grid.eyebrow')} title={t('grid.title')} align="start" onLight />
          <ul className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {grid.map((article) => (
              <li key={article.slug} data-reveal>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaSection variant="articles" />

      <JsonLd
        data={articleListSchema(
          locale,
          [featured, ...grid],
          {name: tDoctor('name'), jobTitle: tDoctor('title')},
          tMeta('articles.title')
        )}
      />
    </>
  );
}
