'use client';

import {useLocale, useTranslations} from 'next-intl';
import {routing, type Locale} from '@/i18n/routing';
import {useSite} from '@/lib/cms/site-context';
import {telHref} from '@/lib/site';
import {ButtonLink} from '../ui/ButtonLink';
import {Container} from '../ui/Container';
import {Brand} from './Brand';
import {LanguageSwitcher} from './LanguageSwitcher';
import {MobileMenu} from './MobileMenu';
import {NavLinks} from './NavLinks';

export function Header() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const site = useSite();
  const target = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
  const switchLabel = t('Language.switchTo', {language: t(`Language.names.${target}`)});
  const phone = site.phones[0];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/90 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between gap-3 sm:gap-4">
        <Brand />

        <nav aria-label={t('Common.mainNav')} className="hidden xl:block">
          <NavLinks items={site.nav} variant="desktop" />
        </nav>

        {/* `shrink-0`: on narrow phones the logo gives up width, never these controls. */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <LanguageSwitcher label={switchLabel} compact />
          {/* Responsive visibility lives on the wrapper: the component's own `inline-flex` would override `hidden`. */}
          <div className="hidden md:block">
            <ButtonLink href="/contact" size="md">
              {t('Common.bookNow')}
            </ButtonLink>
          </div>
          <MobileMenu
            className="xl:hidden"
            items={site.nav}
            brand={<Brand />}
            phone={phone ? {href: telHref(phone.value), display: phone.display} : null}
            labels={{
              open: t('Common.openMenu'),
              close: t('Common.closeMenu'),
              nav: t('Common.mainNav'),
              bookNow: t('Common.bookNow'),
              switchLanguage: switchLabel
            }}
          />
        </div>
      </Container>
    </header>
  );
}
