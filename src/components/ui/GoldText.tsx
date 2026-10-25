import {Fragment} from 'react';

/** Renders CMS text where words wrapped in *asterisks* are highlighted in gold. No HTML is parsed. */
export function GoldText({text}: {text: string}) {
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-gold-gradient fx-shimmer">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

/** Plain-text version (metadata, alt text, JSON-LD). */
export function stripGold(text: string) {
  return text.replace(/\*([^*]+)\*/g, '$1');
}
