/**
 * Non-translatable site configuration.
 * Replace every placeholder below (phones, WhatsApp, social links, coordinates) before going live.
 * Translatable text (names, addresses, hours) lives in `messages/{ar,en}.json`.
 */
export const siteConfig = {
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com').replace(/\/+$/, ''),

  phones: [
    {value: '+201000000000', display: '+20 100 000 0000'},
    {value: '+201200000000', display: '+20 120 000 0000'}
  ],

  /** International format without "+" or spaces, as required by wa.me links. */
  whatsapp: '201000000000',

  email: 'info@example.com',

  social: [
    {network: 'Facebook', href: 'https://www.facebook.com/your-page'},
    {network: 'Instagram', href: 'https://www.instagram.com/your-account'},
    {network: 'YouTube', href: 'https://www.youtube.com/@your-channel'},
    {network: 'TikTok', href: 'https://www.tiktok.com/@your-account'}
  ],

  /** Order must match `Clinic.branches` in the message files. */
  clinics: [
    {id: 'main', lat: 30.0566, lng: 31.3301, phone: 0},
    {id: 'heliopolis', lat: 30.0911, lng: 31.3402, phone: 1}
  ],

  /** Used for JSON-LD `openingHoursSpecification` (24h clock, clinic local time). */
  openingHours: [
    {days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'], opens: '17:00', closes: '22:00'},
    {days: ['Thursday'], opens: '12:00', closes: '16:00'}
  ],

  stats: {
    patients: 12000,
    surgeries: 8500,
    years: 18,
    publications: 35
  }
} as const;

export type SocialNetwork = (typeof siteConfig.social)[number]['network'];

export function whatsappHref(text?: string) {
  return `https://wa.me/${siteConfig.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function telHref(phone: string) {
  return `tel:${phone}`;
}

export function mapsEmbedSrc(lat: number, lng: number, locale: string) {
  return `https://www.google.com/maps?q=${lat},${lng}&z=16&hl=${locale}&output=embed`;
}

export function mapsDirectionsHref(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
