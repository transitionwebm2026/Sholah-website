import {ArticleCard} from '@/components/cards/ArticleCard';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {ArticleCardView, HeadingView} from '@/lib/cms/views';

/** Section 9: three latest articles. */
export function LatestArticles({heading, articles}: {heading: HeadingView; articles: ArticleCardView[]}) {
  if (!articles.length) return null;

  return (
    <Section id="articles" labelledBy="articles-title" tone="light">
      <Container>
        <SectionHeading id="articles-title" eyebrow={heading.eyebrow} title={heading.title} onLight />
        <ul className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug} data-reveal>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
        {heading.cta && (
          <div data-reveal="up" className="mt-14 text-center">
            <ButtonLink href="/articles" variant="navy">
              {heading.cta}
              <DirectionalArrow />
            </ButtonLink>
          </div>
        )}
      </Container>
    </Section>
  );
}
