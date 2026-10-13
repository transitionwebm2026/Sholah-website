import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {ArrowLeft, CalendarDays, Clock, Info} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import brandMark from '@/assets/images/brand/mark.png';
import {ArticleCard} from '@/components/cards/ArticleCard';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {JsonLd} from '@/components/ui/JsonLd';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Locale} from '@/i18n/routing';
import {ARTICLE_SLUGS, getArticles} from '@/lib/content';
import {articleSchema} from '@/lib/schema';
import {absoluteUrl, buildMetadata} from '@/lib/seo';
import {formatDate} from '@/lib/utils';

type Props = {params: Promise<{locale: string; slug: string}>};

// Combined with the parent layout's locales → every article is pre-rendered in both languages.
export function generateStaticParams() {
  return ARTICLE_SLUGS.map((slug) => ({slug}));
}

export const dynamicParams = false;

async function findArticle(locale: Locale, slug: string) {
  const articles = await getArticles(locale);
  const article = articles.find((a) => a.slug === slug);
  return {article, articles};
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale: rawLocale, slug} = await params;
  const locale = rawLocale as Locale;
  const {article} = await findArticle(locale, slug);
  if (!article) return {};
  const tDoctor = await getTranslations({locale, namespace: 'Doctor'});

  return buildMetadata({
    locale,
    path: `/articles/${slug}`,
    title: article.title,
    description: article.excerpt,
    image: {url: absoluteUrl(article.image.src), width: article.image.width, height: article.image.height, alt: article.title},
    article: {publishedTime: article.published, section: article.category, author: tDoctor('name')}
  });
}

export default async function ArticlePage({params}: Props) {
  const {locale: rawLocale, slug} = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const {article, articles} = await findArticle(locale, slug);
  if (!article) notFound();

  const t = await getTranslations('Articles');
  const tNav = await getTranslations('Nav');
  const tCommon = await getTranslations('Common');
  const tDoctor = await getTranslations('Doctor');
  const related = articles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      {/* Reading progress (scroll-driven CSS; stays hidden where unsupported). */}
      <div
        aria-hidden
        className="fx-progress fixed inset-x-0 top-0 z-[60] h-[3px] bg-linear-to-r from-gold-600 via-gold-400 to-gold-200 rtl:bg-linear-to-l"
      />
      <PageHero
        eyebrow={article.category}
        title={article.title}
        description={article.excerpt}
        crumbs={[
          {name: tNav('articles'), path: '/articles'},
          {name: article.title, path: `/articles/${slug}`}
        ]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
          <span className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-400/35 bg-navy-800">
              <Image src={brandMark} alt="" className="h-7 w-auto" />
            </span>
            <span>
              <span className="block text-xs text-white/60">{t('detail.writtenBy')}</span>
              <span className="block font-semibold text-white">{tDoctor('name')}</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4 text-gold-400" />
            <span className="sr-only">{t('detail.published')}</span>
            <time dateTime={article.published}>{formatDate(article.published, locale)}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-4 text-gold-400" />
            {tCommon('minutesRead', {count: article.readMinutes, minutes: String(article.readMinutes)})}
          </span>
        </div>
      </PageHero>

      <Section id="article" labelledBy="hero-title" tone="light" className="pt-12 sm:pt-16 lg:pt-16">
        <Container className="max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] shadow-luxe">
            <Image
              src={article.image}
              alt={article.title}
              fill
              placeholder="blur"
              sizes="(min-width: 896px) 832px, 100vw"
              className="object-cover"
            />
          </div>

          <article className="mx-auto mt-12 max-w-3xl text-lg leading-[1.9] text-slate-700">
            <p className="text-xl leading-relaxed font-medium text-navy-900">{article.intro}</p>
            {article.sections.map((section) => (
              <section key={section.heading} className="mt-10">
                <h2 className="text-2xl font-bold text-navy-900 sm:text-[1.7rem]">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            <aside className="mt-12 flex gap-4 rounded-2xl border border-gold-600/30 bg-gold-100/60 p-6 text-base text-navy-900">
              <Info aria-hidden className="mt-1 size-5 shrink-0 text-gold-700" />
              <p>{tCommon('medicalDisclaimer')}</p>
            </aside>

            <div className="mt-10">
              <ButtonLink href="/articles" variant="outlineDark" size="md">
                <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
                {t('detail.back')}
              </ButtonLink>
            </div>
          </article>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section id="related" labelledBy="related-title" tone="light" className="border-t border-navy-900/10">
          <Container>
            <SectionHeading id="related-title" title={t('detail.related')} align="start" onLight />
            <ul className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug} data-reveal>
                  <ArticleCard article={item} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CtaSection variant="articles" />

      <JsonLd data={articleSchema(locale, article, {name: tDoctor('name'), jobTitle: tDoctor('title')})} />
    </>
  );
}
