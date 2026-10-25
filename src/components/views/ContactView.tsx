'use client';

import {Clock, Mail, MapPin, Navigation, Phone} from 'lucide-react';
import {useTranslations} from 'next-intl';
import type {ReactNode} from 'react';
import {ContactForm} from '@/components/interactive/ContactForm';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {PageHero} from '@/components/ui/PageHero';
import {Section} from '@/components/ui/Section';
import {SocialLinks} from '@/components/ui/SocialLinks';
import {useLiveView} from '@/lib/cms/live';
import {useNavLabel, useSite} from '@/lib/cms/site-context';
import type {ContactViewData} from '@/lib/cms/views';
import {telHref} from '@/lib/site';

function InfoCard({icon: Icon, title, children}: {icon: typeof Phone; title: string; children: ReactNode}) {
  return (
    // `lg:flex-1`: the cards share out any height the form column has beyond theirs.
    <div data-reveal className="fx-glow rounded-3xl border border-white/10 bg-white/[0.05] p-6 hover:border-gold-400/30 lg:flex-1">
      <h3 className="flex items-center gap-3 font-bold text-gold-300">
        <span className="grid size-10 place-items-center rounded-full bg-gold-400/15">
          <Icon aria-hidden className="size-5" />
        </span>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function ContactView({initial}: {initial: ContactViewData}) {
  const v = useLiveView('contact', initial).data ?? initial;
  const t = useTranslations('Contact');
  const tCommon = useTranslations('Common');
  const site = useSite();
  const navLabel = useNavLabel('contact');

  const formLabels = {
    description: t('form.description'),
    name: t('form.name'),
    namePlaceholder: t('form.namePlaceholder'),
    phone: t('form.phone'),
    phonePlaceholder: t('form.phonePlaceholder'),
    age: t('form.age'),
    requestType: t('form.requestType'),
    service: t('form.service'),
    clinic: t('form.clinic'),
    message: t('form.message'),
    messagePlaceholder: t('form.messagePlaceholder'),
    optional: t('form.optional'),
    submit: t('form.submit'),
    privacy: t('form.privacy'),
    success: t('form.success'),
    errors: {name: t('form.errors.name'), phone: t('form.errors.phone')},
    whatsapp: {heading: t('form.whatsapp.heading'), footer: t('form.whatsapp.footer')}
  };

  const requestTypes = (['consultation', 'followup', 'surgery', 'online'] as const).map((value) => ({
    value,
    label: t(`form.requestTypes.${value}`)
  }));
  const services = [{value: '', label: t('form.serviceUnsure')}, ...site.services.map((c) => ({value: c.slug, label: c.title}))];
  const clinics = site.branches.map((b) => ({value: b.id, label: b.name}));

  return (
    <>
      <PageHero hero={v.hero} crumbs={[{name: navLabel, path: '/contact'}]} />

      {/* Two mirrored columns: same heading row, then the form and the card stack share top and bottom edges. */}
      <Section id="booking" labelledBy="booking-title" tone="deep">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <h2 id="booking-title" data-reveal="up" className="text-2xl font-bold">
              {t('form.title')}
            </h2>
            <ContactForm
              labelledBy="booking-title"
              labels={formLabels}
              requestTypes={requestTypes}
              services={services}
              clinics={clinics}
              whatsappNumber={site.whatsapp}
              className="flex-1"
            />
          </div>

          <div className="flex flex-col gap-5 lg:col-span-5">
            <h2 id="contact-info-title" data-reveal="up" className="text-2xl font-bold">
              {t('info.title')}
            </h2>

            {site.phones.length > 0 && (
              <InfoCard icon={Phone} title={t('info.phones')}>
                <ul className="space-y-2">
                  {site.phones.map((phone) => (
                    <li key={phone.value}>
                      <a href={telHref(phone.value)} dir="ltr" className="fx-underline text-lg font-semibold hover:text-gold-300">
                        {phone.display}
                      </a>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}

            {site.branches.length > 0 && (
              <InfoCard icon={MapPin} title={t('info.clinics')}>
                <ul className="space-y-4">
                  {site.branches.map((branch) => (
                    <li key={branch.id}>
                      <p className="font-semibold">{branch.name}</p>
                      <p className="mt-1 text-white/75">{branch.address}</p>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}

            {site.hours.length > 0 && (
              <InfoCard icon={Clock} title={t('info.hours')}>
                <dl className="space-y-2">
                  {site.hours.map((row) => (
                    <div key={row.days} className="flex justify-between gap-4">
                      <dt className="text-white/75">{row.days}</dt>
                      <dd className="font-semibold">{row.time}</dd>
                    </div>
                  ))}
                </dl>
              </InfoCard>
            )}

            <InfoCard icon={Mail} title={tCommon('email')}>
              {site.email && (
                <a href={`mailto:${site.email}`} className="fx-underline font-semibold hover:text-gold-300">
                  {site.email}
                </a>
              )}
              <SocialLinks className="mt-5" />
            </InfoCard>
          </div>
        </Container>
      </Section>

      {/* Maps: native lazy-loaded iframes, so Google Maps only downloads when scrolled near. */}
      {site.branches.some((b) => b.mapEmbedUrl) && (
        <Section id="locations" labelledBy="locations-title" tone="brand">
          <Container>
            <h2 id="locations-title" data-reveal="up" className="text-center text-3xl font-bold sm:text-4xl">
              {t('info.clinics')}
            </h2>
            <ul className="mt-12 grid gap-8 lg:grid-cols-2">
              {site.branches.map((branch) => (
                <li key={branch.id} data-reveal className="overflow-hidden rounded-[2rem] border border-white/10 bg-navy-950 shadow-luxe">
                  {branch.mapEmbedUrl && (
                    <iframe
                      src={branch.mapEmbedUrl}
                      title={t('info.mapTitle', {clinic: branch.name})}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="aspect-[4/3] w-full border-0 sm:aspect-[16/10]"
                    />
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-6">
                    <div>
                      <h3 className="font-bold">{branch.name}</h3>
                      <p className="mt-1 text-sm text-white/75">{branch.address}</p>
                    </div>
                    {branch.directionsUrl && (
                      <a
                        href={branch.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-fx fx-wipe inline-flex min-h-11 items-center gap-2 rounded-full border border-gold-400/40 px-5 text-sm font-semibold text-gold-300 transition duration-300 hover:border-gold-400 hover:text-navy-950 focus-visible:text-navy-950"
                      >
                        <Navigation aria-hidden className="fx-wiggle size-4" />
                        {t('info.directions')}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CtaSection band={v.hero.band} primary="call" />
    </>
  );
}
