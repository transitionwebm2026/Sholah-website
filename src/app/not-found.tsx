import './globals.css';
import type {Metadata} from 'next';
import ar from '../../messages/ar.json';
import en from '../../messages/en.json';
import {arabicFont} from '@/lib/fonts';

/*
 * Static hosting serves a single `404.html` for every unknown URL (see `public/.htaccess`),
 * so this page is bilingual instead of being rendered per locale.
 */

/* eslint-disable @next/next/no-html-link-for-pages -- rendered as the standalone 404.html outside the
   locale layout; links intentionally do a full page load into /ar/ or /en/. */

export const metadata: Metadata = {
  title: `404 | ${ar.NotFound.title} · ${en.NotFound.title}`,
  robots: {index: false, follow: true}
};

export default function NotFound() {
  return (
    <html lang="ar" dir="rtl" className={arabicFont.variable}>
      <body className="relative grid min-h-dvh place-items-center overflow-hidden bg-brand px-4 font-sans text-white">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <main className="max-w-xl text-center">
          <p className="text-gold-gradient text-8xl font-bold sm:text-9xl">404</p>
          <h1 className="mt-6 text-3xl font-bold">{ar.NotFound.title}</h1>
          <p className="mt-3 text-lg text-white/80">{ar.NotFound.description}</p>
          <p lang="en" dir="ltr" className="mt-6 text-white/70">
            {en.NotFound.title}. {en.NotFound.description}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="/ar/" className="inline-flex min-h-12 items-center rounded-full bg-gold-400 px-6 font-semibold text-navy-950 hover:bg-gold-300">
              {ar.NotFound.back}
            </a>
            <a
              href="/en/"
              lang="en"
              className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 font-semibold hover:border-gold-400 hover:text-gold-300"
            >
              {en.NotFound.back}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
