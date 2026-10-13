import {Plus} from 'lucide-react';
import type {FaqItem} from '@/lib/types';

/**
 * Accordion built on native <details>/<summary>: zero JavaScript, keyboard and screen-reader
 * accessible by default, content always in the HTML for search engines, and exclusive
 * (one open at a time) via the shared `name` attribute.
 */
export function FaqList({items, name}: {items: FaqItem[]; name: string}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <details
          key={item.question}
          name={name}
          open={index === 0}
          data-reveal="up"
          className="faq rounded-2xl border border-white/10 bg-white/[0.04] transition-colors open:border-gold-400/40 open:bg-white/[0.07]"
        >
          <summary className="flex cursor-pointer items-center justify-between gap-6 rounded-2xl px-5 py-5 sm:px-7">
            <h3 className="text-start text-base font-semibold sm:text-lg">{item.question}</h3>
            <span
              aria-hidden
              className="faq-icon grid size-9 shrink-0 place-items-center rounded-full border border-gold-400/40 text-gold-400 transition-transform duration-300"
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="px-5 pb-6 leading-relaxed text-white/80 sm:px-7">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
