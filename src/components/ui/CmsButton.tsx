'use client';

import {CalendarCheck, Phone} from 'lucide-react';
import {useSite} from '@/lib/cms/site-context';
import type {ButtonView} from '@/lib/cms/views';
import {telHref, whatsappHref} from '@/lib/site';
import {ButtonLink} from './ButtonLink';
import {DirectionalArrow} from './DirectionalArrow';
import {WhatsAppIcon} from './Icons';

/**
 * A call-to-action from the CMS. `href` may be a site path (`/contact`), an anchor (`#booking`),
 * a full URL, or the keywords `whatsapp` / `tel`, which use the numbers from Global settings.
 * The icon follows the destination, so editors never have to pick one.
 */
export function CmsButton({button}: {button: ButtonView}) {
  const site = useSite();
  const keyword = button.href.toLowerCase();

  let href = button.href;
  if (keyword === 'whatsapp') {
    if (!site.whatsapp) return null;
    href = whatsappHref(site.whatsapp, site.greeting);
  } else if (keyword === 'tel') {
    if (!site.phones[0]) return null;
    href = telHref(site.phones[0].value);
  }
  const external = /^(https?:|mailto:|tel:|#)/i.test(href);
  const booking = keyword === '/contact' || keyword === '#booking';

  return (
    <ButtonLink href={href} external={external} variant={button.style}>
      {keyword === 'whatsapp' && <WhatsAppIcon className="size-5" />}
      {keyword === 'tel' && <Phone aria-hidden className="size-5" />}
      {booking && <CalendarCheck aria-hidden className="size-5" />}
      {button.label}
      {!booking && keyword !== 'whatsapp' && keyword !== 'tel' && <DirectionalArrow />}
    </ButtonLink>
  );
}
