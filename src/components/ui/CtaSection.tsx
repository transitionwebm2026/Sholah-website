import {Phone} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useSite} from '@/lib/cms/site-context';
import type {HeroView} from '@/lib/cms/views';
import {telHref, whatsappHref} from '@/lib/site';
import {ButtonLink} from './ButtonLink';
import {Container} from './Container';
import {DirectionalArrow} from './DirectionalArrow';
import {WhatsAppIcon} from './Icons';
import {Section} from './Section';
import {Eyebrow} from './SectionHeading';

type Props = {
  /** Each page's band text (Dashboard → Pages → "Bottom call to action"). */
  band: HeroView['band'];
  /** On the contact page the primary action is a phone call instead of a link to itself. */
  primary?: 'contact' | 'call';
};

export function CtaSection({band, primary = 'contact'}: Props) {
  const tc = useTranslations('Common');
  const site = useSite();
  const phone = site.phones[0];
  if (!band.title) return null;

  return (
    <Section id="book" labelledBy="cta-title" tone="deep" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div
          data-reveal="zoom"
          className="relative isolate overflow-hidden rounded-[2rem] border border-gold-400/25 bg-brand px-6 py-14 text-center shadow-luxe sm:px-12 lg:py-20"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-grid opacity-60" />
            <div className="fx-float absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(223_165_129/0.25),transparent_65%)]" />
          </div>

          {band.eyebrow && <Eyebrow className="justify-center">{band.eyebrow}</Eyebrow>}
          <h2 id="cta-title" className="mx-auto max-w-3xl text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl">
            {band.title}
          </h2>
          {band.text && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{band.text}</p>}

          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            {primary === 'call' && phone ? (
              <ButtonLink href={telHref(phone.value)} external>
                <Phone aria-hidden className="fx-wiggle size-5" />
                {tc('callNow')}
              </ButtonLink>
            ) : (
              <ButtonLink href="/contact">
                {tc('contactUs')}
                <DirectionalArrow />
              </ButtonLink>
            )}
            {site.whatsapp && (
              <ButtonLink href={whatsappHref(site.whatsapp, site.greeting)} external variant="whatsapp">
                <WhatsAppIcon className="fx-wiggle size-5" />
                {tc('whatsappChat')}
              </ButtonLink>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
