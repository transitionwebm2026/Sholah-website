'use client';

import {Clock, Mail, MapPin, Phone} from 'lucide-react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import transitionMark from '@/assets/images/brand/transition.png';
import {Link} from '@/i18n/navigation';
import {useSite} from '@/lib/cms/site-context';
import {telHref} from '@/lib/site';
import {Container} from '../ui/Container';
import {SocialLinks} from '../ui/SocialLinks';
import {Brand} from './Brand';

function FooterHeading({children}: {children: React.ReactNode}) {
  return <h2 className="mb-5 text-base font-bold text-gold-300">{children}</h2>;
}

/** "Design & development by Transition" pill, in the site's copper-gold with the mark on a navy tile. */
function DesignCredit({label}: {label: string}) {
  return (
    <a
      href="https://transitioneg.com/"
      target="_blank"
      rel="noopener"
      className="btn-fx fx-shine inline-flex min-h-12 items-center gap-3 rounded-full bg-linear-to-r from-gold-600 via-gold-400 to-gold-300 px-5 py-1.5 text-navy-950 shadow-gold transition duration-300 motion-safe:hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgb(223_165_129/0.75)] rtl:bg-linear-to-l"
    >
      <span className="text-sm font-semibold">{label}</span>
      <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-navy-950 ring-1 ring-navy-950/20">
        <Image src={transitionMark} alt="" className="h-6 w-auto" />
      </span>
      <span dir="ltr" className="text-base font-bold tracking-wide">
        Transition
      </span>
    </a>
  );
}

/** `{year}` and `{name}` placeholders in the CMS copyright line. */
function fillCopyright(template: string, name: string) {
  return template.replace(/\{year\}/g, String(new Date().getFullYear())).replace(/\{name\}/g, name);
}

export function Footer() {
  const t = useTranslations('Footer');
  const site = useSite();
  const mainBranch = site.branches[0];

  const linkClass = 'text-white/75 transition-colors hover:text-gold-300';
  const navLinkClass = 'fx-underline text-white/75 hover:text-gold-300';

  return (
    <footer className="relative overflow-x-clip border-t border-gold-400/20 bg-navy-950 text-white">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div data-reveal className="sm:col-span-2 lg:col-span-4">
          <Brand variant="stacked" />
          {site.footer.about && <p className="mt-6 max-w-sm leading-relaxed text-white/75">{site.footer.about}</p>}
          <SocialLinks className="mt-6" />
        </div>

        <nav data-reveal aria-labelledby="footer-links" className="lg:col-span-2">
          <FooterHeading>
            <span id="footer-links">{t('quickLinks')}</span>
          </FooterHeading>
          <ul className="space-y-3">
            {site.footer.quickLinks.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                {/^https?:/i.test(item.href) ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={navLinkClass}>
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className={navLinkClass}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <nav data-reveal aria-labelledby="footer-services" className="lg:col-span-3">
          <FooterHeading>
            <span id="footer-services">{t('services')}</span>
          </FooterHeading>
          <ul className="space-y-3">
            {site.services.map((category) => (
              <li key={category.slug}>
                <Link href={`/services#${category.slug}`} className={navLinkClass}>
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div data-reveal className="lg:col-span-3">
          <FooterHeading>{t('contact')}</FooterHeading>
          <address className="space-y-4 not-italic">
            {site.phones.map((phone) => (
              <a key={phone.value} href={telHref(phone.value)} className={`flex items-center gap-3 ${linkClass}`}>
                <Phone aria-hidden className="size-4 shrink-0 text-gold-400" />
                <span dir="ltr">{phone.display}</span>
              </a>
            ))}
            {site.email && (
              <a href={`mailto:${site.email}`} className={`flex items-center gap-3 ${linkClass}`}>
                <Mail aria-hidden className="size-4 shrink-0 text-gold-400" />
                {site.email}
              </a>
            )}
            {mainBranch && (
              <p className="flex gap-3 text-white/75">
                <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-gold-400" />
                <span>{mainBranch.address}</span>
              </p>
            )}
          </address>

          {site.hours.length > 0 && (
            <>
              <h3 className="mt-8 mb-3 flex items-center gap-2 text-sm font-bold text-gold-300">
                <Clock aria-hidden className="size-4" />
                {t('hours')}
              </h3>
              <dl className="space-y-1.5 text-sm">
                {site.hours.map((row) => (
                  <div key={row.days} className="flex justify-between gap-4">
                    <dt className="text-white/75">{row.days}</dt>
                    <dd className="text-white">{row.time}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container data-reveal="up" className="flex flex-col gap-3 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>{fillCopyright(site.footer.copyright, site.doctor.name || site.siteName)}</p>
          {/* `md:me-20` keeps it clear of the floating contact buttons in the end corner. */}
          <p className="max-w-xl md:me-20">{site.footer.disclaimer}</p>
        </Container>
        {/* Centred, with extra room on phones, so the floating WhatsApp + phone buttons never cover it. */}
        <div data-reveal="up" className="flex justify-center px-4 pb-40 sm:pb-10">
          <DesignCredit label={t('credit')} />
        </div>
      </div>
    </footer>
  );
}
