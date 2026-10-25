import type {Locale} from '@/i18n/routing';
import {getDataset, getView} from './cms/server';
import {tr} from './cms/views';
import {SCHEMA_ID} from './schema';
import {absoluteUrl, localizedUrl} from './urls';

function postalAddress(address: string) {
  return {'@type': 'PostalAddress', streetAddress: address, addressCountry: 'EG'};
}

/** Site-wide graph: WebSite + MedicalBusiness (clinic) + Physician. Rendered once in the locale layout. */
export async function getSiteSchema(locale: Locale) {
  const [site, settings, heroes] = await Promise.all([getView('layout', locale), getDataset('settings'), getDataset('heroes')]);
  const home = heroes.find((h) => h.page === 'home');

  const rawBranches = settings?.branches ?? [];
  const [mainBranch, ...otherBranches] = site.branches;
  const geo = (i: number) => {
    const b = rawBranches[i];
    return b?.lat != null && b?.lng != null ? {'@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng} : undefined;
  };
  const sameAs = site.social.map((s) => s.url);
  const telephone = site.phones[0]?.value;
  const openingHoursSpecification = (settings?.opening_hours_spec ?? []).map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
    opens: h.opens,
    closes: h.closes
  }));
  const photo = site.doctor.photo ? absoluteUrl(site.doctor.photo) : undefined;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': SCHEMA_ID.website,
        url: localizedUrl(locale),
        name: site.siteName,
        inLanguage: locale,
        publisher: {'@id': SCHEMA_ID.clinic}
      },
      {
        '@type': 'MedicalBusiness',
        '@id': SCHEMA_ID.clinic,
        name: [site.doctor.name, site.doctor.title].filter(Boolean).join(' — '),
        description: tr(home?.meta_description, locale) || tr(home?.description, locale),
        url: localizedUrl(locale),
        logo: absoluteUrl('/images/icon-512.png'),
        image: absoluteUrl(`/images/og-${locale}.jpg`),
        telephone,
        email: site.email || undefined,
        priceRange: '$$',
        medicalSpecialty: 'https://schema.org/Surgical',
        ...(mainBranch ? {address: postalAddress(mainBranch.address), geo: geo(0)} : {}),
        openingHoursSpecification,
        sameAs,
        availableService: site.services.map((c) => ({'@type': 'MedicalProcedure', name: c.title, description: c.summary})),
        department: otherBranches.map((branch, i) => ({
          '@type': 'MedicalClinic',
          name: branch.name,
          address: postalAddress(branch.address),
          telephone: branch.phone || telephone,
          geo: geo(i + 1),
          openingHoursSpecification
        }))
      },
      {
        '@type': 'Physician',
        '@id': SCHEMA_ID.physician,
        name: site.doctor.name,
        description: site.doctor.title,
        url: localizedUrl(locale, '/about'),
        image: photo,
        telephone,
        priceRange: '$$',
        ...(mainBranch ? {address: postalAddress(mainBranch.address)} : {}),
        medicalSpecialty: 'https://schema.org/Surgical',
        isAcceptingNewPatients: true,
        openingHoursSpecification,
        sameAs,
        parentOrganization: {'@id': SCHEMA_ID.clinic}
      }
    ]
  };
}
