import {getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {getClinicInfo, getServiceCategories, media} from './content';
import {absoluteUrl, localizedUrl} from './seo';
import {siteConfig} from './site';
import type {Article, Branch, FaqItem} from './types';

const ID = {
  website: `${siteConfig.url}/#website`,
  clinic: `${siteConfig.url}/#clinic`,
  physician: `${siteConfig.url}/#physician`
};

function postalAddress(branch: Branch) {
  return {
    '@type': 'PostalAddress',
    streetAddress: branch.street,
    addressLocality: branch.area,
    addressRegion: branch.city,
    addressCountry: 'EG'
  };
}

/** Site-wide graph: WebSite + MedicalBusiness (clinic) + Physician. Rendered once in the locale layout. */
export async function getSiteSchema(locale: Locale) {
  const [tDoctor, tMeta, clinic, categories] = await Promise.all([
    getTranslations({locale, namespace: 'Doctor'}),
    getTranslations({locale, namespace: 'Metadata'}),
    getClinicInfo(locale),
    getServiceCategories(locale)
  ]);

  const [mainBranch, ...otherBranches] = clinic.branches;
  const mainConfig = siteConfig.clinics[0];
  const sameAs = siteConfig.social.map((s) => s.href);
  const openingHoursSpecification = siteConfig.openingHours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
    opens: h.opens,
    closes: h.closes
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': ID.website,
        url: localizedUrl(locale),
        name: tMeta('siteName'),
        inLanguage: locale,
        publisher: {'@id': ID.clinic}
      },
      {
        '@type': 'MedicalBusiness',
        '@id': ID.clinic,
        name: `${tDoctor('name')} — ${tDoctor('title')}`,
        description: tMeta('pages.home.description'),
        url: localizedUrl(locale),
        logo: absoluteUrl('/images/icon-512.png'),
        image: absoluteUrl(`/images/og-${locale}.jpg`),
        telephone: siteConfig.phones[0].value,
        email: siteConfig.email,
        priceRange: '$$',
        medicalSpecialty: 'https://schema.org/Surgical',
        address: postalAddress(mainBranch),
        geo: {'@type': 'GeoCoordinates', latitude: mainConfig.lat, longitude: mainConfig.lng},
        hasMap: `https://www.google.com/maps?q=${mainConfig.lat},${mainConfig.lng}`,
        openingHoursSpecification,
        sameAs,
        availableService: categories.map((c) => ({
          '@type': 'MedicalProcedure',
          name: c.title,
          description: c.summary
        })),
        department: otherBranches.map((branch, i) => {
          const config = siteConfig.clinics[i + 1];
          return {
            '@type': 'MedicalClinic',
            name: branch.name,
            address: postalAddress(branch),
            telephone: siteConfig.phones[config.phone].value,
            geo: {'@type': 'GeoCoordinates', latitude: config.lat, longitude: config.lng},
            openingHoursSpecification
          };
        })
      },
      {
        '@type': 'Physician',
        '@id': ID.physician,
        name: tDoctor('name'),
        description: tDoctor('title'),
        url: localizedUrl(locale, '/about'),
        image: absoluteUrl(media.doctorPortrait.src),
        telephone: siteConfig.phones[0].value,
        priceRange: '$$',
        address: postalAddress(mainBranch),
        medicalSpecialty: 'https://schema.org/Surgical',
        isAcceptingNewPatients: true,
        openingHoursSpecification,
        sameAs,
        parentOrganization: {'@id': ID.clinic}
      }
    ]
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {'@type': 'Answer', text: item.answer}
    }))
  };
}

export function breadcrumbSchema(locale: Locale, items: Array<{name: string; path: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: localizedUrl(locale, item.path)
    }))
  };
}

type Author = {name: string; jobTitle: string};

function articleNode(locale: Locale, article: Article, author: Author) {
  const url = localizedUrl(locale, `/articles/${article.slug}`);
  return {
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: [absoluteUrl(article.image.src)],
    datePublished: article.published,
    dateModified: article.published,
    inLanguage: locale,
    articleSection: article.category,
    url,
    mainEntityOfPage: {'@type': 'WebPage', '@id': url},
    author: {
      '@type': 'Person',
      name: author.name,
      url: localizedUrl(locale, '/about'),
      jobTitle: author.jobTitle
    },
    publisher: {'@id': ID.clinic}
  };
}

export function articleSchema(locale: Locale, article: Article, author: Author) {
  return {'@context': 'https://schema.org', ...articleNode(locale, article, author)};
}

/** Articles index: a CollectionPage whose main entity is an ItemList of Article entries. */
export function articleListSchema(locale: Locale, articles: Article[], author: Author, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: localizedUrl(locale, '/articles'),
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: articleNode(locale, article, author)
      }))
    }
  };
}
