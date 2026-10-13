import {Phone} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {siteConfig, telHref, whatsappHref} from '@/lib/site';
import {cn} from '@/lib/utils';
import {WhatsAppIcon} from '../ui/Icons';

const button =
  'relative isolate grid size-14 place-items-center rounded-full transition duration-300 hover:scale-110 hover:-rotate-6 focus-visible:outline-offset-4';

/** Quick-contact buttons stacked in the end corner (bottom-left in Arabic): WhatsApp, then a phone call below it. */
export async function FloatingContact() {
  const t = await getTranslations('Common');
  const phone = siteConfig.phones[0];

  return (
    <div className="fixed end-5 bottom-5 z-40 flex flex-col gap-3 sm:end-7 sm:bottom-7">
      <a
        href={whatsappHref(t('whatsappGreeting'))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('whatsappChat')}
        className={cn(button, 'fx-pulse bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgb(37_211_102/0.7)]')}
      >
        <WhatsAppIcon className="size-7" />
      </a>
      <a
        href={telHref(phone.value)}
        aria-label={`${t('callNow')}: ${phone.display}`}
        className={cn(button, 'bg-gold-400 text-navy-950 shadow-gold hover:bg-gold-300')}
      >
        <Phone aria-hidden className="size-6" />
      </a>
    </div>
  );
}
