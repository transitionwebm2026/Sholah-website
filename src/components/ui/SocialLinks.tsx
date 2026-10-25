'use client';

import {useTranslations} from 'next-intl';
import {useSite} from '@/lib/cms/site-context';
import {cn} from '@/lib/utils';
import {socialIcon} from './Icons';

export function SocialLinks({className}: {className?: string}) {
  const t = useTranslations('Common');
  const site = useSite();
  const doctor = site.doctor.name || site.siteName;
  if (!site.social.length) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {site.social.map(({network, url}) => {
        const Icon = socialIcon(network);
        return (
          <li key={`${network}-${url}`}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('socialLabel', {doctor, network})}
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white/80 transition hover:-translate-y-0.5 hover:border-gold-400 hover:text-gold-300"
            >
              <Icon className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
