import {getLocale, getTranslations} from 'next-intl/server';
import {routing, type Locale} from '@/i18n/routing';
import {navItems} from '@/lib/navigation';
import {siteConfig, telHref} from '@/lib/site';
import {ButtonLink} from '../ui/ButtonLink';
import {Container} from '../ui/Container';
import {Brand} from './Brand';
import {LanguageSwitcher} from './LanguageSwitcher';
import {MobileMenu} from './MobileMenu';
import {NavLinks} from './NavLinks';

export async function Header() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();
  const target = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  const items = navItems.map((item) => ({href: item.href, label: t(`Nav.${item.key}`)}));
  const switchLabel = t('Language.switchTo', {language: t(`Language.names.${target}`)});

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/90 backdrop-blur-md">
      <Container className="flex h-18 items-center justify-between gap-4">
        <Brand />

        <nav aria-label={t('Common.mainNav')} className="hidden xl:block">
          <NavLinks items={items} variant="desktop" />
        </nav>

        <div className="flex items-center gap-2.5">
          {/* Responsive visibility lives on wrappers: the components' own `inline-flex` would override `hidden`. */}
          <div className="hidden sm:block">
            <LanguageSwitcher label={switchLabel} />
          </div>
          <div className="hidden md:block">
            <ButtonLink href="/contact" size="md">
              {t('Common.bookNow')}
            </ButtonLink>
          </div>
          <MobileMenu
            className="xl:hidden"
            items={items}
            brand={<Brand />}
            phone={{href: telHref(siteConfig.phones[0].value), display: siteConfig.phones[0].display}}
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
