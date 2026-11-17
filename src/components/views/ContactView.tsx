'use client';

import {Clock, Mail, MapPin, Phone} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useState, type ReactNode} from 'react';
import {ClinicSchedule, ScheduleLines} from '@/components/contact/ClinicSchedule';
import {ContactForm} from '@/components/interactive/ContactForm';
import {Container} from '@/components/ui/Container';
import {CtaSection} from '@/components/ui/CtaSection';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
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
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-400/15">
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
  const tDays = useTranslations('Common.weekdays');
  const site = useSite();
  const navLabel = useNavLabel('contact');
  // "Book at this location" on a branch card picks it in the form (`n` re-applies a repeated pick).
  const [pick, setPick] = useState<{clinic: string; n: number} | undefined>();

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

  // With per-branch schedules the week grid above replaces the old clinics + hours cards.
  const hasSchedules = site.branches.some((b) => b.schedule.length > 0);
  const mainBranch = site.branches[0];

  return (
    <>
      <PageHero hero={v.hero} crumbs={[{name: navLabel, path: '/contact'}]} />

      {site.branches.length > 0 && (
        <ClinicSchedule
          branches={site.branches}
          heading={v.schedule}
          phone={site.phones[0]?.value}
          onBook={(clinic) => setPick((p) => ({clinic, n: (p?.n ?? 0) + 1}))}
        />
      )}

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
              preselect={pick}
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

            {hasSchedules && mainBranch ? (
              <InfoCard icon={MapPin} title={mainBranch.name}>
                {mainBranch.address && <p className="text-white/75">{mainBranch.address}</p>}
                {mainBranch.schedule.length > 0 && (
                  <ScheduleLines slots={mainBranch.schedule} dayLabel={(d) => tDays(d)} className="mt-4" />
                )}
                <a href="#schedule" className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-300">
                  <span className="fx-underline">{t('schedule.seeAll')}</span>
                  <DirectionalArrow />
                </a>
              </InfoCard>
            ) : (
              <>
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
              </>
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

      <CtaSection band={v.hero.band} primary="call" />
    </>
  );
}
