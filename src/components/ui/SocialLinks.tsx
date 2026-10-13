import {getTranslations} from 'next-intl/server';
import {siteConfig} from '@/lib/site';
import {cn} from '@/lib/utils';
import {socialIcons} from './Icons';

export async function SocialLinks({className}: {className?: string}) {
  const t = await getTranslations();
  const doctor = t('Doctor.name');

  return (
    <ul className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {siteConfig.social.map(({network, href}) => {
        const Icon = socialIcons[network];
        return (
          <li key={network}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('Common.socialLabel', {doctor, network})}
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
