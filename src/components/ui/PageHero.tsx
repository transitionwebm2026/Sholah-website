import {CalendarCheck, ChevronRight, Phone} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import type {ReactNode} from 'react';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {useSite} from '@/lib/cms/site-context';
import type {ButtonView} from '@/lib/cms/views';
import {breadcrumbSchema} from '@/lib/schema';
import {telHref, whatsappHref} from '@/lib/site';
import {ButtonLink} from './ButtonLink';
import {CmsButton} from './CmsButton';
import {CmsImage} from './CmsImage';
import {Container} from './Container';
import {GoldText} from './GoldText';
import {WhatsAppIcon} from './Icons';
import {JsonLd} from './JsonLd';
import {Eyebrow} from './SectionHeading';
import {SocialLinks} from './SocialLinks';

type Crumb = {name: string; path: string};

export type HeroContent = {
  eyebrow?: string;
  /** Words between *asterisks* render in gold. */
  title: string;
  description?: string;
  /** Centre image; empty → the doctor's photo from the profile. */
  image?: string | null;
  /** Empty → "Book now" + WhatsApp. */
  buttons?: ButtonView[];
};

type Props = {
  hero: HeroContent;
  /** Trail after "Home" (+ BreadcrumbList JSON-LD). Omitted on the home page. The last item is the current page. */
  crumbs?: Crumb[];
  /** Extra content under the description (e.g. article meta). */
  children?: ReactNode;
};

/**
 * The one hero used by every page: the doctor's portrait centred as a full-height background,
 * the copy in the start-side column (it stops short of the centre on desktop so it never covers
 * the portrait), call-to-action buttons and a phone + social strip along the bottom.
 */
export function PageHero({hero, crumbs, children}: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Common');
  const site = useSite();
  const phone = site.phones[0];
  const items: Crumb[] | undefined = crumbs && [{name: t('home'), path: '/'}, ...crumbs];
  const buttons = hero.buttons ?? [];

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-brand">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />
        <div className="fx-float absolute -top-40 -end-32 size-[44rem] rounded-full bg-[radial-gradient(circle,rgb(223_165_129/0.22),transparent_62%)]" />
        <div className="fx-float-alt absolute -bottom-64 -start-48 size-[40rem] rounded-full bg-[radial-gradient(circle,rgb(3_22_51/0.7),transparent_70%)]" />
      </div>

      {/* Portrait: full height, centred, edges faded into the brand gradient. Fixed width on desktop so
          it keeps clear of the copy column however tall the hero grows. */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 aspect-[4/5] h-full -translate-x-1/2 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] lg:aspect-auto lg:w-[32rem]">
        {/* LCP element: preloaded with high fetch priority. */}
        <CmsImage
          src={hero.image || site.doctor.photo}
          alt={site.doctor.imageAlt}
          priority
          sizes="(min-width: 1024px) 512px, 720px"
          className="fx-portrait object-cover object-top"
        />
      </div>
      {/* Scrim: the copy sits on the portrait on phones/tablets; on desktop it only deepens the start side. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 max-lg:bg-navy-950/60 lg:bg-linear-to-r lg:from-navy-950/80 lg:via-navy-950/25 lg:via-40% lg:to-transparent lg:to-60% lg:rtl:bg-linear-to-l"
      />

      <Container className="pt-8 pb-12 sm:pt-10 lg:flex lg:min-h-[34rem] lg:flex-col lg:justify-center lg:pt-12 lg:pb-16">
        {/* Desktop: the column ends 10rem before the centre line, i.e. just outside the portrait. */}
        <div className="max-w-3xl lg:max-w-[calc(50%-10rem)]">
          {items && (
            <nav aria-label={t('breadcrumb')} className="fx-enter mb-8">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                {items.map((item, index) => {
                  const isLast = index === items.length - 1;
                  return (
                    <li key={item.path} className="flex items-center gap-2">
                      {index > 0 && <ChevronRight aria-hidden className="size-4 text-gold-400/70 rtl:-scale-x-100" />}
                      {isLast ? (
                        <span aria-current="page" className="text-gold-300">
                          {item.name}
                        </span>
                      ) : (
                        <Link href={item.path} className="fx-underline hover:text-gold-300">
                          {item.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          {hero.eyebrow && <Eyebrow className="fx-enter [--enter-delay:40ms]">{hero.eyebrow}</Eyebrow>}
          <h1
            id="hero-title"
            className="fx-enter text-4xl leading-[1.18] font-bold text-balance [--enter-delay:80ms] sm:text-5xl lg:text-[2.3rem] xl:text-[3.25rem]"
          >
            <GoldText text={hero.title} />
          </h1>

          {hero.description && (
            <p className="fx-enter mt-6 text-lg leading-relaxed text-pretty text-white/80 [--enter-delay:240ms] sm:text-xl lg:text-lg xl:text-xl">
              {hero.description}
            </p>
          )}

          {children && <div className="fx-enter [--enter-delay:320ms]">{children}</div>}

          <div className="fx-enter mt-10 flex flex-col gap-4 [--enter-delay:400ms] sm:flex-row sm:flex-wrap">
            {buttons.length > 0 ? (
              buttons.map((button) => <CmsButton key={`${button.href}-${button.label}`} button={button} />)
            ) : (
              <>
                <ButtonLink href="/contact">
                  <CalendarCheck aria-hidden className="size-5" />
                  {t('bookNow')}
                </ButtonLink>
                {site.whatsapp && (
                  <ButtonLink href={whatsappHref(site.whatsapp, site.greeting)} external variant="outline">
                    <WhatsAppIcon className="size-5" />
                    {t('whatsapp')}
                  </ButtonLink>
                )}
              </>
            )}
          </div>
        </div>
      </Container>

      {/* Contact strip: phone + social links, aligned to the start edge (right in Arabic). */}
      <Container className="pb-12">
        <div className="fx-enter flex flex-col gap-5 border-t border-white/10 pt-6 [--enter-delay:560ms] sm:flex-row sm:items-center sm:gap-8">
          {phone && (
            <>
              <a href={telHref(phone.value)} className="group flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-gold-400/15 text-gold-300 transition group-hover:bg-gold-400 group-hover:text-navy-950">
                  <Phone aria-hidden className="size-5" />
                </span>
                <span>
                  <span className="block text-xs text-white/65">{t('reachUs')}</span>
                  <span dir="ltr" className="block font-semibold tracking-wide">
                    {phone.display}
                  </span>
                </span>
              </a>
              <span aria-hidden className="hidden h-8 w-px bg-white/15 sm:block" />
            </>
          )}
          <SocialLinks />
        </div>
      </Container>

      {items && <JsonLd data={breadcrumbSchema(locale, items)} />}
    </section>
  );
}
