import {CalendarDays, Clock} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useArticleHref} from '@/lib/cms/article-links';
import type {ArticleCardView} from '@/lib/cms/views';
import {cn, formatDate} from '@/lib/utils';
import {CmsImage} from '../ui/CmsImage';
import {DirectionalArrow} from '../ui/DirectionalArrow';

type Props = {
  article: ArticleCardView;
  variant?: 'default' | 'featured';
  headingLevel?: 'h2' | 'h3';
  /** Eager-load the image (used for the above-the-fold featured article). */
  preload?: boolean;
};

export function ArticleCard({article, variant = 'default', headingLevel = 'h3', preload}: Props) {
  const locale = useLocale();
  const t = useTranslations('Common');
  const tArticles = useTranslations('Articles');
  const href = useArticleHref(article.slug);
  const Heading = headingLevel;
  const featured = variant === 'featured';

  return (
    <article
      className={cn(
        'fx-card group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-900/5 hover:shadow-luxe',
        featured && 'lg:grid lg:grid-cols-2 [--fx-tilt:4deg]'
      )}
    >
      <div
        className={cn('relative overflow-hidden bg-navy-900', featured ? 'aspect-[16/10] lg:aspect-auto lg:min-h-[26rem]' : 'aspect-[16/9]')}
      >
        <CmsImage
          src={article.image}
          priority={preload}
          sizes={featured ? '(min-width: 1024px) 640px, 100vw' : '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw'}
          className="fx-media object-cover"
        />
        <div className="absolute top-4 start-4 flex flex-wrap gap-2">
          {featured && (
            <span className="rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-navy-950">{tArticles('featured')}</span>
          )}
          {article.category && (
            <span className="rounded-full bg-navy-950/85 px-3 py-1 text-xs font-semibold text-gold-200">{article.category}</span>
          )}
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col', featured ? 'p-7 sm:p-10 lg:justify-center' : 'p-6 sm:p-7')}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4 text-gold-600" />
            <time dateTime={article.published}>{formatDate(article.published, locale)}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-4 text-gold-600" />
            {t('minutesRead', {count: article.readMinutes, minutes: String(article.readMinutes)})}
          </span>
        </div>

        <Heading className={cn('mt-3 leading-snug font-bold text-navy-900 text-balance', featured ? 'text-2xl sm:text-3xl' : 'text-xl')}>
          {/* Stretched link: the whole card is clickable while keeping a single, meaningful link. */}
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline-2 focus-visible:after:outline-gold-600"
          >
            {article.title}
          </Link>
        </Heading>

        <p className={cn('mt-3 leading-relaxed text-slate-600', featured ? 'text-lg' : 'line-clamp-3')}>{article.excerpt}</p>

        <span aria-hidden className="mt-auto inline-flex items-center gap-2 pt-6 font-semibold text-gold-700">
          {t('readArticle')}
          <DirectionalArrow />
        </span>
      </div>
    </article>
  );
}
