'use client';

import {ArrowLeft, CalendarDays, Clock, Info, LoaderCircle} from 'lucide-react';
import Image from 'next/image';
import {useSearchParams} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';
import {useEffect} from 'react';
import brandMark from '@/assets/images/brand/mark.png';
import {ArticleCard} from '@/components/cards/ArticleCard';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {CmsImage} from '@/components/ui/CmsImage';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {JsonLd} from '@/components/ui/JsonLd';
import {PageHero} from '@/components/ui/PageHero';
import {RichText} from '@/components/ui/RichText';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Locale} from '@/i18n/routing';
import {useArticleHref} from '@/lib/cms/article-links';
import {useLiveView} from '@/lib/cms/live';
import {useNavLabel, useSite} from '@/lib/cms/site-context';
import type {ArticleViewData} from '@/lib/cms/views';
import {articleSchema} from '@/lib/schema';
import {formatDate} from '@/lib/utils';

type Props = {
  /** Build-time content; `null` on the client-only `/articles/view` page. */
  initial: ArticleViewData | null;
  slug: string;
};

export function ArticleView({initial, slug}: Props) {
  const {data, status} = useLiveView('article', initial, slug);
  const locale = useLocale() as Locale;
  const t = useTranslations('Articles');
  const tCommon = useTranslations('Common');
  const site = useSite();
  const navLabel = useNavLabel('articles');
  const article = data?.article ?? null;
  const href = useArticleHref(slug);

  // The client-only page has a generic <title> in its HTML; show the article's once it loads.
  useEffect(() => {
    if (!initial && article) document.title = `${article.title} | ${site.siteName}`;
  }, [initial, article, site.siteName]);

  if (!data || !article) {
    return (
      <Section id="article" tone="light" className="min-h-[60vh]">
        <Container className="max-w-3xl text-center">
          {!data && status === 'loading' ? (
            <p role="status" className="inline-flex items-center gap-3 text-lg text-slate-600">
              <LoaderCircle aria-hidden className="size-5 animate-spin text-gold-600" />
              {t('view.loading')}
            </p>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-navy-900">{t('view.notFound')}</h1>
              <ButtonLink href="/articles" variant="outlineDark" size="md" className="mt-8">
                <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
                {t('detail.back')}
              </ButtonLink>
            </>
          )}
        </Container>
      </Section>
    );
  }

  const path = typeof href === 'string' ? href : `/articles/${slug}`;

  return (
    <>
      {/* Reading progress (scroll-driven CSS; stays hidden where unsupported). */}
      <div
        aria-hidden
        className="fx-progress fixed inset-x-0 top-0 z-[60] h-[3px] bg-linear-to-r from-gold-600 via-gold-400 to-gold-200 rtl:bg-linear-to-l"
      />
      <PageHero
        hero={{eyebrow: article.category, title: article.title, description: article.excerpt, image: data.hero.image, buttons: data.hero.buttons}}
        crumbs={[
          {name: navLabel, path: '/articles'},
          {name: article.title, path}
        ]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
          <span className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-400/35 bg-navy-800">
              <Image src={brandMark} alt="" className="h-7 w-auto" />
            </span>
            <span>
              <span className="block text-xs text-white/60">{t('detail.writtenBy')}</span>
              <span className="block font-semibold text-white">{site.doctor.name}</span>
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
          {article.image && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-navy-900 shadow-luxe">
              <CmsImage src={article.image} alt={article.title} sizes="(min-width: 896px) 832px, 100vw" className="object-cover" />
            </div>
          )}

          <article className="mx-auto mt-12 max-w-3xl text-lg leading-[1.9] text-slate-700">
            <RichText doc={article.content} />

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

      {data.related.length > 0 && (
        <Section id="related" labelledBy="related-title" tone="light" className="border-t border-navy-900/10">
          <Container>
            <SectionHeading id="related-title" title={t('detail.related')} align="start" onLight />
            <ul className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {data.related.map((item) => (
                <li key={item.slug} data-reveal>
                  <ArticleCard article={item} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CtaSection band={data.hero.band} />

      <JsonLd data={articleSchema(locale, article, {name: site.doctor.name, jobTitle: site.doctor.title})} />
    </>
  );
}

/** `/articles/view?slug=…`: articles published after the last build, rendered in the browser. */
export function ArticleQueryView() {
  const slug = useSearchParams().get('slug')?.trim() ?? '';
  return <ArticleView key={slug} initial={null} slug={slug} />;
}
