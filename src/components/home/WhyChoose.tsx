import {Award, HandHeart, ScanLine, ShieldCheck} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {Container} from '@/components/ui/Container';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Step} from '@/lib/types';

const icons = [Award, ScanLine, ShieldCheck, HandHeart];

/** Section 5: four numbered selling points. */
export async function WhyChoose() {
  const t = await getTranslations('Home.why');
  const items = t.raw('items') as Step[];

  return (
    <Section id="why" labelledBy="why-title" tone="deep">
      <div aria-hidden className="absolute -top-40 start-1/2 -z-10 size-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(13_71_161/0.45),transparent_65%)] rtl:translate-x-1/2" />
      <Container>
        <SectionHeading id="why-title" eyebrow={t('eyebrow')} title={t('title')} />

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <li
                key={item.title}
                data-reveal
                className="fx-card group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 hover:border-gold-400/40 hover:bg-white/[0.07]"
              >
                <span
                  aria-hidden
                  className="fx-depth absolute -end-2 -top-4 text-8xl font-bold text-transparent opacity-40 [-webkit-text-stroke:1px_#dfa581] transition duration-500 ease-out group-hover:opacity-70"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="fx-depth grid size-14 place-items-center rounded-2xl bg-gold-400/15 text-gold-300 transition duration-500 ease-out group-hover:bg-gold-400 group-hover:text-navy-950">
                  <Icon aria-hidden className="size-7" strokeWidth={1.6} />
                </span>
                <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-white/75">{item.description}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
