import {Cairo, Montserrat} from 'next/font/google';

/*
 * Both fonts expose the same CSS variable (`--font-primary`). The locale layout applies only the
 * active locale's class to <html>, so Tailwind's `font-sans` always resolves to the right family.
 * next/font self-hosts the files and generates size-adjusted fallbacks, which keeps CLS near zero.
 *
 * To use a licensed "KO Sans" instead of Cairo, swap `Cairo(...)` for `localFont({src: ..., variable: '--font-primary'})`.
 */
export const arabicFont = Cairo({
  subsets: ['arabic'],
  variable: '--font-primary',
  display: 'swap'
});

export const englishFont = Montserrat({
  subsets: ['latin'],
  variable: '--font-primary',
  display: 'swap'
});
