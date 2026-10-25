/**
 * Non-translatable, build-level configuration. Everything editable (phones, WhatsApp, social
 * links, branches, hours…) now lives in the CMS: Dashboard → Global settings.
 */
export const siteConfig = {
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com').replace(/\/+$/, '')
} as const;

/** `number`: international format, digits only (as stored in the CMS). */
export function whatsappHref(number: string, text?: string) {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
