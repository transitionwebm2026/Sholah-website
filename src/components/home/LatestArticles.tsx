import {getLocale, getTranslations} from 'next-intl/server';
import {ArticleCard} from '@/components/cards/ArticleCard';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Locale} from '@/i18n/routing';
import {getArticles} from '@/lib/content';

/** Section 9: three latest articles. */
export async function LatestArticles() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('Home.articles');
  const articles = (await getArticles(locale)).slice(0, 3);

  return (
    <Section id="articles" labelledBy="articles-title" tone="light">
      <Container>
        <SectionHeading id="articles-title" eyebrow={t('eyebrow')} title={t('title')} onLight />
        <ul className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug} data-reveal>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
        <div data-reveal="up" className="mt-14 text-center">
          <ButtonLink href="/articles" variant="navy">
            {t('cta')}
            <DirectionalArrow />
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
