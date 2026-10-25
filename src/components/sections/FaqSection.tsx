import {MessagesSquare} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {FaqList} from '@/components/ui/FaqList';
import {WhatsAppIcon} from '@/components/ui/Icons';
import {JsonLd} from '@/components/ui/JsonLd';
import {Section, type SectionTone} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {useSite} from '@/lib/cms/site-context';
import type {FaqView, HeadingView} from '@/lib/cms/views';
import {faqSchema} from '@/lib/schema';
import {whatsappHref} from '@/lib/site';

type Props = {
  id: string;
  heading: HeadingView;
  items: FaqView[];
  tone?: SectionTone;
};

/** FAQ accordion + FAQPage JSON-LD, reused on the home and services pages (Dashboard → FAQs). */
export function FaqSection({id, heading, items, tone = 'brand'}: Props) {
  const tCommon = useTranslations('Common');
  const site = useSite();
  if (!items.length) return null;

  return (
    <Section id={id} labelledBy={`${id}-title`} tone={tone}>
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              id={`${id}-title`}
              eyebrow={heading.eyebrow}
              title={heading.title}
              description={heading.description}
              align="start"
            />
            {site.whatsapp && (
              <div data-reveal className="mt-8 hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:block">
                <MessagesSquare aria-hidden className="size-8 text-gold-400" />
                <p className="mt-4 leading-relaxed text-white/80">{tCommon('faqHelp')}</p>
                <ButtonLink href={whatsappHref(site.whatsapp, site.greeting)} external variant="whatsapp" size="md" className="mt-5">
                  <WhatsAppIcon className="fx-wiggle size-4" />
                  {tCommon('whatsappChat')}
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7">
          <FaqList items={items} name={id} />
        </div>
      </Container>
      <JsonLd data={faqSchema(items)} />
    </Section>
  );
}
